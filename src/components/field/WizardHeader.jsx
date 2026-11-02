import { ChevronLeft } from 'lucide-react'

/*
 * Encabezado del asistente: "Atrás" chico arriba a la izquierda (no en el primer paso), "Paso X de N" y la barra
 * de progreso, para que el mecánico siempre sepa cuánto le falta
 */
export default function WizardHeader({ numero, total, onAtras }) {
  const porcentaje = Math.round((numero / total) * 100)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-12 items-center justify-between gap-4">
        {onAtras ? (
          <button
            type="button"
            onClick={onAtras}
            className="interactive -ml-2 inline-flex min-h-12 min-w-12 items-center gap-1 rounded-control px-2 font-medium text-neutral-700 hover:text-black"
          >
            <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
            Atrás
          </button>
        ) : (
          <span />
        )}
        <p className="font-medium text-neutral-700">
          Paso {numero} de {total}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso del checklist"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={numero}
        aria-valuetext={`Paso ${numero} de ${total}`}
        className="h-2 overflow-hidden rounded-full bg-neutral-300"
      >
        <div
          className="ease-glass h-full rounded-full bg-brand-700 transition-[width] duration-300"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}
