import { PencilLine, Wrench } from 'lucide-react'
import { formatIntervaloServicio, SIN_DESCRIPCION } from '../../utils/servicios'

/** @import { EscalonServicioDetalle } from '../../types/avisos' */

const textMuted = 'text-neutral-600 dark:text-neutral-400'
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

/**
 * Tarjeta de un tipo de service: nombre, cada cuántas horas toca y su descripción ("Sin descripción" si nunca se
 * cargó). Con `onEditar` (edición en Máquinas) muestra "Editar descripción". En celular el botón va al final, a lo
 * ancho; desde sm, arriba a la derecha.
 * La descripción respeta los saltos de línea que se escribieron en el modal
 * @param {{ escalon: EscalonServicioDetalle, onEditar?: (escalon: EscalonServicioDetalle) => void }} props
 */
export default function EscalonServicioCard({ escalon, onEditar }) {
  const { nombre, horas_intervalo: horas, descripcion } = escalon

  return (
    <article className="glass grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="icon-badge">
          <Wrench size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-lg font-semibold tracking-tight break-words">{nombre}</h2>
          <p className={`text-sm tabular-nums ${textMuted}`}>{formatIntervaloServicio(horas)}</p>
        </div>
      </div>

      {onEditar && (
        <button
          type="button"
          onClick={() => onEditar(escalon)}
          aria-label={`Editar descripción de ${nombre}`}
          className="btn-tonal order-last w-full sm:order-none sm:w-auto"
        >
          <PencilLine size={18} strokeWidth={1.75} aria-hidden="true" />
          Editar descripción
        </button>
      )}

      <div className="rounded-control bg-black/5 px-4 py-3.5 sm:col-span-2 dark:bg-white/5">
        {descripcion ? (
          <p className="text-pretty break-words whitespace-pre-line text-neutral-800 dark:text-neutral-200">
            {descripcion}
          </p>
        ) : (
          <p className={`italic ${textMuted}`}>{SIN_DESCRIPCION}</p>
        )}
      </div>
    </article>
  )
}

// Versión de carga: tres tarjetas con la misma forma
export function EscalonServicioCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="glass flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className={`size-11 shrink-0 ${skeletonBar}`} />
            <div className="flex flex-1 flex-col gap-2">
              <span className={`h-4 w-36 ${skeletonBar}`} />
              <span className={`h-3.5 w-28 ${skeletonBar}`} />
            </div>
          </div>
          <span className={`h-16 w-full ${skeletonBar}`} />
        </div>
      ))}
    </div>
  )
}
