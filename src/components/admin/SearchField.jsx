import { Search, X } from 'lucide-react'

/*
 * Campo de búsqueda sobre el fondo de la página (vidrio opaco), con ícono y una ✕ para borrarlo cuando tiene texto.
 * `icon` cambia la lupa por otro ícono (por ejemplo, una persona para el responsable). La etiqueta es solo para
 * lectores: el placeholder dice qué se busca
 */
export default function SearchField({ id, label, value, onChange, onClear, placeholder, icon: Icon = Search, clearLabel = 'Borrar búsqueda' }) {
  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="field-icon left-4" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="field-glass pr-12 pl-11"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel}
          className="interactive absolute inset-y-0 right-0 grid w-11 place-items-center rounded-control text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
