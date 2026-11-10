import { CircleDashed, Clock, ShieldCheck, TriangleAlert } from 'lucide-react'
import { diasHastaFecha, fechaCalendarioAlquiler, formatFechaAlquiler } from './alquileres'

/*
 * Certificación de una máquina (certificacionVenceEl del listado y el detalle de equipos). El back la manda como ISO a
 * medianoche UTC ('2026-11-29T00:00:00.000Z'): se lee con los helpers de fechas de calendario de alquileres, que toman
 * los primeros 10 caracteres sin pasar por `new Date()` (en Argentina la correría un día para atrás).
 * Al editarla viaja como `certificacion_vence_el` ('aaaa-mm-dd' o null) en el PATCH /equipos/:id; el POST no la acepta
 */

// Días antes del vencimiento en que la certificación pasa a "por vencer". Es el AVISO_ANTICIPACION_DIAS del back
export const DIAS_CERTIFICACION_POR_VENCER = 30

/*
 * Estados del indicador. La paleta no tiene verde ni amarillo: cada uno se distingue por tono, ícono y texto (nunca
 * solo el color). Vigente va en negro, como "Disponible"; vencida, en rojo lleno, lo que tiene que saltar a la vista
 */
export const ESTADOS_CERTIFICACION = Object.freeze({
  vigente: {
    label: 'Vigente',
    Icon: ShieldCheck,
    className: 'bg-black text-white dark:bg-white dark:text-black',
  },
  'por-vencer': {
    label: 'Por vencer',
    Icon: Clock,
    className: 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  },
  vencida: {
    label: 'Vencida',
    Icon: TriangleAlert,
    className: 'bg-brand-600 text-white',
  },
  'sin-cargar': {
    label: 'Sin cargar',
    Icon: CircleDashed,
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
})

function contarDias(dias) {
  return dias === 1 ? '1 día' : `${dias} días`
}

/**
 * @typedef {'vigente' | 'por-vencer' | 'vencida' | 'sin-cargar'} EstadoCertificacion
 * @typedef {{ estado: EstadoCertificacion, fecha: string | null, detalle: string | null }} Certificacion
 */

/**
 * Estado de la certificación de una máquina: vigente si faltan más de 30 días, por vencer con 30 o menos (hoy
 * incluido), vencida si la fecha ya pasó y sin cargar si vino null (o con una forma que no se entiende).
 * `fecha` es "29/11/2026" y `detalle`, cuánto falta o hace cuánto venció ("Vence en 12 días", "Venció hace 3 días");
 * null cuando no hay fecha o está vigente
 * @param {string | null | undefined} venceEl
 * @param {Date} [hoy]
 * @returns {Certificacion}
 */
export function getCertificacion(venceEl, hoy = new Date()) {
  const dias = diasHastaFecha(venceEl, hoy)
  if (dias == null) return { estado: 'sin-cargar', fecha: null, detalle: null }

  const fecha = formatFechaAlquiler(venceEl)
  if (dias < 0) return { estado: 'vencida', fecha, detalle: `Venció hace ${contarDias(-dias)}` }
  if (dias > DIAS_CERTIFICACION_POR_VENCER) return { estado: 'vigente', fecha, detalle: null }

  let detalle = `Vence en ${contarDias(dias)}`
  if (dias === 0) detalle = 'Vence hoy'
  else if (dias === 1) detalle = 'Vence mañana'
  return { estado: 'por-vencer', fecha, detalle }
}

/**
 * Fecha guardada como 'aaaa-mm-dd' para el input date del formulario, o '' si no tiene
 * @param {string | null | undefined} venceEl
 */
export function getFechaCertificacionInput(venceEl) {
  return fechaCalendarioAlquiler(venceEl)
}

/**
 * Error del campo de vencimiento ('' si está bien). Vacío es válido (se guarda null); un input date a medio
 * completar llega vacío pero con `badInput`, y un año de más de 4 dígitos no tiene la forma aaaa-mm-dd
 * @param {string} valor
 * @param {boolean} incompleta
 */
export function validarFechaCertificacion(valor, incompleta) {
  if (incompleta) return 'Completá la fecha o dejala vacía.'
  if (valor && !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return 'Ingresá una fecha válida.'
  return ''
}
