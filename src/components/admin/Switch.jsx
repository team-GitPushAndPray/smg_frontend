/**
 * Switch con el acento cuando está prendido. El gris de apagado (neutral-500) pasa 3:1 sobre el fondo en ambos modos.
 * `label` es su nombre; con `hideLabel` solo lo leen los lectores de pantalla (por ejemplo, dentro de una tabla, donde
 * la columna ya dice qué es). `disabled` lo deja a la vista pero sin poder cambiarlo (sin permiso de edición).
 * `isBusy` (guardando) tampoco deja cambiarlo, pero sin deshabilitarlo: así el foco no se pierde mientras se guarda
 * @param {{
 *   checked: boolean,
 *   onChange: (checked: boolean) => void,
 *   label: string,
 *   hideLabel?: boolean,
 *   disabled?: boolean,
 *   isBusy?: boolean,
 * }} props
 */
export default function Switch({ checked, onChange, label, hideLabel = false, disabled = false, isBusy = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      aria-busy={isBusy || undefined}
      disabled={disabled}
      onClick={() => {
        if (!isBusy) onChange(!checked)
      }}
      className={`interactive inline-flex min-h-11 shrink-0 items-center gap-3 rounded-control px-1 text-sm font-medium text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white ${isBusy ? 'cursor-progress' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ease-glass ${checked ? 'bg-brand-600' : 'bg-neutral-500'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-(--segment-active-shadow) transition-transform duration-200 ease-glass ${checked ? 'translate-x-4' : ''}`}
        />
      </span>
      {!hideLabel && label}
    </button>
  )
}
