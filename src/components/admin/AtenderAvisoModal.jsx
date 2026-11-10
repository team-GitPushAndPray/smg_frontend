import { CircleAlert, Clock, Info, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { atenderAviso } from '../../services/avisosService'
import {
  describirAviso,
  describirMaquinaAviso,
  ERROR_SIN_NOTA,
  getErrorAtencion,
  ICONOS_TIPO_AVISO,
  MAX_NOTA_ATENCION,
} from '../../utils/avisos'
import { EstadoAviso } from './AvisoCard'
import { Field } from './FormField'
import Modal from './Modal'

/** @import { Aviso } from '../../types/avisos' */

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const cancelClass =
  'interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

/**
 * Qué se está por cerrar: la máquina, qué pide el aviso con sus datos y la urgencia
 * @param {{ aviso: Aviso }} props
 */
function ResumenAviso({ aviso }) {
  const { titulo, datos } = describirAviso(aviso)
  const TipoIcon = ICONOS_TIPO_AVISO[aviso.tipo] ?? Clock

  return (
    <div className="flex flex-col gap-3 rounded-control bg-black/5 p-3.5 dark:bg-white/5">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-control bg-black/5 dark:bg-white/10 ${textSoft}`}
          >
            <TipoIcon size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className={`font-semibold break-words tabular-nums ${textStrong}`}>{describirMaquinaAviso(aviso)}</p>
            <p className={`text-sm font-medium ${textSoft}`}>{titulo}</p>
          </div>
        </div>
        <EstadoAviso aviso={aviso} />
      </div>
      {datos.length > 0 && (
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {datos.map(({ label, valor }) => (
            <div key={label} className="flex gap-1.5">
              <dt className={textMuted}>{label}</dt>
              <dd className={`font-medium tabular-nums ${textStrong}`}>{valor}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/**
 * Modal "Marcar atendido" de un aviso PENDIENTE (requiere edición en Avisos): el resumen del aviso y una nota
 * obligatoria (hasta MAX_NOTA_ATENCION caracteres, como el back), que queda registrada con el usuario y la fecha.
 * En un service aclara que el back también cierra los services pendientes anteriores de esa máquina.
 * Al terminar bien avisa, cierra y llama a `onDone()` para refrescar la lista y la campanita.
 * Errores: 400 en el campo de la nota; 409 (otro usuario lo atendió antes) y 404 avisan, cierran y refrescan, porque lo
 * que se ve ya no es real; sin conexión o falla del servidor, arriba de los botones para reintentar. En 401 y 403
 * apiFetch ya avisó: solo se cierra
 * @param {{ aviso: Aviso, onClose: () => void, onDone: () => void }} props
 */
export default function AtenderAvisoModal({ aviso, onClose, onDone }) {
  const { showToast } = useToast()
  const [nota, setNota] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const esServicio = aviso.tipo === 'SERVICIO'

  const onSubmit = async (event) => {
    event.preventDefault()
    const texto = nota.trim()
    if (!texto) {
      setFieldError(ERROR_SIN_NOTA)
      event.currentTarget.elements.nota.focus()
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      await atenderAviso(aviso.id, texto)
    } catch (requestError) {
      setIsSubmitting(false)
      const mensaje = getErrorAtencion(requestError)
      if (!mensaje) {
        onClose()
      } else if (requestError.status === 409 || requestError.status === 404) {
        showToast(mensaje)
        onClose()
        onDone()
      } else if (requestError.status === 400) {
        setFieldError(mensaje)
      } else {
        setError(mensaje)
      }
      return
    }

    const { titulo } = describirAviso(aviso)
    showToast(`Aviso atendido: ${titulo} de ${aviso.maquina?.codigo_interno ?? 'la máquina'}.`, { tipo: 'exito' })
    onClose()
    onDone()
  }

  return (
    <Modal
      title="Marcar como atendido"
      description="Queda registrado con tu nombre, la fecha y la nota."
      onClose={onClose}
      isBusy={isSubmitting}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <ResumenAviso aviso={aviso} />

        {esServicio && (
          <p className={`flex items-start gap-2.5 text-sm text-pretty ${textMuted}`}>
            <Info size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
            También se cierran los services pendientes anteriores de esta máquina.
          </p>
        )}

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
          name="nota"
          label="Nota"
          hint={`Qué se hizo y quién lo hizo. ${nota.length}/${MAX_NOTA_ATENCION}`}
          error={fieldError}
        >
          {(props) => (
            <textarea
              {...props}
              autoFocus
              value={nota}
              onChange={(event) => {
                setNota(event.target.value)
                // El error se va apenas se escribe
                if (fieldError) setFieldError('')
              }}
              rows={3}
              maxLength={MAX_NOTA_ATENCION}
              placeholder={
                esServicio ? 'Ej.: service hecho en taller, cambio de aceite y filtros' : 'Ej.: certificación renovada'
              }
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
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
            {isSubmitting ? 'Guardando…' : 'Marcar atendido'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
