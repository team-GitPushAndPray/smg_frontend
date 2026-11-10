import SegmentedTabs from './SegmentedTabs'

/*
 * Pestañas del historial de un equipo (Checklists, Alquileres, Mantenimiento) sobre el control segmentado común.
 * `pestanas` son las que ve el usuario (getPestanasHistorial), `activa` es el id de la pestaña y `onCambiar` recibe el
 * nuevo. Solo se monta el contenido de la activa
 */
export default function HistorialTabs({ pestanas, activa, onCambiar, children }) {
  return (
    <SegmentedTabs pestanas={pestanas} activa={activa} onCambiar={onCambiar} label="Historial del equipo">
      {children}
    </SegmentedTabs>
  )
}
