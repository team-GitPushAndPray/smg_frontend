import { getEstadoPostulacion } from '../../utils/postulaciones'

/** @import { EstadoPostulacion } from '../../types/postulaciones' */

const badgeBase = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'

/**
 * Estado de una postulación: texto y color fijo, sin ícono (ESTADOS_POSTULACION), igual en la bandeja y en la ficha.
 * Un estado que el front no conoce se muestra tal cual, en gris
 * @param {{ estado: EstadoPostulacion | string }} props
 */
export default function EstadoPostulacionBadge({ estado }) {
  const config = getEstadoPostulacion(estado)
  if (!config) {
    return (
      <span className={`${badgeBase} bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300`}>
        {estado || 'Sin estado'}
      </span>
    )
  }

  const { label, className } = config
  return <span className={`${badgeBase} ${className}`}>{label}</span>
}
