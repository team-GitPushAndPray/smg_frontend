import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { actualizarDescripcionEscalon } from '../../services/escalonesServicioService'
import {
  ERROR_SIN_DESCRIPCION,
  formatIntervaloServicio,
  getErrorDescripcionServicio,
  MAX_DESCRIPCION_SERVICIO,
} from '../../utils/servicios'
import { Field } from './FormField'
import Modal from './Modal'

/** @import { EscalonServicioDetalle } from '../../types/avisos' */

const cancelClass =
  'interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

/**
 * Modal "Editar descripción" de un tipo de service (requiere edición en Máquinas): un textarea precargado con la
 * descripción actual, obligatorio y de hasta MAX_DESCRIPCION_SERVICIO caracteres (como el back), con contador. Una vez
 * cargada no puede volver a quedar vacía. Sin cambios, "Guardar" queda deshabilitado. Viaja solo `descripcion`.
 * Al guardar avisa, cierra y le pasa a `onSaved` el tipo que devolvió el back.
 * Errores: 400 en el campo; 404 (el tipo ya no existe) avisa, cierra y llama a `onStale` para recargar; sin conexión o
 * falla del servidor, arriba de los botones para reintentar. En 401 y 403 apiFetch ya avisó: solo se cierra
 * @param {{
 *   escalon: EscalonServicioDetalle,
 *   onClose: () => void,
 *   onSaved: (escalon: EscalonServicioDetalle) => void,
 *   onStale: () => void,
 * }} props
 */
export default function EditarDescripcionServicioModal({ escalon, onClose, onSaved, onStale }) {
  const { showToast } = useToast()
  const inicial = escalon.descripcion ?? ''
  const [descripcion, setDescripcion] = useState(inicial)
  const [fieldError, setFieldError] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sinCambios = descripcion.trim() === inicial.trim()

  const onSubmit = async (event) => {
    event.preventDefault()
    const texto = descripcion.trim()
    if (!texto) {
      setFieldError(ERROR_SIN_DESCRIPCION)
      event.currentTarget.elements.descripcion.focus()
      return
    }
    if (sinCambios) return

    setIsSubmitting(true)
    setError('')
    let actualizado
    try {
      actualizado = await actualizarDescripcionEscalon(escalon.id, texto)
    } catch (requestError) {
      setIsSubmitting(false)
      const mensaje = getErrorDescripcionServicio(requestError)
      if (!mensaje) {
        onClose()
      } else if (requestError.status === 404) {
        showToast(mensaje)
        onClose()
        onStale()
      } else if (requestError.status === 400) {
        setFieldError(mensaje)
      } else {
        setError(mensaje)
      }
      return
    }

    showToast(`Descripción guardada: ${escalon.nombre}.`, { tipo: 'exito' })
    onClose()
    onSaved(actualizado)
  }

  return (
    <Modal
      title="Editar descripción"
      description={`${escalon.nombre} · ${formatIntervaloServicio(escalon.horas_intervalo)}`}
      onClose={onClose}
      isBusy={isSubmitting}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
          >
            <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Field
          name="descripcion"
          label="Descripción"
          hint={`Qué tareas incluye este service. ${descripcion.length}/${MAX_DESCRIPCION_SERVICIO}`}
          error={fieldError}
        >
          {(props) => (
            <textarea
              {...props}
              autoFocus
              value={descripcion}
              onChange={(event) => {
                setDescripcion(event.target.value)
                // El error se va apenas se escribe
                if (fieldError) setFieldError('')
              }}
              rows={5}
              maxLength={MAX_DESCRIPCION_SERVICIO}
              placeholder="Ej.: cambio de aceite de motor y filtros, engrase general y revisión de mangueras"
              disabled={isSubmitting}
              aria-required="true"
              className="field resize-y px-3.5 py-2.5"
            />
          )}
        </Field>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isSubmitting} className={cancelClass}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting || sinCambios} className="btn-primary">
            {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
