import { CircleHelp } from 'lucide-react'
import { ESTADOS_ITEM } from '../../utils/checklists'

const badgeBase = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap'

/*
 * Color de cada estado en el panel, con la misma lectura que en el checklist de campo: Normal en el verde de estado,
 * Anormal en rojo sólido (blanco sobre brand-600 pasa AA) y No aplica en gris. Todos pasan AA en claro y oscuro
 */
const CLASES_ESTADO = Object.freeze({
  NORMAL: 'bg-ok-50 text-ok-700 dark:bg-ok-300/15 dark:text-ok-300',
  ANORMAL: 'bg-brand-600 text-white',
  NO_APLICA: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
})

// Estado de un ítem respondido: ícono, texto y color (nunca solo el color). Uno desconocido se muestra tal cual
export default function EstadoItemBadge({ estado }) {
  const config = ESTADOS_ITEM.find(({ valor }) => valor === estado)
  const Icon = config?.icono ?? CircleHelp
  return (
    <span className={`${badgeBase} ${CLASES_ESTADO[estado] ?? CLASES_ESTADO.NO_APLICA}`}>
      <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
      {config?.etiqueta ?? (estado || 'Sin estado')}
    </span>
  )
}
