import { ClipboardCheck, KeyRound, Wrench } from 'lucide-react'
import { getIconoChecklist } from './checklists'
import { formatHoras } from './equipos'

/*
 * Pestañas del historial de un equipo (/admin/maquinas/:id/historial?tab=checklists). `id` es el valor que va en la
 * URL; `pendiente` es el módulo del que dependen sus datos mientras no exista (se muestra un estado vacío)
 */
export const PESTANAS_HISTORIAL = Object.freeze([
  { id: 'checklists', label: 'Checklists', Icon: ClipboardCheck },
  { id: 'alquileres', label: 'Alquileres', Icon: KeyRound, pendiente: 'Alquileres' },
  { id: 'mantenimiento', label: 'Mantenimiento', Icon: Wrench, pendiente: 'Taller' },
])

// Nombre del parámetro de la URL con la pestaña activa
export const PARAM_PESTANA = 'tab'

// Pestaña de la URL; si no vino o no existe, la primera (Checklists)
export function getPestanaHistorial(valor) {
  return PESTANAS_HISTORIAL.find(({ id }) => id === valor) ?? PESTANAS_HISTORIAL[0]
}

// Checklists por página del historial
export const CHECKLISTS_POR_PAGINA = 20

/*
 * Tipos de checklist del historial, con la clave del back y el mismo nombre que ve el mecánico al elegirlo.
 * La paleta no tiene más colores: cada tipo se distingue por tono, ícono y texto. El rojo sólido queda para los
 * anormales, que es lo que tiene que saltar a la vista. El orden es el del filtro
 */
export const TIPOS_CHECKLIST = Object.freeze({
  DIARIO: {
    label: 'Revisión diaria',
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
  MANTENIMIENTO: {
    label: 'Mantenimiento',
    className: 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  },
  ENTREGA: {
    label: 'Entrega',
    className: 'bg-black text-white dark:bg-white dark:text-black',
  },
  DEVOLUCION: {
    label: 'Devolución',
    className: 'border border-neutral-400 text-neutral-800 dark:border-neutral-500 dark:text-neutral-200',
  },
})

const TIPO_DESCONOCIDO = 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300'

// Etiqueta, ícono y color de un tipo. Uno que el front no conoce se muestra tal cual, en gris
export function getTipoChecklist(tipo) {
  const config = TIPOS_CHECKLIST[tipo]
  return {
    label: config?.label ?? (tipo || 'Sin tipo'),
    className: config?.className ?? TIPO_DESCONOCIDO,
    Icon: getIconoChecklist(tipo),
  }
}

// Un checklist del listado del historial con los nombres del front
export function adaptarChecklistHistorial(row) {
  return {
    id: row?.id,
    tipo: row?.tipo ?? null,
    fecha: row?.fecha ?? null,
    horasMotor: row?.horas_motor ?? null,
    responsable: [row?.responsable_nombre, row?.responsable_apellido]
      .map((parte) => parte?.trim())
      .filter(Boolean)
      .join(' '),
    anormales: row?.cantidad_anormales ?? 0,
    fotos: row?.cantidad_fotos ?? 0,
    tieneObservaciones: row?.tiene_observaciones === true,
  }
}

/*
 * Horas de motor del checklist ("2.148 h"). Los aditamentos no tienen motor: "—", igual que si no vinieron.
 * `esMaquina` sale del equipo del historial, no del checklist
 */
export function formatHorasChecklist(horas, esMaquina) {
  return esMaquina && horas != null ? `${formatHoras(horas)} h` : '—'
}

const fechaCorta = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const horaCorta = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

// Cuándo se cargó: { fecha: "05/11/2026", hora: "14:32" }, en la hora del navegador. null si la fecha no sirve
export function formatFechaChecklist(iso) {
  const date = new Date(iso)
  if (!iso || Number.isNaN(date.getTime())) return null
  return { fecha: fechaCorta.format(date), hora: horaCorta.format(date) }
}

// Cantidad con su sustantivo: "1 anormal", "3 fotos"
export function contar(cantidad, { one, other }) {
  return `${cantidad} ${cantidad === 1 ? one : other}`
}

/*
 * Fecha del filtro tal cual la manda un <input type="date"> y la espera el back: YYYY-MM-DD de un día que existe.
 * Un año menor a 1900 es uno a medio tipear ("0020-…"), no una fecha
 */
export function esFechaFiltro(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor ?? '')) return false
  const [anio, mes, dia] = valor.split('-').map(Number)
  const date = new Date(Date.UTC(anio, mes - 1, dia))
  const existe = date.getUTCFullYear() === anio && date.getUTCMonth() === mes - 1 && date.getUTCDate() === dia
  return existe && anio >= 1900
}

// Hoy en la zona del navegador, como YYYY-MM-DD: tope de los filtros de fecha (no hay checklists del futuro)
export function getHoyFiltro() {
  const hoy = new Date()
  const dosCifras = (valor) => String(valor).padStart(2, '0')
  return `${hoy.getFullYear()}-${dosCifras(hoy.getMonth() + 1)}-${dosCifras(hoy.getDate())}`
}
