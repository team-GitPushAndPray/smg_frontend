import { LoaderCircle, X } from 'lucide-react'

const textMuted = 'text-neutral-600 dark:text-neutral-400'

function getTitulo({ fase, actual, total }) {
  if (fase === 'buscando') return 'Buscando postulaciones para analizar…'
  if (fase === 'cancelando') return `Cancelando: termina la ${actual} de ${total} y no sigue…`
  return `Analizando ${actual} de ${total}…`
}

/**
 * Progreso de "Analizar pendientes": "Analizando 4 de 15…", la barra y Cancelar. Mientras se arma la lista, la barra
 * queda vacía; al cancelar, el botón se apaga hasta que vuelve el análisis en curso (no se corta a la mitad).
 * El texto va en una región viva para lectores de pantalla
 * @param {{
 *   progreso: { fase: 'buscando' | 'analizando' | 'cancelando', actual: number, total: number },
 *   onCancelar: () => void,
 * }} props
 */
export default function AnalisisProgreso({ progreso, onCancelar }) {
  const { fase, actual, total } = progreso
  const porcentaje = total > 0 ? Math.round((actual / total) * 100) : 0
  const cancelando = fase === 'cancelando'

  return (
    <div className="glass flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <LoaderCircle
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
            className="shrink-0 animate-spin text-brand-700 motion-reduce:animate-none dark:text-brand-300"
          />
          <p role="status" className="font-medium text-pretty text-black tabular-nums dark:text-white">
            {getTitulo(progreso)}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Progreso del análisis"
          aria-valuemin={0}
          aria-valuemax={total || 1}
          aria-valuenow={actual}
          aria-valuetext={total > 0 ? `${actual} de ${total}` : 'Preparando'}
          className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-300 ease-glass dark:bg-brand-500"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <p className={`text-xs text-pretty ${textMuted}`}>
          Se analiza una por vez, con una pausa entre cada una por el límite de consultas de la IA. Si salís de esta
          pantalla, el análisis se detiene.
        </p>
      </div>

      <button
        type="button"
        onClick={onCancelar}
        disabled={cancelando}
        className="interactive inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black sm:self-auto dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <X size={18} strokeWidth={1.75} aria-hidden="true" />
        {cancelando ? 'Cancelando…' : 'Cancelar'}
      </button>
    </div>
  )
}
