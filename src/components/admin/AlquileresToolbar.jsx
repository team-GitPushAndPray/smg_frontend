import { FilterX } from 'lucide-react'
import { useClientes } from '../../hooks/useClientes'
import { ESTADOS_ALQUILER } from '../../utils/alquileres'
import ClienteCombobox from './ClienteCombobox'
import FilterSelect from './FilterSelect'

// Todos los clientes, también los inactivos: pueden tener alquileres viejos en el historial
const FILTRO_TODOS_LOS_CLIENTES = { q: '', estado: 'todos' }

/*
 * Filtros de la pestaña Historial: estado (uno o todos) y cliente (select con búsqueda sobre GET /clientes). Se
 * aplican al momento. Los clientes se piden recién cuando se abre el Historial; si no cargan, su filtro queda
 * deshabilitado y el de estado sigue andando
 */
export default function AlquileresToolbar({ filtros, onFiltrosChange, hasFilters, onClear }) {
  const { status, clientes, isLoading, hasData } = useClientes(FILTRO_TODOS_LOS_CLIENTES)
  const clientesStatus = isLoading && !hasData ? 'loading' : status

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="grid flex-1 gap-3 sm:grid-cols-2 md:max-w-2xl">
        <FilterSelect
          id="alquileres-estado"
          label="Filtrar por estado"
          value={filtros.estado}
          onChange={(estado) => onFiltrosChange({ estado })}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_ALQUILER).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterSelect>
        <ClienteCombobox
          id="alquileres-cliente"
          label="Filtrar por cliente"
          clientes={clientes}
          status={clientesStatus}
          value={filtros.clienteId}
          onChange={(clienteId) => onFiltrosChange({ clienteId })}
        />
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
