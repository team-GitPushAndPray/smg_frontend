import { ESTADOS_CERTIFICACION } from '../../utils/certificacion'

/** @import { EstadoCertificacion } from '../../utils/certificacion' */

const badgeBase = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'

/**
 * Estado de la certificación de una máquina (Vigente, Por vencer, Vencida, Sin cargar): ícono, texto y color, con
 * la misma forma que EstadoEquipoBadge
 * @param {{ estado: EstadoCertificacion }} props
 */
export default function CertificacionBadge({ estado }) {
  const { Icon, label, className } = ESTADOS_CERTIFICACION[estado]
  return (
    <span className={`${badgeBase} ${className}`}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  )
}
