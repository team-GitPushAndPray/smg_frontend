import { FilterX } from 'lucide-react'
import { ESTADOS_POSTULACION } from '../../utils/postulaciones'
import FilterSelect from './FilterSelect'

/** @import { FiltrosPostulaciones } from '../../types/postulaciones' */
/** @import { Vacante } from '../../types/vacantes' */

// Texto de cada vacante en el filtro: las inactivas se marcan, porque pueden tener postulaciones viejas
function vacanteLabel(vacante) {
  return vacante.activa ? vacante.titulo : `${vacante.titulo} (inactiva)`
}

/**
 * Filtros de la Bandeja: vacante (todas, activas e inactivas) y estado. Se aplican al momento y se combinan.
 * Si las vacantes no cargan, su filtro queda deshabilitado y el de estado sigue andando. Una vacante que viene en la
 * URL pero ya no está en la lista se conserva como opción, para que el select no mienta sobre lo que se está filtrando
 * @param {{
 *   filtros: FiltrosPostulaciones,
 *   onFiltrosChange: (cambios: Partial<FiltrosPostulaciones>) => void,
 *   vacantes: Vacante[],
 *   vacantesStatus: 'loading' | 'success' | 'error',
 *   hasFilters: boolean,
 *   onClear: () => void,
 * }} props
 */
export default function PostulacionesToolbar({ filtros, onFiltrosChange, vacantes, vacantesStatus, hasFilters, onClear }) {
  const vacanteValue = filtros.vacanteId === null ? '' : String(filtros.vacanteId)
  const vacanteDesconocida =
    vacantesStatus === 'success' && filtros.vacanteId !== null && !vacantes.some(({ id }) => id === filtros.vacanteId)

  let todasLabel = 'Todas las vacantes'
  if (vacantesStatus === 'loading') todasLabel = 'Cargando vacantes…'
  else if (vacantesStatus === 'error') todasLabel = 'No se pudieron cargar las vacantes'

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="grid flex-1 gap-3 sm:grid-cols-2 md:max-w-2xl">
        <FilterSelect
          id="postulaciones-vacante"
          label="Filtrar por vacante"
          value={vacanteValue}
          onChange={(valor) => onFiltrosChange({ vacanteId: valor ? Number(valor) : null })}
          disabled={vacantesStatus !== 'success'}
        >
          <option value="">{todasLabel}</option>
          {vacantes.map((vacante) => (
            <option key={vacante.id} value={vacante.id}>
              {vacanteLabel(vacante)}
            </option>
          ))}
          {vacanteDesconocida && <option value={vacanteValue}>Vacante N.º {vacanteValue}</option>}
        </FilterSelect>
        <FilterSelect
          id="postulaciones-estado"
          label="Filtrar por estado"
          value={filtros.estado}
          onChange={(estado) => onFiltrosChange({ estado })}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_POSTULACION).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterSelect>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="interactive inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black md:self-auto dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <FilterX size={18} strokeWidth={1.75} aria-hidden="true" />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
