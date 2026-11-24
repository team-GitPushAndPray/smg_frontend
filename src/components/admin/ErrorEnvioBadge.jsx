import { CircleAlert } from 'lucide-react'
import GloboDetalle from './GloboDetalle'

/**
 * Badge "Error" de un envío fallido. El detalle del error (lo que respondió Telegram o el servidor de correo) aparece
 * en un globo al pasar el mouse, y al tocarlo o hacerle clic queda fijo hasta tocar afuera, Escape o hacer scroll.
 * El globo se alinea al borde derecho del badge: el Estado va a la derecha de la fila y de la tarjeta
 * @param {{ detalle: string | null, className?: string }} props
 */
export default function ErrorEnvioBadge({ detalle, className = '' }) {
  const texto = detalle?.trim() || 'El canal no informó el motivo.'

  return (
    <GloboDetalle titulo="Detalle del error" texto={texto} ariaLabel="Error: ver el detalle" className={className}>
      {(abierto) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white transition-colors duration-200 ease-glass group-hover:bg-brand-700 ${abierto ? 'bg-brand-700' : ''}`}
        >
          <CircleAlert size={14} strokeWidth={2.25} aria-hidden="true" />
          Error
        </span>
      )}
    </GloboDetalle>
  )
}
