import { ChevronDown, CircleAlert, Info, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { actualizarHoras, cambiarEstado, darDeBaja } from '../../services/equiposService'
import {
  ESTADOS_EQUIPO,
  formatHoras,
  formatHorasActualizadas,
  formatHorasMotor,
  getClaveEstado,
  getErrorEquipo,
  getNombreEquipo,
} from '../../utils/equipos'
import ConfirmDialog from './ConfirmDialog'
import { Field } from './FormField'
import Modal from './Modal'

const DADO_DE_BAJA = 'El equipo está dado de baja: ya no admite cambios.'

const textStrong = 'text-black dark:text-white'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const cancelClass =
  'interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

function describir(equipo) {
  return `${equipo.codigoInterno} · ${getNombreEquipo(equipo)}`
}

/*
 * Envío de una acción y sus errores, igual en los tres modales. Al terminar bien avisa, cierra y llama a `onDone()`
 * para que quien abrió el modal refresque lo que muestra. Un 409 (el equipo se dio de baja mientras tanto) o un 404
 * también cierran y refrescan, porque lo que se ve ya no es real. Un 400 va a `on400` si se pasa (para marcar un campo)
 * o arriba de los botones; un error de conexión o del servidor, también arriba, para poder reintentar.
 * En 401 y 403 apiFetch ya avisó: solo se cierra
 */
function useEnvio({ onClose, onDone }) {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const enviar = async ({ request, exito, on400 }) => {
    setIsSubmitting(true)
    setError('')
    try {
      await request()
    } catch (requestError) {
      setIsSubmitting(false)
      const mensaje = getErrorEquipo(requestError)
      if (requestError.status === 409 || requestError.status === 404) {
        showToast(requestError.status === 409 ? DADO_DE_BAJA : mensaje)
        onClose()
        onDone()
      } else if (!mensaje) {
        onClose()
      } else if (requestError.status === 400 && on400) {
        on400(mensaje)
      } else {
        setError(mensaje)
      }
      return
    }
    showToast(exito, { tipo: 'exito' })
    onClose()
    onDone()
  }

  return { isSubmitting, error, enviar }
}

function FormError({ message }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
    >
      <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
      <p>{message}</p>
    </div>
  )
}

function Botones({ submitLabel, isSubmitting, isDisabled = false, onClose }) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <button type="button" onClick={onClose} disabled={isSubmitting} className={cancelClass}>
        Cancelar
      </button>
      <button type="submit" disabled={isSubmitting || isDisabled} className="btn-primary">
        {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
        {isSubmitting ? 'Guardando…' : submitLabel}
      </button>
    </div>
  )
}

function validateHoras(value, actuales) {
  if (!value) return 'Ingresá las horas de motor.'
  if (!/^\d+$/.test(value)) return 'Ingresá un número entero, sin decimales.'
  if (actuales != null && Number(value) < actuales) {
    return `Las horas no pueden ser menores a las actuales (${formatHoras(actuales)}).`
  }
  return ''
}

// Carga de horas de una máquina (los aditamentos no tienen motor). Pueden ser iguales a las actuales: confirma la lectura
function HorasModal({ equipo, onClose, onDone }) {
  const [value, setValue] = useState('')
  const [fieldError, setFieldError] = useState('')
  const { isSubmitting, error, enviar } = useEnvio({ onClose, onDone })

  const onSubmit = (event) => {
    event.preventDefault()
    const horas = value.trim()
    const validation = validateHoras(horas, equipo.horasMotorActual)
    setFieldError(validation)
    if (validation) {
      event.currentTarget.elements.horasMotorActual.focus()
      return
    }
    enviar({
      request: () => actualizarHoras(equipo.id, Number(horas)),
      exito: `Se actualizaron las horas de ${equipo.codigoInterno}.`,
      on400: setFieldError,
    })
  }

  return (
    <Modal title="Actualizar horas" description={describir(equipo)} onClose={onClose} isBusy={isSubmitting}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormError message={error} />

        <dl className="grid grid-cols-2 gap-4 rounded-control bg-black/5 px-4 py-3.5 dark:bg-white/5">
          <div className="flex flex-col gap-0.5">
            <dt className={`text-sm ${textMuted}`}>Horas actuales</dt>
            <dd className={`font-medium tabular-nums ${textStrong}`}>{formatHorasMotor(equipo)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className={`text-sm ${textMuted}`}>Última actualización</dt>
            <dd className={`font-medium tabular-nums ${textStrong}`}>{formatHorasActualizadas(equipo)}</dd>
          </div>
        </dl>

        <Field
          name="horasMotorActual"
          label="Horas de motor"
          hint="Las que marca el horómetro hoy, sin decimales."
          error={fieldError}
        >
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                // El error se va apenas se corrige el valor
                if (fieldError) setFieldError('')
              }}
              disabled={isSubmitting}
              className="field px-3.5 tabular-nums"
            />
          )}
        </Field>

        <Botones submitLabel="Guardar horas" isSubmitting={isSubmitting} onClose={onClose} />
      </form>
    </Modal>
  )
}

// Cambio de estado: arranca en el actual, que queda marcado, y no se puede guardar sin elegir otro
function EstadoModal({ equipo, onClose, onDone }) {
  const actual = getClaveEstado(equipo.estado)
  const [estado, setEstado] = useState(actual ?? '')
  const { isSubmitting, error, enviar } = useEnvio({ onClose, onDone })

  const onSubmit = (event) => {
    event.preventDefault()
    enviar({
      request: () => cambiarEstado(equipo.id, estado),
      exito: `${equipo.codigoInterno} pasó a «${ESTADOS_EQUIPO[estado].label}».`,
    })
  }

  return (
    <Modal title="Cambiar estado" description={describir(equipo)} onClose={onClose} isBusy={isSubmitting}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormError message={error} />

        <Field name="estado" label="Estado">
          {(props) => (
            <div className="relative">
              <select
                {...props}
                autoFocus
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                disabled={isSubmitting}
                className="field appearance-none pr-11 pl-3.5"
              >
                {!actual && (
                  <option value="" disabled>
                    Elegí un estado
                  </option>
                )}
                {Object.entries(ESTADOS_EQUIPO).map(([clave, { label }]) => (
                  <option key={clave} value={clave}>
                    {clave === actual ? `${label} (actual)` : label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                strokeWidth={1.75}
                aria-hidden="true"
                className={`pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 ${textMuted}`}
              />
            </div>
          )}
        </Field>

        <p className={`flex items-start gap-2.5 text-sm text-pretty ${textMuted}`}>
          <Info size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          Solo los equipos en «Disponible» aparecen en el catálogo público.
        </p>

        <Botones
          submitLabel="Guardar estado"
          isSubmitting={isSubmitting}
          isDisabled={!estado || estado === actual}
          onClose={onClose}
        />
      </form>
    </Modal>
  )
}

function BajaDialog({ equipo, onClose, onDone }) {
  const { isSubmitting, error, enviar } = useEnvio({ onClose, onDone })

  const onConfirm = () =>
    enviar({ request: () => darDeBaja(equipo.id), exito: `Se dio de baja el equipo ${equipo.codigoInterno}.` })

  return (
    <ConfirmDialog
      title="¿Dar de baja este equipo?"
      confirmLabel="Dar de baja"
      submittingLabel="Dando de baja…"
      isSubmitting={isSubmitting}
      error={error}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <p>
        <strong className={`font-semibold ${textStrong}`}>{describir(equipo)}</strong> va a dejar de aparecer en el
        inventario y en el catálogo público.
      </p>
      <p className={`text-sm text-pretty ${textMuted}`}>
        El equipo no se borra: se conserva con todo su historial y se puede consultar desde «Ver dados de baja».
      </p>
    </ConfirmDialog>
  )
}

const MODALES = { horas: HorasModal, estado: EstadoModal, baja: BajaDialog }

/*
 * Las acciones de un equipo que no entran en la edición general: actualizar horas, cambiar estado y dar de baja.
 * `accion` es { tipo: 'horas' | 'estado' | 'baja', equipo }, o null si no hay ninguna abierta.
 * Al terminar (bien, o con un 409/404 que deja la vista desactualizada) llama a `onDone()` para refrescar
 */
export default function EquipoAccionModal({ accion, onClose, onDone }) {
  if (!accion) return null
  const Componente = MODALES[accion.tipo]
  return <Componente key={accion.equipo.id} equipo={accion.equipo} onClose={onClose} onDone={onDone} />
}
