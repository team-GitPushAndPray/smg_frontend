import { ArrowRight, Hammer, MessageCircle, Tractor } from 'lucide-react'
import { Link } from 'react-router'
import { getCotizacionUrl } from '../../utils/equipos'

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

/*
 * Tarjeta de un equipo del catálogo: tipo, marca, modelo, enlace al detalle y botón para cotizarlo por WhatsApp.
 * Toda la tarjeta lleva al detalle: el ::after de "Ver detalle" la cubre entera y "Cotizar" queda por encima (z-10).
 * El enlace no se achica al presionarlo (si cambia de tamaño, el clic se pierde); en su lugar se achica la tarjeta.
 */
export default function EquipmentCard({ id, tipo, marca, modelo, nombre, esAditamento }) {
  const Icon = esAditamento ? Hammer : Tractor

  return (
    <li className="glass relative flex flex-col gap-5 p-6 transition-[translate,scale] duration-300 ease-glass hover:-translate-y-0.5 has-[[data-detail-link]:active]:scale-[0.99]">
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
      <div className="mt-auto flex flex-col gap-2">
        <Link
          to={`/catalogo/${id}`}
          data-detail-link
          className="btn-tonal w-full after:absolute after:inset-0 after:rounded-card active:transform-none!"
        >
          Ver detalle
          <span className="sr-only">{`de ${nombre}`}</span>
          <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <a
          href={getCotizacionUrl(nombre)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary relative z-10 w-full"
        >
          <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
          Cotizar equipo
          <span className="sr-only">{`${nombre} por WhatsApp (se abre en una pestaña nueva)`}</span>
        </a>
      </div>
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
      <div className="flex flex-col gap-2">
        <span className={`h-11 w-full ${skeletonBar}`} />
        <span className={`h-11 w-full ${skeletonBar}`} />
      </div>
    </li>
  )
}
