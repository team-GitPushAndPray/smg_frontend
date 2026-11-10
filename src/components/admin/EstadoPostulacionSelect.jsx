import { ChevronDown, LoaderCircle } from 'lucide-react'
import { ESTADOS_POSTULACION, getEstadoPostulacion } from '../../utils/postulaciones'

/** @import { EstadoPostulacion } from '../../types/postulaciones' */

/**
 * Selector del estado de una postulación, con etiqueta visible: muestra el actual y permite pasar a cualquiera de los
 * otros (sin un orden obligado). Las opciones y sus textos salen de ESTADOS_POSTULACION, igual que el badge.
 * Elegir un estado ya lo guarda (`onChange`); mientras se envía queda deshabilitado, con un indicador de carga.
 * Va sobre el fondo de la página (vidrio opaco del campo), no adentro de un .glass
 * @param {{
 *   id: string,
 *   value: EstadoPostulacion | string,
 *   onChange: (estado: EstadoPostulacion) => void,
 *   isSaving?: boolean,
 * }} props
 */
export default function EstadoPostulacionSelect({ id, value, onChange, isSaving = false }) {
  // Un estado que el front no conoce se muestra tal cual, para no aparentar otro
  const desconocido = !getEstadoPostulacion(value)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Estado de la postulación
      </label>
      <div className="relative min-w-0 sm:w-56">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(/** @type {EstadoPostulacion} */ (event.target.value))}
          disabled={isSaving}
          aria-describedby={isSaving ? `${id}-guardando` : undefined}
          className="field-glass appearance-none truncate pr-11 pl-3.5 font-medium disabled:opacity-60"
        >
          {desconocido && (
            <option value={value} disabled>
              {value || 'Sin estado'}
            </option>
          )}
          {Object.entries(ESTADOS_POSTULACION).map(([clave, { label }]) => (
            <option key={clave} value={clave}>
              {label}
            </option>
          ))}
        </select>
        {isSaving ? (
          <LoaderCircle
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
            className="field-icon right-3.5 animate-spin motion-reduce:animate-none"
          />
        ) : (
          <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" className="field-icon right-3.5" />
        )}
      </div>
      {isSaving && (
        <p id={`${id}-guardando`} className="sr-only">
          Guardando el estado…
        </p>
      )}
    </div>
  )
}
