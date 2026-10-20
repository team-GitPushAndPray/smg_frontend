import { ChevronDown, CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { crearUsuario, editarUsuario } from '../../services/usuariosService'
import { getErrorGenerico, getRolLabel, MIN_PASSWORD } from '../../utils/usuarios'
import { Field, PasswordInput } from './FormField'
import Modal from './Modal'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_REPETIDO = 'Ya existe un usuario con ese email'

function getInitialValues(usuario) {
  return {
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    email: usuario?.email ?? '',
    telefono: usuario?.telefono ?? '',
    password: '',
    rolId: usuario?.rol?.id ? String(usuario.rol.id) : '',
  }
}

function getData(values) {
  return {
    nombre: values.nombre.trim(),
    apellido: values.apellido.trim(),
    email: values.email.trim(),
    telefono: values.telefono.trim(),
    password: values.password,
    rolId: values.rolId,
  }
}

function validate(data, isEdit) {
  const errors = {}
  if (!data.nombre) errors.nombre = 'Ingresá el nombre.'
  if (!data.apellido) errors.apellido = 'Ingresá el apellido.'
  if (!data.email) errors.email = 'Ingresá el email.'
  else if (!EMAIL_PATTERN.test(data.email)) errors.email = 'Ingresá un email válido.'
  if (!isEdit) {
    if (!data.password) errors.password = 'Ingresá una contraseña.'
    else if (data.password.length < MIN_PASSWORD) {
      errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`
    }
  }
  if (!data.rolId) errors.rolId = 'Elegí un rol.'
  return errors
}

// Alta: todos los campos (el teléfono solo si se cargó). Edición: solo lo que cambió; un teléfono borrado viaja como null
function getBody(data, usuario) {
  if (!usuario) {
    const { telefono, rolId, ...rest } = data
    return { ...rest, ...(telefono && { telefono }), rolId: Number(rolId) }
  }
  const cambios = {}
  for (const campo of ['nombre', 'apellido', 'email']) {
    if (data[campo] !== usuario[campo]) cambios[campo] = data[campo]
  }
  if (data.telefono !== (usuario.telefono ?? '')) cambios.telefono = data.telefono || null
  if (Number(data.rolId) !== usuario.rol?.id) cambios.rolId = Number(data.rolId)
  return cambios
}

// El superAdmin nunca se ofrece. Un rol inactivo tampoco, salvo que sea el que el usuario ya tiene
function getRolOptions(roles, usuario) {
  return roles.filter((rol) => !rol.esSistema && (rol.activo !== false || rol.id === usuario?.rol?.id))
}

/*
 * Alta y edición de un usuario. Con `usuario` se edita (precargado y sin contraseña: la cambia cada uno desde su cuenta).
 * Errores: 409 se marca en el email, 400 muestra el mensaje del back arriba del formulario y el resto va a un aviso.
 * Al guardar llama a `onSaved(usuarioDelBack)`; el modal lo cierra la página.
 */
export default function UserFormModal({ usuario, roles, onClose, onSaved }) {
  const isEdit = Boolean(usuario)
  const { showToast } = useToast()
  const [values, setValues] = useState(() => getInitialValues(usuario))
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const rolOptions = getRolOptions(roles, usuario)
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
    const data = getData(values)
    const errors = validate(data, isEdit)
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) {
      // El foco va al primer campo con error
      formRef.current.elements[Object.keys(errors)[0]].focus()
      return
    }

    const body = getBody(data, usuario)
    // Editar sin cambiar nada no necesita ir al back
    if (isEdit && Object.keys(body).length === 0) {
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      const guardado = isEdit ? await editarUsuario(usuario.id, body) : await crearUsuario(body)
      onSaved(guardado)
    } catch (error) {
      setIsSubmitting(false)
      if (error.status === 409) {
        setFieldErrors({ email: EMAIL_REPETIDO })
        focusAfterSubmit.current = 'email'
      } else if (error.status === 400) {
        setFormError(error.message)
      } else {
        const mensaje = getErrorGenerico(error)
        if (mensaje) showToast(mensaje)
      }
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      description={
        isEdit
          ? 'La contraseña la cambia cada usuario desde su cuenta.'
          : 'Va a poder ingresar al panel con su email y esta contraseña.'
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

        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="nombre" label="Nombre" error={fieldErrors.nombre}>
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="off"
                autoFocus
                value={values.nombre}
                onChange={onChange}
                disabled={isSubmitting}
                className="field px-3.5"
              />
            )}
          </Field>

          <Field name="apellido" label="Apellido" error={fieldErrors.apellido}>
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="off"
                value={values.apellido}
                onChange={onChange}
                disabled={isSubmitting}
                className="field px-3.5"
              />
            )}
          </Field>

          <Field name="email" label="Email" error={fieldErrors.email} className="sm:col-span-2">
            {(props) => (
              <input
                {...props}
                type="email"
                inputMode="email"
                autoComplete="off"
                value={values.email}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="nombre@empresa.com"
                className="field px-3.5"
              />
            )}
          </Field>

          <Field name="telefono" label="Teléfono" optional error={fieldErrors.telefono}>
            {(props) => (
              <input
                {...props}
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={values.telefono}
                onChange={onChange}
                disabled={isSubmitting}
                className="field px-3.5"
              />
            )}
          </Field>

          <Field name="rolId" label="Rol" error={fieldErrors.rolId}>
            {(props) => (
              <div className="relative">
                <select
                  {...props}
                  value={values.rolId}
                  onChange={onChange}
                  disabled={isSubmitting}
                  className="field appearance-none pr-11 pl-3.5"
                >
                  <option value="" disabled>
                    Elegí un rol
                  </option>
                  {rolOptions.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {getRolLabel(rol)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-neutral-600 dark:text-neutral-400"
                />
              </div>
            )}
          </Field>

          {!isEdit && (
            <Field
              name="password"
              label="Contraseña"
              hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
              error={fieldErrors.password}
              className="sm:col-span-2"
            >
              {(props) => (
                <PasswordInput
                  {...props}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={onChange}
                  disabled={isSubmitting}
                />
              )}
            </Field>
          )}
        </div>

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
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
