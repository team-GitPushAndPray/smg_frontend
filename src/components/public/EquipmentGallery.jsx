import { Hammer, Tractor } from 'lucide-react'

/*
 * Galería del detalle de un equipo.
 * Provisional: el back todavía no devuelve fotos, así que se muestra el ícono del tipo de equipo
 * (como en las tarjetas del catálogo). Cuando lleguen las imágenes, este componente las recibe y las muestra.
 */
export default function EquipmentGallery({ esAditamento }) {
  const Icon = esAditamento ? Hammer : Tractor

  return (
    <div aria-hidden="true" className="glass grid aspect-4/3 place-items-center">
      <span className="grid size-28 place-items-center rounded-card bg-brand-600/10 text-brand-700 sm:size-36 dark:bg-brand-500/15 dark:text-brand-400">
        <Icon size={64} strokeWidth={1.25} />
      </span>
    </div>
  )
}

// Marcador con la forma de la galería mientras carga el equipo
export function EquipmentGallerySkeleton() {
  return (
    <div aria-hidden="true" className="glass grid aspect-4/3 place-items-center">
      <span className="size-28 animate-pulse rounded-card bg-black/5 sm:size-36 dark:bg-white/10" />
    </div>
  )
}
