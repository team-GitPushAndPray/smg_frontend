import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { crearRol, editarRol } from '../../services/rolesService'
import { getErrorGenerico } from '../../utils/usuarios'
import { Field } from './FormField'
import Modal from './Modal'

const NOMBRE_REPETIDO = 'Ya existe un rol con ese nombre'

function getData(values) {
  return { nombre: values.nombre.trim(), descripcion: values.descripcion.trim() }
}

// Alta: el nombre y la descripción solo si se cargó. Edición: solo lo que cambió; una descripción borrada viaja como null
function getBody(data, rol) {
  if (!rol) return { nombre: data.nombre, ...(data.descripcion && { descripcion: data.descripcion }) }
  const cambios = {}
  if (data.nombre !== rol.nombre) cambios.nombre = data.nombre
  if (data.descripcion !== (rol.descripcion ?? '')) cambios.descripcion = data.descripcion || null
  return cambios
}

/*
 * Alta y edición de un rol: nombre y descripción (opcional). Los permisos se cambian desde la matriz.
 * Errores: 409 se marca en el nombre; un 400 con lista de mensajes va arriba del formulario y uno con texto,
 * debajo del nombre; el resto va a un aviso. Al guardar llama a `onSaved(rolDelBack)`; el modal lo cierra la página.
 */
export default function RoleFormModal({ rol, onClose, onSaved }) {
  const isEdit = Boolean(rol)
  const { showToast } = useToast()
  const [values, setValues] = useState(() => ({ nombre: rol?.nombre ?? '', descripcion: rol?.descripcion ?? '' }))
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
    const data = getData(values)
    setFormError('')
    if (!data.nombre) {
      setFieldErrors({ nombre: 'Ingresá el nombre del rol.' })
      formRef.current.elements.nombre.focus()
      return
    }
    setFieldErrors({})

    const body = getBody(data, rol)
    // Editar sin cambiar nada no necesita ir al back
    if (isEdit && Object.keys(body).length === 0) {
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      const guardado = isEdit ? await editarRol(rol.id, body) : await crearRol(body)
      onSaved(guardado, body)
    } catch (error) {
      setIsSubmitting(false)
      if (error.status === 409) {
        setFieldErrors({ nombre: NOMBRE_REPETIDO })
        focusAfterSubmit.current = 'nombre'
      } else if (error.status === 400 && Array.isArray(error.data?.message)) {
        setFormError(error.message)
      } else if (error.status === 400) {
        setFieldErrors({ nombre: error.message })
        focusAfterSubmit.current = 'nombre'
      } else {
        const mensaje = getErrorGenerico(error)
        if (mensaje) showToast(mensaje)
      }
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar rol' : 'Nuevo rol'}
      description={
        isEdit ? 'Los permisos se cambian desde la matriz.' : 'Se crea sin acceso: después elegí sus módulos en la matriz.'
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
              placeholder="Ej.: taller"
              className="field px-3.5"
            />
          )}
        </Field>

        <Field name="descripcion" label="Descripción" optional error={fieldErrors.descripcion}>
          {(props) => (
            <textarea
              {...props}
              rows={3}
              value={values.descripcion}
              onChange={onChange}
              disabled={isSubmitting}
              placeholder="Para qué se usa este rol"
              className="field resize-y px-3.5 py-2.5"
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
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear rol'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
