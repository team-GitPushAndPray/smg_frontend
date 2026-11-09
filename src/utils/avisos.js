import { BellRing, CheckCheck, FileBadge, Wrench } from 'lucide-react'
import { formatFechaAlquiler, formatFechaHoraAlquiler, nombreCompleto } from './alquileres'
import { formatHoras } from './equipos'
import { formatFechaChecklist } from './historial'

/** @import { Aviso, EstadoAviso, TipoAviso } from '../types/avisos' */

/*
 * Pestañas del centro de avisos (/admin/avisos?tab=atendidos). `id` es el valor de la URL; `estado`, lo que viaja a
 * GET /avisos. La primera es la de por defecto
 */
export const PESTANAS_AVISOS = Object.freeze([
  { id: 'pendientes', label: 'Pendientes', Icon: BellRing, estado: /** @type {EstadoAviso} */ ('PENDIENTE') },
  { id: 'atendidos', label: 'Atendidos', Icon: CheckCheck, estado: /** @type {EstadoAviso} */ ('ATENDIDO') },
])

/*
 * Filtro por tipo, el mismo en las dos pestañas. La clave es el valor de la URL (?tipo=service); `tipo`, lo que viaja
 * a GET /avisos (sin él, todos); `avisos`, cómo se nombran en los estados vacíos. El orden es el de los botones
 */
export const FILTROS_TIPO_AVISO = Object.freeze({
  todos: { label: 'Todos', tipo: undefined, avisos: 'avisos' },
  service: { label: 'Service', tipo: /** @type {TipoAviso} */ ('SERVICIO'), avisos: 'avisos de service' },
  certificacion: {
    label: 'Certificación',
    tipo: /** @type {TipoAviso} */ ('CERTIFICACION'),
    avisos: 'avisos de certificación',
  },
})

/**
 * Un aviso de GET /avisos con la forma del contrato (types/avisos.js), venga como venga. Hoy el back lo manda plano:
 * `escalon`, `hito_horas` y `horas_restantes`, o `vence_el` y `dias_restantes`, sueltos en la raíz, y la máquina con
 * `marca` y `modelo` en vez de `nombre`. Se aceptan las dos formas: si el back pasa a la del contrato, sigue andando.
 * El nombre de la máquina queda como "Bobcat 1QA1" (lo que tenga de nombre, marca y modelo)
 * @param {any} data
 * @returns {Aviso}
 */
export function adaptarAviso(data) {
  const maquina = data?.maquina ?? {}
  const esServicio = data?.tipo === 'SERVICIO'
  const nombre = [maquina.nombre, maquina.marca, maquina.modelo]
    .map((valor) => (typeof valor === 'string' ? valor.trim() : valor))
    .filter(Boolean)
    .join(' ')
  const atendidoPor = data?.atendido_por

  return {
    ...data,
    maquina: {
      id: maquina.id,
      codigo_interno: maquina.codigo_interno,
      nombre: nombre || null,
      horas_motor_actual: maquina.horas_motor_actual ?? null,
    },
    servicio:
      data?.servicio ??
      (esServicio
        ? { hito_horas: data.hito_horas, escalon: data.escalon ?? null, horas_restantes: data.horas_restantes }
        : null),
    certificacion:
      data?.certificacion ??
      (data?.tipo === 'CERTIFICACION' ? { vence_el: data.vence_el, dias_restantes: data.dias_restantes } : null),
    atendido_por: atendidoPor
      ? { id: atendidoPor.id, nombre: nombreCompleto(atendidoPor.nombre, atendidoPor.apellido) || null }
      : null,
  }
}

// Ícono de cada tipo de aviso en su tarjeta
export const ICONOS_TIPO_AVISO = Object.freeze({
  SERVICIO: Wrench,
  CERTIFICACION: FileBadge,
})

// "1 h", "20 hs", "1.250 hs": la unidad que usa el taller para los services
function contarHoras(horas) {
  return `${formatHoras(horas)} ${horas === 1 ? 'h' : 'hs'}`
}

function contarDias(dias) {
  return dias === 1 ? '1 día' : `${dias} días`
}

/**
 * @typedef {{ tipo: 'vencido' | 'por-vencer', label: string }} UrgenciaAviso
 */

/**
 * Urgencia de un aviso PENDIENTE a partir de lo que falta, calculado por el back (negativo = vencido):
 * - Service: "Vencido hace 20 hs", "Vence ahora" (justo en el hito), "Falta 1 h", "Faltan 30 hs".
 * - Certificación: "Vencido hace 3 días", "Vence hoy", "Vence mañana", "Vence en 22 días".
 * En 0 ya cuenta como vencido, igual que en el back (`vencidos` del resumen y el orden). Un ATENDIDO no tiene urgencia
 * (ya se resolvió), y tampoco uno al que le falta el dato: null
 * @param {Aviso} aviso
 * @returns {UrgenciaAviso | null}
 */
export function getUrgenciaAviso(aviso) {
  if (aviso?.estado !== 'PENDIENTE') return null

  if (aviso.tipo === 'SERVICIO') {
    const horas = aviso.servicio?.horas_restantes
    if (!Number.isFinite(horas)) return null
    if (horas < 0) return { tipo: 'vencido', label: `Vencido hace ${contarHoras(-horas)}` }
    if (horas === 0) return { tipo: 'vencido', label: 'Vence ahora' }
    return { tipo: 'por-vencer', label: `${horas === 1 ? 'Falta' : 'Faltan'} ${contarHoras(horas)}` }
  }

  const dias = aviso.certificacion?.dias_restantes
  if (!Number.isFinite(dias)) return null
  if (dias < 0) return { tipo: 'vencido', label: `Vencido hace ${contarDias(-dias)}` }
  if (dias === 0) return { tipo: 'vencido', label: 'Vence hoy' }
  if (dias === 1) return { tipo: 'por-vencer', label: 'Vence mañana' }
  return { tipo: 'por-vencer', label: `Vence en ${contarDias(dias)}` }
}

/**
 * Qué pide el aviso, para su tarjeta: el título ("Service 250 hs" o "Certificación") y sus datos (el hito y las horas
 * actuales de la máquina, o la fecha de vencimiento). Un dato que no vino no se muestra
 * @param {Aviso} aviso
 * @returns {{ titulo: string, datos: { label: string, valor: string }[] }}
 */
export function describirAviso(aviso) {
  if (aviso.tipo === 'SERVICIO') {
    const { hito_horas: hito, escalon } = aviso.servicio ?? {}
    const actuales = aviso.maquina?.horas_motor_actual
    const titulo = escalon?.nombre ?? (escalon?.horas_intervalo ? `Service ${escalon.horas_intervalo} hs` : 'Service')
    const datos = []
    if (Number.isFinite(hito)) datos.push({ label: 'Hito', valor: contarHoras(hito) })
    if (Number.isFinite(actuales)) datos.push({ label: 'Horas actuales', valor: contarHoras(actuales) })
    return { titulo, datos }
  }

  const venceEl = aviso.certificacion?.vence_el
  return {
    titulo: 'Certificación',
    datos: venceEl ? [{ label: 'Vence el', valor: formatFechaAlquiler(venceEl) }] : [],
  }
}

/**
 * Quién y cuándo atendió un aviso. Sin usuario es un cierre automático (el back lo cerró solo, por ejemplo al atender
 * el service de un hito mayor de la misma máquina). `cuando` es "06/11/2026 · 15:20", o null si no vino la fecha
 * @param {Aviso} aviso
 * @returns {{ automatico: boolean, usuario: string | null, cuando: string | null, nota: string | null }}
 */
export function getAtencionAviso(aviso) {
  const usuario = aviso.atendido_por?.nombre?.trim() || null
  const nota = aviso.nota_atencion?.trim() || null
  return {
    automatico: aviso.atendido_por == null,
    usuario,
    cuando: aviso.atendido_en ? formatFechaHoraAlquiler(aviso.atendido_en) : null,
    nota,
  }
}

// Día en que se generó el aviso ("06/11/2026"), o null si la fecha no sirve
export function formatCreacionAviso(iso) {
  return formatFechaChecklist(iso)?.fecha ?? null
}
