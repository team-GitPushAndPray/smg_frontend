import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { crearVacante, editarVacante } from '../../services/vacantesService'
import { getErrorGenerico } from '../../utils/usuarios'
import {
  getCambiosVacante,
  getDatosVacante,
  LIMITES_VACANTE,
  VACANTE_VACIA,
  validarVacante,
} from '../../utils/vacantes'
import { Field } from './FormField'
import Modal from './Modal'

/** @import { Vacante } from '../../types/vacantes' */

const textMuted = 'text-neutral-600 dark:text-neutral-400'
const cancelClass =
  'interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

const AYUDA_REQUISITOS =
  'Detallá experiencia, conocimientos y habilidades que buscás. Este texto se usa para evaluar a los postulantes.'

// Caracteres escritos sobre el máximo del back, debajo de cada campo de texto largo
function Contador({ valor, maximo }) {
  return (
    <p className={`self-end text-xs tabular-nums ${textMuted}`}>
      {valor.length} / {maximo}
      <span className="sr-only"> caracteres</span>
    </p>
  )
}

/**
 * Alta y edición de una vacante: título, descripción y requisitos, los tres obligatorios (con trim, como el back).
 * Con `vacante` edita y manda solo lo que cambió; sin ella, crea una vacante activa. Mientras guarda, los campos y los
 * botones quedan bloqueados (sin envíos duplicados) y el modal no se puede cerrar.
 * Errores: un 400 va arriba del formulario; un 404 (la vacante ya no existe) llama a `onGone`; el resto va a un aviso.
 * Al guardar llama a `onSaved`; el modal lo cierra la página
 * @param {{ vacante: Vacante | null, onClose: () => void, onSaved: () => void, onGone: () => void }} props
 */
export default function VacanteFormModal({ vacante, onClose, onSaved, onGone }) {
  const isEdit = Boolean(vacante)
  const { showToast } = useToast()
  const [values, setValues] = useState(() =>
    vacante
      ? { titulo: vacante.titulo, descripcion: vacante.descripcion, requisitos: vacante.requisitos }
      : VACANTE_VACIA,
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)
  // Si el back rechaza el envío, el foco vuelve al título cuando los campos se habilitan de nuevo
  const focusAfterSubmit = useRef(false)

  useEffect(() => {
    if (isSubmitting || !focusAfterSubmit.current) return
    formRef.current?.elements.titulo?.focus()
    focusAfterSubmit.current = false
  }, [isSubmitting])

  const onChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // El error de un campo se va apenas se lo corrige
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    const datos = getDatosVacante(values)
    const errors = validarVacante(datos)
    setFormError('')
    setFieldErrors(errors)
    const primero = Object.keys(errors)[0]
    if (primero) {
      formRef.current.elements[primero].focus()
      return
    }

    const cambios = isEdit ? getCambiosVacante(datos, vacante) : datos
    // Editar sin cambiar nada no necesita ir al back
    if (isEdit && Object.keys(cambios).length === 0) {
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit) await editarVacante(vacante.id, cambios)
      else await crearVacante(datos)
      onSaved()
    } catch (error) {
      setIsSubmitting(false)
      if (error.status === 404) {
        onGone()
      } else if (error.status === 400) {
        setFormError('Revisá los datos de la vacante: hay un campo vacío o demasiado largo.')
        focusAfterSubmit.current = true
      } else {
        const mensaje = getErrorGenerico(error)
        if (mensaje) showToast(mensaje)
      }
    }
  }

  const fieldProps = { onChange, disabled: isSubmitting, 'aria-required': true }

  return (
    <Modal
      title={isEdit ? 'Editar vacante' : 'Nueva vacante'}
      description={
        isEdit
          ? 'Los cambios se ven enseguida en «Trabajá con nosotros».'
          : 'Se publica activa en «Trabajá con nosotros» y empieza a recibir postulaciones.'
      }
      onClose={onClose}
      isBusy={isSubmitting}
      size="lg"
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

        <Field name="titulo" label="Título" error={fieldErrors.titulo}>
          {(props) => (
            <input
              {...props}
              {...fieldProps}
              type="text"
              autoComplete="off"
              autoFocus
              maxLength={LIMITES_VACANTE.titulo}
              value={values.titulo}
              placeholder="Ej.: Mecánico de maquinaria pesada"
              className="field px-3.5"
            />
          )}
        </Field>

        <Field name="descripcion" label="Descripción" error={fieldErrors.descripcion}>
          {(props) => (
            <div className="flex flex-col gap-1">
              <textarea
                {...props}
                {...fieldProps}
                rows={4}
                maxLength={LIMITES_VACANTE.descripcion}
                value={values.descripcion}
                placeholder="Qué tareas tiene el puesto, dónde se trabaja y qué ofrece la empresa."
                className="field resize-y px-3.5 py-2.5"
              />
              <Contador valor={values.descripcion} maximo={LIMITES_VACANTE.descripcion} />
            </div>
          )}
        </Field>

        <Field name="requisitos" label="Requisitos" hint={AYUDA_REQUISITOS} error={fieldErrors.requisitos}>
          {(props) => (
            <div className="flex flex-col gap-1">
              <textarea
                {...props}
                {...fieldProps}
                rows={5}
                maxLength={LIMITES_VACANTE.requisitos}
                value={values.requisitos}
                placeholder="Ej.: 3 años de experiencia en motores diésel, carnet de conducir, manejo de herramientas de diagnóstico."
                className="field resize-y px-3.5 py-2.5"
              />
              <Contador valor={values.requisitos} maximo={LIMITES_VACANTE.requisitos} />
            </div>
          )}
        </Field>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isSubmitting} className={cancelClass}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear vacante'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
