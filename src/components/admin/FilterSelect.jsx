import { ChevronDown } from 'lucide-react'

// Select de filtro sobre el fondo de la página: mismo vidrio opaco que el buscador. La etiqueta es solo para lectores
export default function FilterSelect({ id, label, value, onChange, disabled, children }) {
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="field-glass appearance-none truncate pr-11 pl-3.5 disabled:opacity-60"
      >
        {children}
      </select>
      <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" className="field-icon right-3.5" />
    </div>
  )
}
