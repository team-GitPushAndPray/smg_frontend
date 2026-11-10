import { Search, X } from 'lucide-react'

// Opciones del filtro por estado: `value` es el que guarda la página
const FILTROS_ESTADO = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
]

const chipBase = 'interactive inline-flex min-h-11 items-center gap-2 rounded-control border px-4 text-sm font-medium'
// Blanco sobre brand-600 pasa AA en ambos modos
const chipActive = 'border-brand-600 bg-brand-600 text-white'
// Sin blur: van sobre el fondo, alcanza con el vidrio opaco
const chipIdle =
  'border-(--glass-border) bg-(--glass-bg-strong) text-neutral-700 hover:border-brand-600/30 hover:text-black dark:text-neutral-300 dark:hover:border-brand-400/30 dark:hover:text-white'

// Buscador por nombre o email y filtro por estado, con la cantidad de usuarios de cada uno.
// En una fila recién desde lg: con el sidebar abierto, en tablet no entran los dos
export default function UsersToolbar({ query, onQueryChange, estado, onEstadoChange, counts }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <label htmlFor="usuarios-busqueda" className="sr-only">
          Buscar usuarios
        </label>
        {/* z-10: el blur del campo crea su propia capa y lo taparía */}
        <Search
          size={18}
          strokeWidth={1.75}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
        />
        <input
          id="usuarios-busqueda"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por nombre o email"
          autoComplete="off"
          className="field-glass pr-12 pl-11"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Borrar búsqueda"
            className="interactive absolute inset-y-0 right-0 grid w-11 place-items-center rounded-control text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </div>

      <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {FILTROS_ESTADO.map(({ value, label }) => {
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
              <span className={`tabular-nums ${isActive ? '' : 'text-neutral-600 dark:text-neutral-400'}`}>
                {counts[value]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
