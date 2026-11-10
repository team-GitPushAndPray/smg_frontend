import { CircleAlert, FileText, LoaderCircle } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { trabajaConNosotros } from '../../data/empresa'
import { enviarPostulacion } from '../../services/postulacionesService'
import {
  formatearPeso,
  getDatosPostulacion,
  getErrorPostulacion,
  LIMITES,
  MAX_CV_MB,
  POSTULACION_VACIA,
  validarCv,
  validarPostulacion,
} from '../../utils/postulaciones'
import { Field } from '../admin/FormField'

const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Zona para elegir el CV: el input nativo queda oculto (sr-only, pero enfocable) y su foco se ve en la zona (peer)
const cvZoneClass =
  'interactive flex min-h-16 cursor-pointer items-center gap-3 rounded-control border border-dashed border-(--field-border) bg-(--field-bg) px-3.5 py-3 hover:border-brand-600/50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus-ring) peer-disabled:pointer-events-none peer-disabled:opacity-60 peer-aria-[invalid=true]:border-(--field-border-invalid) dark:hover:border-brand-400/50'

function CvInput({ cv, disabled, onChange, ...accesibilidad }) {
  return (
    // relative: al enfocar el input oculto (error al enviar), el scroll lo lleva a la zona y no a otro lado
    <div className="relative">
      <input
        {...accesibilidad}
        type="file"
        accept="application/pdf"
        disabled={disabled}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="peer sr-only"
      />
      <label htmlFor={accesibilidad.id} className={cvZoneClass}>
        <span className="icon-badge">
          <FileText size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{cv ? cv.name : 'Elegí tu CV'}</span>
          <span className={`text-sm ${textMuted}`}>
            {cv ? formatearPeso(cv.size) : `Solo PDF, hasta ${MAX_CV_MB} MB`}
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-sm font-medium text-brand-700 dark:text-brand-400">
          {cv ? 'Cambiar' : 'Elegir'}
        </span>
      </label>
    </div>
  )
}

/*
 * Formulario de postulación a una vacante. Valida todo antes de enviar (el CV, apenas se elige) y no envía nada con
 * errores: el foco va al primer campo a corregir. Mientras se envía, el botón queda bloqueado (y el modal no se cierra:
 * `onSubmittingChange`). Al salir bien llama a `onEnviada` con los datos; si la vacante ya no está activa, a `onVacanteCerrada`
 */
export default function ApplicationForm({ vacante, onSubmittingChange, onEnviada, onVacanteCerrada }) {
  const honeypotId = useId()
  const consentimientoId = useId()
  const [values, setValues] = useState(POSTULACION_VACIA)
  const [cv, setCv] = useState(null)
  const [consentimiento, setConsentimiento] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Corta un segundo envío antes de que el botón llegue a deshabilitarse (doble toque rápido)
  const enviandoRef = useRef(false)

  const limpiarError = (campo) => {
    if (fieldErrors[campo]) setFieldErrors((current) => ({ ...current, [campo]: undefined }))
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // El error de un campo se va apenas se lo corrige
    limpiarError(name)
  }

  // El archivo se valida apenas se elige; si se cancela la elección, no hay nada que marcar todavía
  const onCvChange = (file) => {
    setCv(file)
    setFieldErrors((current) => ({ ...current, cv: file ? validarCv(file) : undefined }))
  }

  const setSubmitting = (value) => {
    enviandoRef.current = value
    setIsSubmitting(value)
    onSubmittingChange(value)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (enviandoRef.current) return
    const form = event.currentTarget
    const datos = getDatosPostulacion(values)
    const errors = validarPostulacion(datos, { cv, consentimiento })
    setFieldErrors(errors)
    setFormError('')
    const primerError = Object.keys(errors)[0]
    if (primerError) {
      form.elements[primerError]?.focus()
      return
    }

    setSubmitting(true)
    try {
      await enviarPostulacion({ vacanteId: vacante.id, datos, website: values.website, cv })
      onEnviada(datos)
    } catch (error) {
      setSubmitting(false)
      const { vacanteCerrada, campo, mensaje } = getErrorPostulacion(error)
      if (vacanteCerrada) {
        onVacanteCerrada()
      } else if (campo) {
        setFieldErrors({ [campo]: mensaje })
        form.elements[campo]?.focus()
      } else {
        setFormError(mensaje)
      }
    }
  }

  const fieldProps = { onChange, disabled: isSubmitting, className: 'field px-3.5' }

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
      {/* Honeypot: invisible y fuera del orden de Tab. Una persona nunca lo completa; si llega con texto, el back descarta la postulación */}
      <div aria-hidden="true" className="honeypot">
        <label htmlFor={honeypotId}>Sitio web</label>
        <input
          id={honeypotId}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={onChange}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="nombre" label="Nombre" error={fieldErrors.nombre}>
          {(props) => (
            <input
              {...props}
              {...fieldProps}
              type="text"
              autoComplete="given-name"
              autoCapitalize="words"
              maxLength={LIMITES.nombre}
              value={values.nombre}
            />
          )}
        </Field>
        <Field name="apellido" label="Apellido" error={fieldErrors.apellido}>
          {(props) => (
            <input
              {...props}
              {...fieldProps}
              type="text"
              autoComplete="family-name"
              autoCapitalize="words"
              maxLength={LIMITES.apellido}
              value={values.apellido}
            />
          )}
        </Field>
        <Field name="email" label="Email" error={fieldErrors.email}>
          {(props) => (
            <input
              {...props}
              {...fieldProps}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={LIMITES.email}
              placeholder="nombre@gmail.com"
              value={values.email}
            />
          )}
        </Field>
        <Field name="telefono" label="Teléfono" error={fieldErrors.telefono}>
          {(props) => (
            <input
              {...props}
              {...fieldProps}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={LIMITES.telefono}
              placeholder="299 123 4567"
              value={values.telefono}
            />
          )}
        </Field>
      </div>

      <Field name="mensaje" label="Mensaje" optional error={fieldErrors.mensaje}>
        {(props) => (
          <div className="flex flex-col gap-1">
            <textarea
              {...props}
              {...fieldProps}
              rows={4}
              maxLength={LIMITES.mensaje}
              placeholder="Contanos sobre tu experiencia o por qué te interesa la búsqueda."
              value={values.mensaje}
              className="field resize-y px-3.5 py-2.5"
            />
            <p className={`self-end text-xs tabular-nums ${textMuted}`}>
              {values.mensaje.length} / {LIMITES.mensaje}
              <span className="sr-only"> caracteres</span>
            </p>
          </div>
        )}
      </Field>

      <Field name="cv" label="CV" error={fieldErrors.cv}>
        {(props) => <CvInput {...props} cv={cv} disabled={isSubmitting} onChange={onCvChange} />}
      </Field>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={consentimientoId}
          className="-mx-2 flex min-h-11 cursor-pointer items-start gap-3 rounded-control px-2 py-2.5 text-sm has-disabled:pointer-events-none has-disabled:opacity-60"
        >
          <input
            id={consentimientoId}
            name="consentimiento"
            type="checkbox"
            checked={consentimiento}
            disabled={isSubmitting}
            onChange={(event) => {
              setConsentimiento(event.target.checked)
              limpiarError('consentimiento')
            }}
            aria-invalid={Boolean(fieldErrors.consentimiento)}
            aria-describedby={fieldErrors.consentimiento ? `${consentimientoId}-error` : undefined}
            className="mt-px size-4.5 shrink-0 cursor-pointer accent-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) dark:accent-brand-500"
          />
          <span>{trabajaConNosotros.consentimiento}</span>
        </label>
        {fieldErrors.consentimiento && (
          <p id={`${consentimientoId}-error`} className="text-sm text-brand-700 dark:text-brand-400">
            {fieldErrors.consentimiento}
          </p>
        )}
      </div>

      {/* El error del envío va junto al botón: en el celular es lo que está a la vista al tocar Enviar */}
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
        >
          <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
        {isSubmitting ? 'Enviando…' : 'Enviar postulación'}
      </button>
    </form>
  )
}
