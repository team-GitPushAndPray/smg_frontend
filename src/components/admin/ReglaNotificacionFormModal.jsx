import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { actualizarRegla, crearRegla } from '../../services/notificacionesService'
import {
  CANALES_NOTIFICACION,
  getAltasRegla,
  getCambiosRegla,
  getErrorValidacionRegla,
  getTipoAvisoRegla,
  getValoresRegla,
  MAX_ETIQUETA_REGLA,
  TIPOS_AVISO_REGLA,
  validarRegla,
} from '../../utils/notificaciones'
import { getErrorGenerico } from '../../utils/usuarios'
import { Field } from './FormField'
import Modal from './Modal'

/** @import { ReglaNotificacion } from '../../types/notificaciones' */

const textMuted = 'text-neutral-600 dark:text-neutral-400'
const cancelClass =
  'interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
const legendClass = 'mb-1.5 text-sm font-medium'
const errorClass = 'mt-1.5 text-sm text-brand-700 dark:text-brand-400'

// Canal: control segmentado de radios nativos (las flechas cambian la opción). Radio interno = radio del control - p-1
const canalBase =
  'flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-[calc(var(--radius-control)-0.25rem)] px-1 py-2 text-center text-sm font-medium transition duration-200 ease-glass'
const canalHabilitado =
  'cursor-pointer text-neutral-600 hover:text-black active:scale-98 dark:text-neutral-400 dark:hover:text-white has-checked:bg-(--segment-active-bg) has-checked:text-black has-checked:shadow-(--segment-active-shadow) dark:has-checked:text-white'
const canalDeshabilitado = 'cursor-not-allowed text-neutral-600 opacity-70 dark:text-neutral-400'
const conFoco = 'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring)'
// El ícono del canal elegido lleva el acento: brand-700 / brand-400 pasan AA sobre su fondo
const iconCanal = 'group-has-checked:text-brand-700 dark:group-has-checked:text-brand-400'

// Recibe: cada opción es una fila táctil con su checkbox (alta) o radio (edición)
const opcionBase = `interactive flex min-h-12 cursor-pointer items-center gap-3 rounded-control px-3 py-2 ${conFoco}`
const opcionIdle = 'hover:bg-black/5 dark:hover:bg-white/10'
const opcionElegida = 'bg-brand-600/10 dark:bg-brand-500/15'
const marca = 'size-4.5 shrink-0 cursor-pointer accent-brand-600 dark:accent-brand-500'

/**
 * Alta y edición de una regla de notificación: canal (Telegram · Email; WhatsApp a la vista pero "No disponible"),
 * destino (chat_id o mail, con label y placeholder según el canal), etiqueta y qué avisos recibe.
 * - Alta (`regla` null): "Recibe" son checkboxes y al menos uno es obligatorio. Con los dos marcados se hacen dos POST,
 *   uno por tipo, porque cada regla es de un solo tipo. Si sale uno solo, avisa cuál faltó y cierra igual.
 * - Edición: "Recibe" es una sola opción y solo viaja lo que cambió.
 * Valida igual que el back (mail válido, chat_id entero que puede ser negativo, etiqueta obligatoria de hasta 60
 * caracteres) y no guarda con errores. Mientras guarda, el formulario queda bloqueado y el modal no se puede cerrar.
 * Un 400 del back va arriba del formulario; un 404 llama a `onGone`; el resto va a un aviso.
 * `onSaved` recibe cuántas reglas se crearon (en la edición, 1); el modal lo cierra la página
 * @param {{
 *   regla: ReglaNotificacion | null,
 *   onClose: () => void,
 *   onSaved: (creadas: number) => void,
 *   onGone: () => void,
 * }} props
 */
export default function ReglaNotificacionFormModal({ regla, onClose, onSaved, onGone }) {
  const isEdit = Boolean(regla)
  const { showToast } = useToast()
  const [values, setValues] = useState(() => getValoresRegla(regla))
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)
  const focusAfterSubmit = useRef(false)
  const recibeErrorId = useId()
  const canal = CANALES_NOTIFICACION.find(({ id }) => id === values.canal) ?? CANALES_NOTIFICACION[0]

  // Si el back rechaza el envío, el foco vuelve al destino cuando los campos se habilitan de nuevo
  useEffect(() => {
    if (isSubmitting || !focusAfterSubmit.current) return
    formRef.current?.elements.destino?.focus()
    focusAfterSubmit.current = false
  }, [isSubmitting])

  const limpiarError = (campo) => {
    if (fieldErrors[campo]) setFieldErrors((current) => ({ ...current, [campo]: undefined }))
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    limpiarError(name)
  }

  // Otro canal pide otro formato de destino: el error del anterior ya no aplica
  const onCanalChange = (id) => {
    setValues((current) => ({ ...current, canal: id }))
    limpiarError('destino')
  }

  const onTipoChange = (tipo, marcado) => {
    setValues((current) => {
      if (isEdit) return { ...current, tipos: [tipo] }
      const tipos = marcado ? [...current.tipos, tipo] : current.tipos.filter((item) => item !== tipo)
      // Siempre en el orden de las opciones, para que los POST salgan en ese orden
      return { ...current, tipos: TIPOS_AVISO_REGLA.map(({ id }) => id).filter((id) => tipos.includes(id)) }
    })
    limpiarError('tipos')
  }

  const enfocar = (campo) => {
    const form = formRef.current
    const elemento = campo === 'tipos' ? form.querySelector('input[name="tipos"]') : form.elements[campo]
    elemento?.focus()
  }

  const mostrarErrorDelBack = (error) => {
    if (error.status === 400) {
      setFormError(getErrorValidacionRegla(error))
      focusAfterSubmit.current = true
      return
    }
    const mensaje = getErrorGenerico(error)
    if (mensaje) showToast(mensaje)
  }

  const crear = async () => {
    const altas = getAltasRegla(values)
    const resultados = await Promise.allSettled(altas.map((datos) => crearRegla(datos)))
    const fallidas = altas.filter((_, index) => resultados[index].status === 'rejected')
    const creadas = altas.length - fallidas.length

    if (creadas === 0) {
      setIsSubmitting(false)
      mostrarErrorDelBack(/** @type {PromiseRejectedResult} */ (resultados[0]).reason)
      return
    }
    // Salió una de las dos: la que se creó ya está en la lista, y la otra se puede volver a crear sola
    if (fallidas.length > 0) {
      const faltante = getTipoAvisoRegla(fallidas[0].tipo_aviso).label
      showToast(`Se creó la regla, pero no la de ${faltante}. Creala de nuevo marcando solo ${faltante}.`)
    }
    onSaved(creadas)
  }

  const editar = async () => {
    const cambios = getCambiosRegla(values, regla)
    // Editar sin cambiar nada no necesita ir al back
    if (Object.keys(cambios).length === 0) {
      onClose()
      return
    }
    try {
      await actualizarRegla(regla.id, cambios)
      onSaved(1)
    } catch (error) {
      setIsSubmitting(false)
      if (error.status === 404) onGone()
      else mostrarErrorDelBack(error)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    const errors = validarRegla(values)
    setFormError('')
    setFieldErrors(errors)
    const primero = Object.keys(errors)[0]
    if (primero) {
      enfocar(primero)
      return
    }

    setIsSubmitting(true)
    if (isEdit) await editar()
    else await crear()
  }

  const textoGuardar = isEdit
    ? 'Guardar cambios'
    : values.tipos.length === 2
      ? 'Crear 2 reglas'
      : 'Crear regla'

  return (
    <Modal
      title={isEdit ? 'Editar regla' : 'Nueva regla'}
      description={
        isEdit
          ? 'Los cambios valen para los próximos avisos que se envíen.'
          : 'Elegí por dónde sale el aviso, a quién le llega y qué avisos recibe.'
      }
      onClose={onClose}
      isBusy={isSubmitting}
    >
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
          >
            <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
            <p>{formError}</p>
          </div>
        )}

        <fieldset disabled={isSubmitting} className="min-w-0">
          <legend className={legendClass}>Canal</legend>
          <div className="grid grid-cols-3 gap-0.5 rounded-control bg-black/5 p-1 dark:bg-white/5">
            {CANALES_NOTIFICACION.map(({ id, label, Icon, disponible }) => (
              <label
                key={id}
                className={`group ${canalBase} ${disponible ? `${canalHabilitado} ${conFoco}` : canalDeshabilitado}`}
              >
                <input
                  type="radio"
                  name="canal"
                  value={id}
                  checked={values.canal === id}
                  onChange={() => onCanalChange(id)}
                  disabled={!disponible}
                  className="sr-only"
                />
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={disponible ? iconCanal : undefined} />
                <span className="max-w-full truncate">{label}</span>
                {!disponible && (
                  <span className="text-xs font-normal">No disponible</span>
                )}
              </label>
            ))}
          </div>
        </fieldset>

        <Field name="destino" label={canal.destino.label} hint={canal.destino.hint} error={fieldErrors.destino}>
          {(props) => (
            <input
              {...props}
              {...canal.destino.inputProps}
              onChange={onChange}
              disabled={isSubmitting}
              aria-required
              autoComplete="off"
              autoFocus
              value={values.destino}
              placeholder={canal.destino.placeholder}
              className="field px-3.5 tabular-nums"
            />
          )}
        </Field>

        <Field name="etiqueta" label="Etiqueta" error={fieldErrors.etiqueta}>
          {(props) => (
            <div className="flex flex-col gap-1">
              <input
                {...props}
                onChange={onChange}
                disabled={isSubmitting}
                aria-required
                type="text"
                autoComplete="off"
                maxLength={MAX_ETIQUETA_REGLA}
                value={values.etiqueta}
                placeholder="Ej.: Grupo Taller"
                className="field px-3.5"
              />
              <p className={`self-end text-xs tabular-nums ${textMuted}`}>
                {values.etiqueta.length} / {MAX_ETIQUETA_REGLA}
                <span className="sr-only"> caracteres</span>
              </p>
            </div>
          )}
        </Field>

        <fieldset
          disabled={isSubmitting}
          aria-describedby={fieldErrors.tipos ? recibeErrorId : undefined}
          aria-required
          className="min-w-0"
        >
          <legend className={legendClass}>
            Recibe
            {!isEdit && <span className={`font-normal ${textMuted}`}> (podés marcar los dos)</span>}
          </legend>
          <div className="flex flex-col gap-0.5">
            {TIPOS_AVISO_REGLA.map(({ id, label, Icon }) => {
              const elegido = values.tipos.includes(id)
              return (
                <label key={id} className={`${opcionBase} ${elegido ? opcionElegida : opcionIdle}`}>
                  <input
                    type={isEdit ? 'radio' : 'checkbox'}
                    name="tipos"
                    value={id}
                    checked={elegido}
                    onChange={(event) => onTipoChange(id, event.target.checked)}
                    aria-invalid={Boolean(fieldErrors.tipos)}
                    className={marca}
                  />
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={textMuted} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              )
            })}
          </div>
          {fieldErrors.tipos && (
            <p id={recibeErrorId} className={errorClass}>
              {fieldErrors.tipos}
            </p>
          )}
          {!isEdit && values.tipos.length === 2 && !fieldErrors.tipos && (
            <p className={`mt-1.5 text-sm ${textMuted}`}>Se crean dos reglas, una por cada tipo de aviso.</p>
          )}
        </fieldset>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isSubmitting} className={cancelClass}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
            {isSubmitting ? 'Guardando…' : textoGuardar}
          </button>
        </div>
      </form>
    </Modal>
  )
}
