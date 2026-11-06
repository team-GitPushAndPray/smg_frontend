import { CalendarClock, CircleCheck, CirclePlay, CircleX, Clock, History } from 'lucide-react'

/** @import { AlquilerListado, AlquilerListadoEquipo, EstadoAlquiler } from '../types/alquileres' */

/*
 * Estados de un alquiler, con la clave tal cual la manda el back. Mismo badge en todas las pantallas.
 * La paleta no tiene ámbar ni verde: cada estado se distingue por tono, relleno e ícono, y siempre con su texto.
 * Activo es el que más resalta (relleno sólido); Pendiente, solo contorno (todavía no arrancó); Finalizado, gris;
 * Anulado, rojo apagado. El orden es el del ciclo de vida
 */
export const ESTADOS_ALQUILER = Object.freeze({
  PENDIENTE: {
    label: 'Pendiente',
    Icon: Clock,
    className: 'text-neutral-800 ring-1 ring-neutral-500 ring-inset dark:text-neutral-200 dark:ring-neutral-400',
  },
  ACTIVO: {
    label: 'Activo',
    Icon: CirclePlay,
    className: 'bg-black text-white dark:bg-white dark:text-black',
  },
  FINALIZADO: {
    label: 'Finalizado',
    Icon: CircleCheck,
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
  ANULADO: {
    label: 'Anulado',
    Icon: CircleX,
    className: 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  },
})

/**
 * Configuración del estado de un alquiler, o null si el front no lo conoce
 * @param {EstadoAlquiler | string} estado
 */
export function getEstadoAlquiler(estado) {
  return Object.hasOwn(ESTADOS_ALQUILER, estado) ? ESTADOS_ALQUILER[estado] : null
}

/**
 * Fecha de calendario de un alquiler (fecha_inicio, fecha_fin_prevista) como "06/11/2026". El back la manda como ISO a
 * medianoche UTC: se leen los primeros 10 caracteres, sin pasar por `new Date()`, que en Argentina la corre un día para
 * atrás. Devuelve "—" si no vino o no tiene la forma aaaa-mm-dd
 * @param {string | null | undefined} valor
 * @returns {string}
 */
export function formatFechaAlquiler(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor ?? '')
  if (!partes) return '—'
  const [, anio, mes, dia] = partes
  return `${dia}/${mes}/${anio}`
}

// Días antes de la fecha de fin en que un alquiler ACTIVO pasa a "por vencer". Es el DIAS_POR_VENCER del back
export const DIAS_POR_VENCER = 7

const MS_POR_DIA = 24 * 60 * 60 * 1000

/**
 * Días de calendario que faltan desde `hoy` (en la zona del navegador) hasta una fecha de alquiler: 0 si es hoy,
 * negativo si ya pasó. Igual que formatFechaAlquiler, la fecha se lee de los primeros 10 caracteres para no correrla
 * de día. null si no tiene la forma aaaa-mm-dd
 * @param {string | null | undefined} valor
 * @param {Date} [hoy]
 * @returns {number | null}
 */
export function diasHastaFecha(valor, hoy = new Date()) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor ?? '')
  if (!partes) return null
  const [, anio, mes, dia] = partes.map(Number)
  const fecha = Date.UTC(anio, mes - 1, dia)
  const base = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.round((fecha - base) / MS_POR_DIA)
}

function contarDias(dias) {
  return dias === 1 ? '1 día' : `${dias} días`
}

/**
 * @typedef {{ tipo: 'vencido' | 'por-vencer', label: string }} Vencimiento
 */

/**
 * Aviso de vencimiento de un alquiler, con las mismas reglas que la pestaña "Por vencer" del back: solo los ACTIVOS
 * cuya fecha de fin ya pasó ("Vencido hace 2 días") o llega en DIAS_POR_VENCER días o menos ("Vence hoy",
 * "Vence mañana", "Vence en 3 días"). Cualquier otro (más lejos, o PENDIENTE, FINALIZADO o ANULADO), null
 * @param {Pick<AlquilerListado, 'estado' | 'fecha_fin_prevista'>} alquiler
 * @param {Date} [hoy]
 * @returns {Vencimiento | null}
 */
export function getVencimiento(alquiler, hoy) {
  if (alquiler?.estado !== 'ACTIVO') return null
  const dias = diasHastaFecha(alquiler.fecha_fin_prevista, hoy)
  if (dias === null || dias > DIAS_POR_VENCER) return null
  if (dias < 0) return { tipo: 'vencido', label: `Vencido hace ${contarDias(-dias)}` }
  if (dias === 0) return { tipo: 'por-vencer', label: 'Vence hoy' }
  if (dias === 1) return { tipo: 'por-vencer', label: 'Vence mañana' }
  return { tipo: 'por-vencer', label: `Vence en ${contarDias(dias)}` }
}

// Equipos que se nombran en el listado antes de resumir el resto como "+N"
const EQUIPOS_VISIBLES = 2

/**
 * Códigos internos de los equipos de un alquiler para una celda del listado: hasta dos, separados por coma
 * ("MC-01, MC-02"); con más, el primero y cuántos quedan ("MC-01 +3"). `completo` los tiene a todos, para el title
 * y los lectores de pantalla
 * @param {AlquilerListadoEquipo[] | null | undefined} equipos
 * @returns {{ texto: string, completo: string }}
 */
export function resumirEquipos(equipos) {
  const codigos = (equipos ?? []).map((equipo) => equipo?.codigo_interno).filter(Boolean)
  if (codigos.length === 0) return { texto: '—', completo: '' }
  const completo = codigos.join(', ')
  if (codigos.length <= EQUIPOS_VISIBLES) return { texto: completo, completo }
  return { texto: `${codigos[0]} +${codigos.length - 1}`, completo }
}

/*
 * Pestañas del listado de alquileres (/admin/alquileres?tab=por-vencer). `id` es el valor que va en la URL; la primera
 * es la que se ve al entrar
 */
export const PESTANAS_ALQUILERES = Object.freeze([
  { id: 'activos', label: 'Activos', Icon: CirclePlay },
  { id: 'por-vencer', label: 'Por vencer', Icon: CalendarClock },
  { id: 'historial', label: 'Historial', Icon: History },
])

// Estados que trae la pestaña Activos: los que todavía no terminaron
export const ESTADOS_EN_CURSO = Object.freeze(['PENDIENTE', 'ACTIVO'])

// Alquileres por página del listado (el back los manda todos: se pagina en el front)
export const ALQUILERES_POR_PAGINA = 10

// Tipos de checklist de un equipo alquilado: el `?tipo=` de la ruta y del GET del formulario
export const TIPOS_CHECKLIST_ALQUILER = Object.freeze({
  ENTREGA: 'Entrega',
  DEVOLUCION: 'Devolución',
})

/**
 * Link a Google Maps de una ubicación, para abrir en pestaña nueva. Devuelve null si falta alguna coordenada o no es un
 * número (así el que lo usa no arma un link roto)
 * @param {number | string | null | undefined} lat
 * @param {number | string | null | undefined} lng
 * @returns {string | null}
 */
export function linkMaps(lat, lng) {
  if (lat == null || lng == null || lat === '' || lng === '') return null
  const latitud = Number(lat)
  const longitud = Number(lng)
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return null
  return `https://www.google.com/maps?q=${latitud},${longitud}`
}
