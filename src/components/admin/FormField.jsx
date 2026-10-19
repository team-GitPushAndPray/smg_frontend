import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="text-sm text-brand-700 dark:text-brand-400">
      {message}
    </p>
  )
}

// Campo con label, error debajo y, opcionalmente, una ayuda. `children` recibe las props de accesibilidad del input
export function Field({ name, label, optional, hint, error, className = '', children }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-neutral-600 dark:text-neutral-400"> (opcional)</span>}
      </label>
      {children({ id, name, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-neutral-600 dark:text-neutral-400">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  )
}

// Input de contraseña con el botón de mostrar/ocultar. Cada uno recuerda si está visible
export function PasswordInput({ disabled, ...props }) {
  const [isVisible, setIsVisible] = useState(false)
  const toggleLabel = isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'

  return (
    <div className="relative">
      <input {...props} type={isVisible ? 'text' : 'password'} disabled={disabled} className="field pr-12 pl-3.5" />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        disabled={disabled}
        aria-label={toggleLabel}
        aria-pressed={isVisible}
        title={toggleLabel}
        className="interactive absolute inset-y-0 right-0 grid w-11 place-items-center rounded-control text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
      >
        {isVisible ? (
          <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
