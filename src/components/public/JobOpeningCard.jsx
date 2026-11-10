import { BriefcaseBusiness } from 'lucide-react'
import { useId } from 'react'

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Vacante activa: título, descripción y requisitos (respetando los saltos de línea que cargó el panel) y "Postularme"
export default function JobOpeningCard({ vacante, onPostularme }) {
  const titleId = useId()

  return (
    <li aria-labelledby={titleId} className="glass flex flex-col gap-5 p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="icon-badge">
          <BriefcaseBusiness size={22} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="pt-2 text-xl font-semibold text-balance">
          {vacante.titulo}
        </h2>
      </div>

      <p className="leading-relaxed text-pretty whitespace-pre-line text-neutral-700 dark:text-neutral-300">
        {vacante.descripcion}
      </p>

      {vacante.requisitos && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold">Requisitos</h3>
          <p className={`text-sm leading-relaxed text-pretty whitespace-pre-line ${textMuted}`}>{vacante.requisitos}</p>
        </div>
      )}

      {/* mt-auto: en la grilla de dos columnas los botones quedan alineados abajo aunque los textos midan distinto */}
      <button type="button" onClick={() => onPostularme(vacante)} className="btn-primary mt-auto w-full sm:w-auto sm:self-start">
        Postularme
        <span className="sr-only"> a {vacante.titulo}</span>
      </button>
    </li>
  )
}

export function JobOpeningCardSkeleton() {
  return (
    <li aria-hidden="true" className="glass flex flex-col gap-5 p-5 sm:p-7">
      <div className="flex items-center gap-4">
        <span className={`size-11 ${skeletonBar}`} />
        <span className={`h-7 w-1/2 ${skeletonBar}`} />
      </div>
      <div className="flex flex-col gap-2">
        <span className={`h-5 w-full ${skeletonBar}`} />
        <span className={`h-5 w-4/5 ${skeletonBar}`} />
      </div>
      <div className="flex flex-col gap-2">
        <span className={`h-4 w-24 ${skeletonBar}`} />
        <span className={`h-4 w-3/5 ${skeletonBar}`} />
      </div>
      <span className={`h-11 w-full sm:w-36 ${skeletonBar}`} />
    </li>
  )
}
