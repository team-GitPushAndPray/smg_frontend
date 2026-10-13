import { Search, X } from 'lucide-react'

// Buscador del catálogo: filtra mientras se escribe
export default function CatalogSearch({ value, onChange }) {
  return (
    <div className="relative w-full sm:max-w-md">
      <label htmlFor="catalogo-busqueda" className="sr-only">
        Buscar equipos
      </label>
      {/* z-10: el blur del campo crea su propia capa y lo taparía */}
      <Search
        size={18}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
      />
      <input
        id="catalogo-busqueda"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por tipo, marca o modelo"
        autoComplete="off"
        className="field-glass pr-12 pl-11"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Borrar búsqueda"
          className="interactive absolute inset-y-0 right-0 grid w-11 place-items-center rounded-control text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
