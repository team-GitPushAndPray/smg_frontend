import { ESTADOS_FILTRO_CLIENTES } from '../../hooks/useFiltrosClientes'
import SearchField from './SearchField'

const chipBase = 'interactive inline-flex min-h-11 items-center rounded-control border px-4 text-sm font-medium'
// Blanco sobre brand-600 pasa AA en ambos modos
const chipActive = 'border-brand-600 bg-brand-600 text-white'
// Sin blur: van sobre el fondo, alcanza con el vidrio opaco
const chipIdle =
  'border-(--glass-border) bg-(--glass-bg-strong) text-neutral-700 hover:border-brand-600/30 hover:text-black dark:text-neutral-300 dark:hover:border-brand-400/30 dark:hover:text-white'

/*
 * Buscador por razón social y filtro de estado (Activos / Todos, que incluye a los inactivos) de la pantalla de clientes.
 * En una fila recién desde lg: con el sidebar abierto, en tablet no entran los dos
 */
export default function ClientesToolbar({ query, onQueryChange, onQueryClear, estado, onEstadoChange }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <SearchField
          id="clientes-busqueda"
          label="Buscar clientes"
          value={query}
          onChange={onQueryChange}
          onClear={onQueryClear}
          placeholder="Buscar por razón social"
        />
      </div>

      <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {Object.entries(ESTADOS_FILTRO_CLIENTES).map(([value, { label }]) => {
          const isActive = estado === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onEstadoChange(value)}
              aria-pressed={isActive}
              className={`${chipBase} ${isActive ? chipActive : chipIdle}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
