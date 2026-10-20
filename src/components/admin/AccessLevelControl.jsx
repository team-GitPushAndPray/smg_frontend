import { Ban, Eye, LockKeyhole, PencilLine } from 'lucide-react'
import { NIVELES } from '../../utils/roles'

const OPCIONES = [
  { value: NIVELES.NINGUNO, label: 'Sin acceso', Icon: Ban },
  { value: NIVELES.VER, label: 'Ver', Icon: Eye },
  { value: NIVELES.EDITAR, label: 'Editar', Icon: PencilLine },
]

// Radio interno = radio del control menos el padding de la pista (p-1)
const segmentBase =
  'flex min-h-10 cursor-pointer items-center rounded-[calc(var(--radius-control)-0.25rem)] px-3 text-sm font-medium whitespace-nowrap transition duration-200 ease-glass active:scale-98'
const segmentIdle =
  'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white has-checked:bg-(--segment-active-bg) has-checked:shadow-(--segment-active-shadow)'
const segmentFocus = 'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring)'
// Elegido: negro o blanco, salvo "Editar", que lleva el acento (brand-700 / brand-300 pasan AA sobre su fondo)
const segmentChecked = {
  [NIVELES.NINGUNO]: 'has-checked:text-black dark:has-checked:text-white',
  [NIVELES.VER]: 'has-checked:text-black dark:has-checked:text-white',
  [NIVELES.EDITAR]: 'has-checked:text-brand-700 dark:has-checked:text-brand-300',
}

/*
 * Nivel de acceso de un rol sobre un módulo: Sin acceso · Ver · Editar.
 * Son radios nativos (las flechas cambian la opción). Con `isBusy` (guardando) no se puede cambiar, pero no se
 * deshabilita: así el foco no se pierde mientras se guarda
 */
export default function AccessLevelControl({ name, label, value, isBusy, onChange }) {
  return (
    <fieldset aria-busy={isBusy || undefined}>
      <legend className="sr-only">{label}</legend>
      <div
        className={`inline-flex gap-0.5 rounded-control bg-black/5 p-1 transition-opacity duration-200 dark:bg-white/5 ${isBusy ? 'cursor-progress opacity-60' : ''}`}
      >
        {OPCIONES.map((opcion) => (
          <label
            key={opcion.value}
            className={`${segmentBase} ${segmentIdle} ${segmentFocus} ${segmentChecked[opcion.value]} ${isBusy ? 'pointer-events-none' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={opcion.value}
              checked={value === opcion.value}
              onChange={() => {
                if (!isBusy) onChange(opcion.value)
              }}
              aria-disabled={isBusy || undefined}
              className="sr-only"
            />
            {opcion.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

const badgeBase = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'
const badgeAccent = 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
const badgeNeutral = 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300'
const badgeNone = 'text-neutral-600 dark:text-neutral-400'

/*
 * El mismo nivel, solo para leer: sin permiso de edición sobre Configuración o rol inactivo.
 * `total` es la fila del superAdmin ("Acceso total" con candado). `isMuted` saca el acento (rol inactivo)
 */
export function AccessLevelBadge({ value, total = false, isMuted = false }) {
  if (total) {
    return (
      <span className={`${badgeBase} ${badgeAccent}`}>
        <LockKeyhole size={14} strokeWidth={1.75} aria-hidden="true" />
        Acceso total
      </span>
    )
  }
  const { label, Icon } = OPCIONES.find((opcion) => opcion.value === value)
  let className = badgeNeutral
  if (value === NIVELES.NINGUNO) className = badgeNone
  else if (value === NIVELES.EDITAR && !isMuted) className = badgeAccent

  return (
    <span className={`${badgeBase} ${className}`}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  )
}
