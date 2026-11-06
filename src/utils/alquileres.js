import { CalendarClock, CircleCheck, CirclePlay, CircleX, Clock, History } from 'lucide-react'
import { formatFechaChecklist } from './historial'
import { normalizeText } from './text'
import { getErrorGenerico } from './usuarios'

/**
 * @import {
 *   AlquilerEquipo, AlquilerListado, AlquilerListadoEquipo, EstadoAlquiler, FormularioChecklistAlquiler,
 *   TipoChecklistAlquiler,
 * } from '../types/alquileres'
 */

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

// ── Detalle de un alquiler ───────────────────────────────────────────────────

// Tipo de un equipo del alquiler, con la clave tal cual la manda el back
export const TIPOS_EQUIPO_ALQUILER = Object.freeze({
  MAQUINA: 'Máquina',
  ADITAMENTO: 'Aditamento',
})

/**
 * Si el alquiler todavía admite checklists de entrega y devolución: solo mientras está en curso (PENDIENTE o ACTIVO).
 * FINALIZADO y ANULADO, o un estado que el front no conoce, no
 * @param {EstadoAlquiler | string | null | undefined} estado
 */
export function admiteChecklists(estado) {
  return ESTADOS_EN_CURSO.includes(estado)
}

/**
 * Qué checklist se puede completar sobre un equipo del alquiler: la entrega si todavía no se hizo y la devolución solo
 * después de la entrega y si todavía no se hizo. Ninguno sin edición en Alquileres o si el alquiler ya no está en curso
 * @param {AlquilerEquipo} equipo
 * @param {{ estado: EstadoAlquiler | string, puedeEditar: boolean }} contexto
 * @returns {{ entrega: boolean, devolucion: boolean }}
 */
export function getAccionesEquipo(equipo, { estado, puedeEditar }) {
  if (!puedeEditar || !admiteChecklists(estado)) return { entrega: false, devolucion: false }
  return {
    entrega: !equipo.entrega,
    devolucion: Boolean(equipo.entrega) && !equipo.devolucion,
  }
}

// ── Checklist de entrega / devolución ────────────────────────────────────────

/**
 * Si el `?tipo=` de la ruta del checklist es uno que existe (ENTREGA o DEVOLUCION, tal cual)
 * @param {string | null | undefined} tipo
 * @returns {tipo is TipoChecklistAlquiler}
 */
export function esTipoChecklistAlquiler(tipo) {
  return Object.hasOwn(TIPOS_CHECKLIST_ALQUILER, tipo ?? '')
}

/**
 * Clave del borrador del checklist de un equipo alquilado en localStorage: queda checklist:alquiler:<id>:<equipoId>:<tipo>
 * (ver guardarBorrador en utils/checklists.js), aparte de los borradores del QR
 * @param {number | string} id
 * @param {number | string} equipoId
 */
export function claveChecklistAlquiler(id, equipoId) {
  return `alquiler:${id}:${equipoId}`
}

/**
 * Respuesta de GET /alquileres/:id/equipos/:equipoId/checklist?tipo= con la forma que usa el asistente de campo
 * (ChecklistProvider): el equipo en camelCase como en el QR y una sola opción, la del `tipo` pedido, titulada "Entrega" o
 * "Devolución" (el nombre de la plantilla, "Alquiler — Máquina", no dice qué se está haciendo). `alquiler` es el contexto
 * de solo lectura del encabezado
 * @param {FormularioChecklistAlquiler} data
 * @param {TipoChecklistAlquiler} tipo
 */
export function adaptarFormularioChecklistAlquiler(data, tipo) {
  const equipo = data?.equipo ?? {}
  const alquiler = data?.alquiler ?? {}
  const esMaquina = equipo.tipo === 'MAQUINA'
  const items = Array.isArray(data?.plantilla?.items) ? data.plantilla.items : []
  return {
    equipo: {
      codigoInterno: equipo.codigo_interno ?? '',
      categoria: equipo.categoria ?? '',
      marca: null,
      esMaquina,
      tipo: esMaquina ? 'maquina' : 'aditamento',
      horasMotorActual: esMaquina ? (equipo.horas_motor_actual ?? null) : null,
      horasActualizadasEn: null,
    },
    opciones: [{ tipo, titulo: TIPOS_CHECKLIST_ALQUILER[tipo], items }],
    alquiler: {
      id: alquiler.id ?? null,
      cliente: alquiler.cliente_razon_social ?? '',
      ubicacion: alquiler.ubicacion_referencia ?? '',
      fechaInicio: alquiler.fecha_inicio ?? null,
      fechaFin: alquiler.fecha_fin_prevista ?? null,
    },
  }
}

/*
 * Por qué no se puede hacer el checklist (409 del GET o del POST), en palabras del usuario. El back avisa: "Este equipo
 * ya cuenta con un checklist de entrega registrado", "No se puede realizar la devolución de un equipo sin entrega previa"
 * o "El alquiler no se encuentra en estado PENDIENTE o ACTIVO". Un mensaje que no se reconoce se muestra como llega
 */
const CONFLICTOS_CHECKLIST = [
  { patron: /ya cuenta con un checklist de entrega/i, texto: 'La entrega de este equipo ya se registró.' },
  { patron: /ya cuenta con un checklist de devoluci[oó]n/i, texto: 'La devolución de este equipo ya se registró.' },
  { patron: /sin entrega previa/i, texto: 'Este equipo todavía no se entregó: primero hay que completar la entrega.' },
  { patron: /no se encuentra en estado/i, texto: 'Este alquiler ya no está en curso: no admite entregas.' },
]

/**
 * Aviso de pantalla completa para un 409 del checklist: { titulo, descripcion }
 * @param {TipoChecklistAlquiler} tipo
 * @param {string | null | undefined} mensaje El message del back
 */
export function getConflictoChecklistAlquiler(tipo, mensaje) {
  const conocido = CONFLICTOS_CHECKLIST.find(({ patron }) => patron.test(mensaje ?? ''))
  return {
    titulo: tipo === 'DEVOLUCION' ? 'No se puede completar la devolución' : 'No se puede completar la entrega',
    descripcion: conocido?.texto ?? mensaje ?? 'Revisá el detalle del alquiler.',
  }
}

/**
 * Aviso de éxito al volver al detalle: "Entrega de MC-01 registrada"
 * @param {TipoChecklistAlquiler} tipo
 * @param {string} codigoInterno
 */
export function textoChecklistRegistrado(tipo, codigoInterno) {
  return `${TIPOS_CHECKLIST_ALQUILER[tipo]} de ${codigoInterno} registrada`
}

/**
 * Un timestamp del back (alta del alquiler, fecha de un checklist) en la hora del navegador: "05/11/2026 · 14:32".
 * "—" si no vino o no es una fecha
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export function formatFechaHoraAlquiler(iso) {
  const partes = formatFechaChecklist(iso)
  return partes ? `${partes.fecha} · ${partes.hora}` : '—'
}

/**
 * Nombre y apellido de una persona en una línea ("Juan Pérez"); '' si no vino ninguno
 * @param {string | null | undefined} nombre
 * @param {string | null | undefined} apellido
 */
export function nombreCompleto(nombre, apellido) {
  return [nombre, apellido]
    .map((valor) => valor?.trim())
    .filter(Boolean)
    .join(' ')
}

/**
 * Cuántos equipos del alquiler ya se entregaron y cuántos ya volvieron
 * @param {AlquilerEquipo[] | null | undefined} equipos
 * @returns {{ entregados: number, devueltos: number, total: number }}
 */
export function contarChecklistsEquipos(equipos) {
  const lista = equipos ?? []
  return {
    entregados: lista.filter((equipo) => equipo.entrega).length,
    devueltos: lista.filter((equipo) => equipo.devolucion).length,
    total: lista.length,
  }
}

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

// ── Alta de un alquiler ──────────────────────────────────────────────────────

/**
 * Fecha de calendario 'aaaa-mm-dd' de un Date en la zona del navegador (la que usan los input date y el back). No usa
 * toISOString(), que la pasa a UTC y de noche en Argentina da el día siguiente
 * @param {Date} [fecha]
 * @returns {string}
 */
export function fechaCalendario(fecha = new Date()) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

/**
 * Días de calendario que dura un alquiler, contando el de inicio y el de fin (del 6 al 6 es 1 día). null si alguna
 * fecha falta o el fin es anterior
 * @param {string} inicio 'aaaa-mm-dd'
 * @param {string} fin 'aaaa-mm-dd'
 * @returns {number | null}
 */
export function duracionAlquiler(inicio, fin) {
  const desde = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inicio ?? '')
  const hasta = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fin ?? '')
  if (!desde || !hasta) return null
  const dias = Math.round((Date.UTC(hasta[1], hasta[2] - 1, hasta[3]) - Date.UTC(desde[1], desde[2] - 1, desde[3])) / MS_POR_DIA)
  return dias < 0 ? null : dias + 1
}

// Mismos máximos que el DTO del alta en el back
export const MAX_CONTACTO_OBRA = { nombre: 100, telefono: 50 }

export const ERROR_FIN_ANTERIOR = 'La fecha de fin no puede ser anterior a la de inicio.'

/**
 * Lo que el formulario de alta no deja enviar, por campo (vacío si está todo bien): cliente, al menos un equipo, las
 * dos fechas con el fin igual o posterior al inicio. La ubicación se valida aparte, con validarUbicacion
 * @param {{ clienteId: number | null, equipos: unknown[], fecha_inicio: string, fecha_fin_prevista: string }} valores
 * @returns {{ cliente?: string, equipos?: string, fecha_inicio?: string, fecha_fin_prevista?: string }}
 */
export function validarAltaAlquiler({ clienteId, equipos, fecha_inicio, fecha_fin_prevista }) {
  const errores = {}
  if (!clienteId) errores.cliente = 'Elegí el cliente.'
  if (equipos.length === 0) errores.equipos = 'Elegí al menos un equipo.'
  if (!fecha_inicio) errores.fecha_inicio = 'Ingresá la fecha de inicio.'
  if (!fecha_fin_prevista) errores.fecha_fin_prevista = 'Ingresá la fecha de fin prevista.'
  else if (fecha_inicio && fecha_fin_prevista < fecha_inicio) errores.fecha_fin_prevista = ERROR_FIN_ANTERIOR
  return errores
}

/**
 * Códigos internos que nombra el 409 del alta ("Los siguientes equipos no están disponibles para alquilar: MC-01,
 * AD-03"). Vacío si el mensaje no los trae (el de dos altas simultáneas no dice cuáles)
 * @param {string | null | undefined} mensaje
 * @returns {string[]}
 */
export function codigosNoDisponibles(mensaje) {
  const partes = /no est[aá]n disponibles[^:]*:\s*(.+)$/i.exec(mensaje ?? '')
  if (!partes) return []
  return partes[1]
    .split(',')
    .map((codigo) => codigo.trim().replace(/\.$/, ''))
    .filter(Boolean)
}

/**
 * Equipos que coinciden con lo buscado en el código interno o la categoría, sin importar mayúsculas ni tildes
 * @param {Array<{ codigoInterno: string, categoria?: { nombre?: string } | null }>} equipos
 * @param {string} busqueda
 */
export function filtrarEquipos(equipos, busqueda) {
  const texto = normalizeText(busqueda)
  if (!texto) return equipos
  return equipos.filter(
    (equipo) =>
      normalizeText(equipo.codigoInterno).includes(texto) || normalizeText(equipo.categoria?.nombre).includes(texto),
  )
}

// ── Acciones sobre un alquiler: prórroga, cambio de ubicación y anulación ────

/*
 * Las únicas tres cosas que se pueden cambiar de un alquiler ya creado (el resto es inmutable, el back rechaza
 * cualquier otro campo). Las tres exigen edición en Alquileres
 */
export const ACCIONES_ALQUILER = Object.freeze({
  PRORROGAR: 'prorrogar',
  UBICACION: 'ubicacion',
  ANULAR: 'anular',
})

/**
 * Qué acciones muestra el encabezado del detalle: prorrogar y cambiar ubicación mientras está en curso (PENDIENTE o
 * ACTIVO); anular, solo PENDIENTE (un pendiente nunca tiene entregas: la primera lo pasa a ACTIVO). Ninguna sin edición
 * o con el alquiler FINALIZADO o ANULADO
 * @param {EstadoAlquiler | string | null | undefined} estado
 * @param {boolean} puedeEditar
 * @returns {{ prorrogar: boolean, ubicacion: boolean, anular: boolean }}
 */
export function getAccionesAlquiler(estado, puedeEditar) {
  if (!puedeEditar) return { prorrogar: false, ubicacion: false, anular: false }
  const enCurso = ESTADOS_EN_CURSO.includes(estado)
  return { prorrogar: enCurso, ubicacion: enCurso, anular: estado === 'PENDIENTE' }
}

/**
 * Fecha de calendario de un alquiler tal cual la manda el back (ISO a medianoche UTC) como 'aaaa-mm-dd', para un input
 * date o para compararla con otra. Toma los primeros 10 caracteres, igual que formatFechaAlquiler. '' si no tiene la forma
 * @param {string | null | undefined} valor
 * @returns {string}
 */
export function fechaCalendarioAlquiler(valor) {
  return /^(\d{4}-\d{2}-\d{2})/.exec(valor ?? '')?.[1] ?? ''
}

export const ERROR_SIN_FECHA_FIN = 'Elegí la nueva fecha de fin.'

/**
 * Error de la nueva fecha de fin de una prórroga ('' si está bien): obligatoria y no anterior al inicio, como el back
 * @param {string} fecha 'aaaa-mm-dd'
 * @param {string} inicio 'aaaa-mm-dd'
 */
export function validarProrroga(fecha, inicio) {
  if (!fecha) return ERROR_SIN_FECHA_FIN
  if (inicio && fecha < inicio) return ERROR_FIN_ANTERIOR
  return ''
}

// Máximo del motivo de anulación (AnularAlquilerDto del back)
export const MAX_MOTIVO_ANULACION = 500

export const ERROR_SIN_MOTIVO = 'Escribí el motivo de la anulación.'

const ERROR_ALQUILER_INEXISTENTE = 'Este alquiler ya no existe.'
const ERROR_NO_ANULABLE =
  'Ya no se puede anular: solo se anulan los alquileres pendientes y sin entregas. Revisá el detalle actualizado.'

/**
 * Mensaje para un error de prorrogar, cambiar ubicación o anular. 400: lo que dice la validación del back. 404: que el
 * alquiler ya no existe. 409: por qué el estado no lo admite, en palabras del usuario (el back nombra el estado con su
 * clave: "No se puede modificar un alquiler en estado FINALIZADO"). null en 401 y 403, que ya avisó apiFetch
 * @param {{ status?: number, message?: string, data?: any }} error
 * @returns {string | null}
 */
export function getErrorAccionAlquiler(error) {
  if (error.status === 400) {
    const mensajes = error.data?.message
    return Array.isArray(mensajes) ? mensajes.join('. ') : error.message
  }
  if (error.status === 404) return ERROR_ALQUILER_INEXISTENTE
  if (error.status === 409) {
    if (/anular/i.test(error.message ?? '')) return ERROR_NO_ANULABLE
    const estado = getEstadoAlquiler(/estado\s+(\w+)/i.exec(error.message ?? '')?.[1] ?? '')
    if (estado) {
      return `Este alquiler está ${estado.label.toLowerCase()}: ya no admite cambios. Revisá el detalle actualizado.`
    }
    return error.message
  }
  return getErrorGenerico(error)
}
