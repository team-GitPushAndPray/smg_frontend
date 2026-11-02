import { ChevronRight, ClipboardList } from 'lucide-react'
import { useChecklist } from '../../hooks/useChecklist'
import { getIconoChecklist } from '../../utils/checklists'
import EquipoSummary, { EquipoSummarySkeleton } from './EquipoSummary'
import FieldScreen from './FieldScreen'

const skeletonBar = 'animate-pulse rounded-control bg-neutral-200'

function cantidadItems(items) {
  return items.length === 1 ? '1 ítem' : `${items.length} ítems`
}

/*
 * Primer paso: el equipo y un botón grande por cada opción que mandó el back (el front no decide cuáles van).
 * Tocar una opción ya avanza al paso siguiente
 */
export default function ChecklistStart({ header }) {
  const { equipo, opciones, elegirTipo } = useChecklist()

  return (
    <FieldScreen header={header}>
      <EquipoSummary equipo={equipo} />
      <h1 className="text-2xl font-semibold text-balance">Elegí qué revisión vas a hacer</h1>

      {opciones.length === 0 ? (
        <div className="campo-card flex items-center gap-4 p-4 text-neutral-700">
          <ClipboardList size={28} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <p>Este equipo no tiene revisiones para hacer. Avisale a la oficina.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {opciones.map(({ tipo, titulo, items }) => {
            const Icon = getIconoChecklist(tipo)
            return (
              <li key={tipo}>
                <button type="button" className="campo-option" onClick={() => elegirTipo(tipo)}>
                  <span className="grid size-12 shrink-0 place-items-center rounded-control bg-brand-50 text-brand-700">
                    <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-lg font-semibold">{titulo}</span>
                    <span className="text-neutral-600">{cantidadItems(items)}</span>
                  </span>
                  <ChevronRight size={24} strokeWidth={2} aria-hidden="true" className="shrink-0 text-neutral-500" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </FieldScreen>
  )
}

// Versión de carga: la forma del encabezado y de las opciones mientras llega el equipo
export function ChecklistStartSkeleton() {
  return (
    <FieldScreen>
      <div role="status" aria-label="Cargando el equipo" className="flex flex-col gap-5">
        <EquipoSummarySkeleton />
        <span aria-hidden="true" className={`h-8 w-64 max-w-full ${skeletonBar}`} />
        <div aria-hidden="true" className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="campo-card flex min-h-18 items-center gap-4 px-4 py-3">
              <span className={`size-12 shrink-0 ${skeletonBar}`} />
              <span className="flex flex-1 flex-col gap-2">
                <span className={`h-5 w-36 ${skeletonBar}`} />
                <span className={`h-4 w-16 ${skeletonBar}`} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </FieldScreen>
  )
}
