import { FilterX } from 'lucide-react'
import { ESTADOS_EQUIPO, TIPOS_EQUIPO } from '../../utils/equipos'
import FilterSelect from './FilterSelect'
import SearchField from './SearchField'

// Switch con el acento cuando está prendido. El gris de apagado (neutral-500) pasa 3:1 sobre el fondo en ambos modos
function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="interactive inline-flex min-h-11 shrink-0 items-center gap-3 rounded-control px-1 text-sm font-medium text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
    >
      <span
        aria-hidden="true"
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ease-glass ${checked ? 'bg-brand-600' : 'bg-neutral-500'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-(--segment-active-shadow) transition-transform duration-200 ease-glass ${checked ? 'translate-x-4' : ''}`}
        />
      </span>
      {label}
    </button>
  )
}

/*
 * Buscador y filtros del inventario: tipo, estado, categoría y el switch de equipos dados de baja.
 * `query` es lo que está escrito (la búsqueda se aplica con espera desde la página); el resto se aplica al momento.
 * Si las categorías no cargan, su filtro queda deshabilitado y el resto sigue andando
 */
export default function InventarioToolbar({
  query,
  onQueryChange,
  onQueryClear,
  filtros,
  onFiltrosChange,
  categorias,
  categoriasStatus,
  hasFilters,
  onClear,
}) {
  const categoriaLabel = {
    loading: 'Cargando categorías…',
    error: 'Categorías no disponibles',
    success: 'Todas las categorías',
  }[categoriasStatus]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="w-full xl:max-w-xs">
          <SearchField
            id="inventario-busqueda"
            label="Buscar equipos"
            value={query}
            onChange={onQueryChange}
            onClear={onQueryClear}
            placeholder="Buscar en el inventario"
          />
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <FilterSelect
            id="inventario-tipo"
            label="Filtrar por tipo"
            value={filtros.tipo}
            onChange={(tipo) => onFiltrosChange({ tipo })}
          >
            <option value="">Todos los tipos</option>
            {Object.entries(TIPOS_EQUIPO).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            id="inventario-estado"
            label="Filtrar por estado"
            value={filtros.estado}
            onChange={(estado) => onFiltrosChange({ estado })}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS_EQUIPO).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            id="inventario-categoria"
            label="Filtrar por categoría"
            value={filtros.categoriaId ?? ''}
            onChange={(categoriaId) => onFiltrosChange({ categoriaId: categoriaId ? Number(categoriaId) : null })}
            disabled={categoriasStatus !== 'success'}
          >
            <option value="">{categoriaLabel}</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Switch
          checked={filtros.bajas}
          onChange={(bajas) => onFiltrosChange({ bajas })}
          label="Ver dados de baja"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="interactive inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FilterX size={18} strokeWidth={1.75} aria-hidden="true" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
