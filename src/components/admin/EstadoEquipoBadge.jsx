import { getEstadoEquipo } from '../../utils/equipos'

const badgeBase = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'

// Estado de un equipo: ícono, texto y color. Un estado que el front no conoce se muestra tal cual, en gris
export default function EstadoEquipoBadge({ estado }) {
  const config = getEstadoEquipo(estado)
  if (!config) {
    return (
      <span className={`${badgeBase} bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300`}>
        {estado || 'Sin estado'}
      </span>
    )
  }

  const { Icon, label, className } = config
  return (
    <span className={`${badgeBase} ${className}`}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  )
}
