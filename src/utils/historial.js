import { ClipboardCheck, KeyRound, Wrench } from 'lucide-react'

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
