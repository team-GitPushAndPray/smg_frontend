import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { cambiarPassword } from '../../services/authService'
import { getErrorGenerico, MIN_PASSWORD } from '../../utils/usuarios'
import { Field, PasswordInput } from './FormField'
import Modal from './Modal'

const PASSWORD_ACTUAL_INCORRECTA = 'La contraseña actual no es correcta'

const initialValues = { passwordActual: '', passwordNueva: '', passwordRepetida: '' }

// Las contraseñas no se recortan: un espacio puede ser parte de ellas
function validate(values) {
  const errors = {}
  if (!values.passwordActual) errors.passwordActual = 'Ingresá tu contraseña actual.'
  if (!values.passwordNueva) errors.passwordNueva = 'Ingresá la contraseña nueva.'
  else if (values.passwordNueva.length < MIN_PASSWORD) {
    errors.passwordNueva = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`
  } else if (values.passwordNueva === values.passwordActual) {
    errors.passwordNueva = 'La contraseña nueva tiene que ser distinta de la actual.'
  }
  if (!values.passwordRepetida) errors.passwordRepetida = 'Repetí la contraseña nueva.'
  else if (values.passwordRepetida !== values.passwordNueva) errors.passwordRepetida = 'Las contraseñas no coinciden.'
  return errors
}

/*
 * Cambio de la contraseña propia. Lo puede usar cualquier usuario logueado, sin importar su rol.
 * El back responde 400 en dos casos: la validación del body manda `message` como lista (se muestra arriba del formulario)
 * y la contraseña actual incorrecta lo manda como texto (se marca en ese campo). El resto de los errores va a un aviso.
 * Al guardar llama a `onSaved()`; el modal lo cierra quien lo abrió. Arranca vacío cada vez que se monta.
 */
export default function ChangePasswordModal({ onClose, onSaved }) {
  const { showToast } = useToast()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)
  // Campo a enfocar cuando el back lo rechaza: espera al render que vuelve a habilitar los campos
  const focusAfterSubmit = useRef(null)

  useEffect(() => {
    if (isSubmitting || !focusAfterSubmit.current) return
    formRef.current?.elements[focusAfterSubmit.current]?.focus()
    focusAfterSubmit.current = null
  }, [isSubmitting, fieldErrors])

  const onChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // El error de un campo se va apenas se lo corrige
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const errors = validate(values)
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) {
      // El foco va al primer campo con error
      formRef.current.elements[Object.keys(errors)[0]].focus()
      return
    }

    setIsSubmitting(true)
    try {
      await cambiarPassword(values.passwordActual, values.passwordNueva)
      onSaved()
    } catch (error) {
      setIsSubmitting(false)
      if (error.status === 400 && Array.isArray(error.data?.message)) {
        setFormError(error.message)
      } else if (error.status === 400) {
        setFieldErrors({ passwordActual: PASSWORD_ACTUAL_INCORRECTA })
        focusAfterSubmit.current = 'passwordActual'
      } else {
        const mensaje = getErrorGenerico(error)
        if (mensaje) showToast(mensaje)
      }
    }
  }

  return (
    <Modal
      title="Cambiar contraseña"
      description="Después del cambio seguís con la sesión abierta."
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

        <Field name="passwordActual" label="Contraseña actual" error={fieldErrors.passwordActual}>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="current-password"
              autoFocus
              value={values.passwordActual}
              onChange={onChange}
              disabled={isSubmitting}
            />
          )}
        </Field>

        <Field
          name="passwordNueva"
          label="Contraseña nueva"
          hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
          error={fieldErrors.passwordNueva}
        >
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="new-password"
              value={values.passwordNueva}
              onChange={onChange}
              disabled={isSubmitting}
            />
          )}
        </Field>

        <Field name="passwordRepetida" label="Repetir contraseña nueva" error={fieldErrors.passwordRepetida}>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="new-password"
              value={values.passwordRepetida}
              onChange={onChange}
              disabled={isSubmitting}
            />
          )}
        </Field>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
