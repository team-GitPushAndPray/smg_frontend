import { PESTANAS_HISTORIAL } from '../../utils/historial'
import SegmentedTabs from './SegmentedTabs'

/*
 * Pestañas del historial de un equipo (Checklists, Alquileres, Mantenimiento) sobre el control segmentado común.
 * `activa` es el id de la pestaña y `onCambiar` recibe el nuevo. Solo se monta el contenido de la activa
 */
export default function HistorialTabs({ activa, onCambiar, children }) {
  return (
    <SegmentedTabs pestanas={PESTANAS_HISTORIAL} activa={activa} onCambiar={onCambiar} label="Historial del equipo">
      {children}
    </SegmentedTabs>
  )
}
