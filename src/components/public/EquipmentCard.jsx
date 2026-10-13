import { Hammer, MessageCircle, Tractor } from 'lucide-react'
import { cotizacion } from '../../data/empresa'

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

// Tarjeta de un equipo del catálogo: tipo, marca, modelo y botón para cotizarlo por WhatsApp
export default function EquipmentCard({ tipo, marca, modelo, esAditamento }) {
  const Icon = esAditamento ? Hammer : Tractor
  const equipo = [tipo, marca, modelo].filter(Boolean).join(' ')
  const whatsappUrl = `https://wa.me/${cotizacion.whatsapp}?text=${encodeURIComponent(`${cotizacion.mensaje} ${equipo}`)}`

  return (
    <li className="glass flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="icon-badge">
          <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="truncate rounded-control bg-brand-600/10 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          {tipo}
        </span>
      </div>

      <h2 className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-lg font-semibold">{marca}</span>
        {modelo && <span className="truncate text-neutral-600 dark:text-neutral-400">{modelo}</span>}
      </h2>

      {/* mt-auto: en la grilla los botones quedan alineados aunque las tarjetas tengan distinto alto */}
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-auto w-full">
        <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
        Cotizar equipo
        <span className="sr-only">{`${equipo} por WhatsApp (se abre en una pestaña nueva)`}</span>
      </a>
    </li>
  )
}

// Marcador con la forma de la tarjeta mientras carga el catálogo
export function EquipmentCardSkeleton() {
  return (
    <li aria-hidden="true" className="glass flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <span className={`size-11 ${skeletonBar}`} />
        <span className={`h-7 w-24 ${skeletonBar}`} />
      </div>
      <div className="flex flex-col gap-2">
        <span className={`h-6 w-2/5 ${skeletonBar}`} />
        <span className={`h-5 w-3/5 ${skeletonBar}`} />
      </div>
      <span className={`h-11 w-full ${skeletonBar}`} />
    </li>
  )
}
