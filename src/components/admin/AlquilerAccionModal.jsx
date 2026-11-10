import { CircleAlert, LoaderCircle, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { anularAlquiler, editarAlquiler } from '../../services/alquileresService'
import {
  ACCIONES_ALQUILER,
  duracionAlquiler,
  ERROR_SIN_FECHA_FIN,
  ERROR_SIN_MOTIVO,
  fechaCalendarioAlquiler,
  formatFechaAlquiler,
  getErrorAccionAlquiler,
  MAX_CONTACTO_OBRA,
  MAX_MOTIVO_ANULACION,
  validarProrroga,
} from '../../utils/alquileres'
import { aCoordenada, validarUbicacion } from '../../utils/ubicacion'
import { Field } from './FormField'
import Modal from './Modal'
import UbicacionInput from './UbicacionInput'

/** @import { AlquilerDetalle, AlquilerEdicion } from '../../types/alquileres' */

const textStrong = 'text-black dark:text-white'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const cancelClass =
  'interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
const avisoClass =
  'flex items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'

function describir(alquiler) {
  const cliente = alquiler.cliente?.razon_social?.trim()
  return cliente ? `Alquiler N.º ${alquiler.id} · ${cliente}` : `Alquiler N.º ${alquiler.id}`
}

function contarDias(dias) {
  return dias === 1 ? '1 día' : `${dias} días`
}

/*
 * Envío de una acción y sus errores, igual en los tres modales. Al terminar bien avisa, cierra y llama a `onDone()`
 * para que el detalle se refresque. Un 409 (el alquiler cambió de estado mientras tanto) se muestra en el modal, que
 * queda abierto, y el detalle se refresca detrás para que los botones y el estado sean los reales. Un 404 cierra,
 * avisa y refresca (el detalle pasa a "no encontrado"). Un 400 va a `on400` si se pasa (para marcar un campo) o arriba
 * de los botones, igual que un error de conexión o del servidor. En 401 y 403 apiFetch ya avisó: solo se cierra
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
      const mensaje = getErrorAccionAlquiler(requestError)
      if (!mensaje) {
        onClose()
      } else if (requestError.status === 404) {
        showToast(mensaje)
        onClose()
        onDone()
      } else if (requestError.status === 400 && on400) {
        on400(mensaje)
      } else {
        setError(mensaje)
        if (requestError.status === 409) onDone()
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
    <div role="alert" className={avisoClass}>
      <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
      <p>{message}</p>
    </div>
  )
}

function Botones({ submitLabel, submittingLabel = 'Guardando…', isSubmitting, isDisabled = false, onClose }) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <button type="button" onClick={onClose} disabled={isSubmitting} className={cancelClass}>
        Cancelar
      </button>
      <button type="submit" disabled={isSubmitting || isDisabled} className="btn-primary">
        {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </div>
  )
}

/*
 * Prórroga: muestra el inicio y la fecha de fin actual y arranca el selector en esta, así se elige la nueva a partir de
 * ella. No se puede guardar sin cambiarla. El fin anterior al inicio se marca apenas pasa (el selector, además, no deja
 * elegirlo). Debajo se ve cuántos días queda el alquiler y, si la nueva es anterior a la actual, que se acorta
 */
function ProrrogarModal({ alquiler, onClose, onDone }) {
  const inicio = fechaCalendarioAlquiler(alquiler.fecha_inicio)
  const actual = fechaCalendarioAlquiler(alquiler.fecha_fin_prevista)
  const [fecha, setFecha] = useState(actual)
  const [intentado, setIntentado] = useState(false)
  const [errorBack, setErrorBack] = useState('')
  const { isSubmitting, error, enviar } = useEnvio({ onClose, onDone })

  const validacion = validarProrroga(fecha, inicio)
  // Vacía se marca recién al intentar guardar; anterior al inicio, enseguida
  const fieldError = errorBack || (validacion === ERROR_SIN_FECHA_FIN && !intentado ? '' : validacion)

  const dias = duracionAlquiler(inicio, fecha)
  let hint
  if (dias && actual && fecha < actual) {
    hint = `Es anterior a la fecha de fin actual: el alquiler se acorta y queda de ${contarDias(dias)}.`
  } else if (dias) {
    hint = `El alquiler queda de ${contarDias(dias)}.`
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setIntentado(true)
    if (validacion) {
      event.currentTarget.elements.fecha_fin_prevista.focus()
      return
    }
    enviar({
      request: () => editarAlquiler(alquiler.id, { fecha_fin_prevista: fecha }),
      exito: `El alquiler N.º ${alquiler.id} ahora termina el ${formatFechaAlquiler(fecha)}.`,
      on400: setErrorBack,
    })
  }

  return (
    <Modal title="Prorrogar alquiler" description={describir(alquiler)} onClose={onClose} isBusy={isSubmitting}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormError message={error} />

        <dl className="grid grid-cols-2 gap-4 rounded-control bg-black/5 px-4 py-3.5 dark:bg-white/5">
          <div className="flex flex-col gap-0.5">
            <dt className={`text-sm ${textMuted}`}>Inicio</dt>
            <dd className={`font-medium tabular-nums ${textStrong}`}>{formatFechaAlquiler(alquiler.fecha_inicio)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className={`text-sm ${textMuted}`}>Fin actual</dt>
            <dd className={`font-medium tabular-nums ${textStrong}`}>
              {formatFechaAlquiler(alquiler.fecha_fin_prevista)}
            </dd>
          </div>
        </dl>

        <Field name="fecha_fin_prevista" label="Nueva fecha de fin" hint={hint} error={fieldError}>
          {(props) => (
            <input
              {...props}
              type="date"
              autoFocus
              value={fecha}
              min={inicio || undefined}
              onChange={(event) => {
                setFecha(event.target.value)
                if (errorBack) setErrorBack('')
              }}
              disabled={isSubmitting}
              className="field px-3.5 tabular-nums"
            />
          )}
        </Field>

        <Botones
          submitLabel="Guardar fecha"
          isSubmitting={isSubmitting}
          isDisabled={fecha === actual}
          onClose={onClose}
        />
      </form>
    </Modal>
  )
}

// Coordenada redondeada como la deja UbicacionInput (6 decimales), para saber si cambió la que vino del back
function redondear(valor) {
  const numero = aCoordenada(valor)
  return numero == null ? null : Number(numero.toFixed(6))
}

/*
 * Cambio de ubicación: UbicacionInput precargado con la ubicación actual y el contacto en obra, también editable.
 * No se puede guardar sin cambiar algo. Viajan siempre todos los campos (latitud y longitud juntas, como pide el back);
 * un contacto vacío viaja como null, que lo borra
 */
function UbicacionModal({ alquiler, onClose, onDone }) {
  const formRef = useRef(null)
  const [inicial] = useState(() => ({
    latitud: redondear(alquiler.latitud),
    longitud: redondear(alquiler.longitud),
    ubicacion_referencia: alquiler.ubicacion_referencia ?? '',
    contacto_obra_nombre: alquiler.contacto_obra_nombre ?? '',
    contacto_obra_telefono: alquiler.contacto_obra_telefono ?? '',
  }))
  const [ubicacion, setUbicacion] = useState({
    latitud: inicial.latitud,
    longitud: inicial.longitud,
    ubicacion_referencia: inicial.ubicacion_referencia,
  })
  const [contacto, setContacto] = useState({
    contacto_obra_nombre: inicial.contacto_obra_nombre,
    contacto_obra_telefono: inicial.contacto_obra_telefono,
  })
  const [mostrarErrores, setMostrarErrores] = useState(false)
  // Después de un intento fallido, el foco va al primer campo con error (espera al render que lo marca)
  const [enfocarError, setEnfocarError] = useState(0)
  const { isSubmitting, error, enviar } = useEnvio({ onClose, onDone })

  useEffect(() => {
    if (enfocarError === 0) return
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [enfocarError])

  const sinCambios =
    ubicacion.latitud === inicial.latitud &&
    ubicacion.longitud === inicial.longitud &&
    ubicacion.ubicacion_referencia.trim() === inicial.ubicacion_referencia.trim() &&
    contacto.contacto_obra_nombre.trim() === inicial.contacto_obra_nombre.trim() &&
    contacto.contacto_obra_telefono.trim() === inicial.contacto_obra_telefono.trim()

  const cambiarContacto = (event) => {
    const { name, value } = event.target
    setContacto((current) => ({ ...current, [name]: value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setMostrarErrores(true)
    if (Object.keys(validarUbicacion(ubicacion)).length > 0) {
      setEnfocarError((value) => value + 1)
      return
    }
    /** @type {AlquilerEdicion} */
    const cambios = {
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      ubicacion_referencia: ubicacion.ubicacion_referencia.trim(),
      contacto_obra_nombre: contacto.contacto_obra_nombre.trim() || null,
      contacto_obra_telefono: contacto.contacto_obra_telefono.trim() || null,
    }
    enviar({
      request: () => editarAlquiler(alquiler.id, cambios),
      exito: `Se actualizó la ubicación del alquiler N.º ${alquiler.id}.`,
    })
  }

  return (
    <Modal title="Cambiar ubicación" description={describir(alquiler)} onClose={onClose} isBusy={isSubmitting}>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <FormError message={error} />

        <UbicacionInput
          value={ubicacion}
          onChange={setUbicacion}
          mostrarErrores={mostrarErrores}
          disabled={isSubmitting}
        />

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-semibold">
            Contacto en obra <span className={`text-sm font-normal ${textMuted}`}>(opcional)</span>
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="contacto_obra_nombre" label="Nombre">
              {(props) => (
                <input
                  {...props}
                  type="text"
                  value={contacto.contacto_obra_nombre}
                  onChange={cambiarContacto}
                  maxLength={MAX_CONTACTO_OBRA.nombre}
                  autoComplete="off"
                  disabled={isSubmitting}
                  className="field px-3.5"
                />
              )}
            </Field>
            <Field name="contacto_obra_telefono" label="Teléfono">
              {(props) => (
                <input
                  {...props}
                  type="tel"
                  inputMode="tel"
                  value={contacto.contacto_obra_telefono}
                  onChange={cambiarContacto}
                  maxLength={MAX_CONTACTO_OBRA.telefono}
                  autoComplete="off"
                  placeholder="299 512-3456"
                  disabled={isSubmitting}
                  className="field px-3.5"
                />
              )}
            </Field>
          </div>
        </fieldset>

        <Botones
          submitLabel="Guardar ubicación"
          isSubmitting={isSubmitting}
          isDisabled={sinCambios}
          onClose={onClose}
        />
      </form>
    </Modal>
  )
}

/*
 * Anulación: advierte que no se puede deshacer y qué equipos se liberan, y pide el motivo (obligatorio, queda en el
 * detalle). Sin motivo no se envía: se marca el campo. El botón de confirmar es el rojo del acento
 */
function AnularModal({ alquiler, onClose, onDone }) {
  const [motivo, setMotivo] = useState('')
  const [fieldError, setFieldError] = useState('')
  const { isSubmitting, error, enviar } = useEnvio({ onClose, onDone })
  const codigos = (alquiler.equipos ?? []).map((equipo) => equipo.codigo_interno).filter(Boolean)

  const onSubmit = (event) => {
    event.preventDefault()
    const texto = motivo.trim()
    if (!texto) {
      setFieldError(ERROR_SIN_MOTIVO)
      event.currentTarget.elements.motivo.focus()
      return
    }
    enviar({
      request: () => anularAlquiler(alquiler.id, texto),
      exito: `Se anuló el alquiler N.º ${alquiler.id}. Sus equipos volvieron a quedar disponibles.`,
      on400: setFieldError,
    })
  }

  return (
    <Modal title="¿Anular este alquiler?" description={describir(alquiler)} onClose={onClose} isBusy={isSubmitting}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <div className={avisoClass}>
          <TriangleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          <p>
            <strong className="font-semibold">Esta acción no se puede deshacer.</strong> El alquiler pasa a «Anulado» y
            sus equipos vuelven a quedar disponibles para otros alquileres.
          </p>
        </div>

        {codigos.length > 0 && (
          <div className="flex flex-col gap-1 text-sm">
            <p className={textMuted}>
              {codigos.length === 1 ? 'Equipo que se libera' : `Equipos que se liberan (${codigos.length})`}
            </p>
            <p className={`font-medium break-words tabular-nums ${textStrong}`}>{codigos.join(', ')}</p>
          </div>
        )}

        <FormError message={error} />

        <Field
          name="motivo"
          label="Motivo"
          hint={`Queda registrado en el detalle del alquiler. ${motivo.length}/${MAX_MOTIVO_ANULACION}`}
          error={fieldError}
        >
          {(props) => (
            <textarea
              {...props}
              autoFocus
              value={motivo}
              onChange={(event) => {
                setMotivo(event.target.value)
                if (fieldError) setFieldError('')
              }}
              rows={3}
              maxLength={MAX_MOTIVO_ANULACION}
              placeholder="Ej.: el cliente canceló la obra antes de la entrega"
              disabled={isSubmitting}
              aria-required="true"
              className="field resize-y px-3.5 py-2.5"
            />
          )}
        </Field>

        <Botones
          submitLabel="Anular alquiler"
          submittingLabel="Anulando…"
          isSubmitting={isSubmitting}
          onClose={onClose}
        />
      </form>
    </Modal>
  )
}

const MODALES = {
  [ACCIONES_ALQUILER.PRORROGAR]: ProrrogarModal,
  [ACCIONES_ALQUILER.UBICACION]: UbicacionModal,
  [ACCIONES_ALQUILER.ANULAR]: AnularModal,
}

/**
 * Las tres acciones que modifican un alquiler ya creado: prorrogar, cambiar ubicación (y contacto en obra) y anular.
 * `accion` es una de ACCIONES_ALQUILER, o null si no hay ninguna abierta. Al terminar bien (o con un 409 o 404, que
 * dejan el detalle desactualizado) llama a `onDone()` para refrescarlo
 * @param {{ accion: string | null, alquiler: AlquilerDetalle, onClose: () => void, onDone: () => void }} props
 */
export default function AlquilerAccionModal({ accion, alquiler, onClose, onDone }) {
  const Componente = accion ? MODALES[accion] : null
  if (!Componente) return null
  return <Componente key={accion} alquiler={alquiler} onClose={onClose} onDone={onDone} />
}
