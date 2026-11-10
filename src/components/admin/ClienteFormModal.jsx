import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { crearCliente, editarCliente } from '../../services/clientesService'
import { getErrorGenerico } from '../../utils/usuarios'
import { Field } from './FormField'
import Modal from './Modal'

/** @import { Cliente, ClienteAlta, ClienteEdicion } from '../../types/alquileres' */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CUIT_REPETIDO = 'Ya existe un cliente con ese CUIT.'

// Campos que se pueden dejar vacíos. Contacto, localidad y observaciones no están: hoy el back los rechaza (400)
const OPCIONALES = ['cuit', 'telefono', 'email', 'direccion']

// Mismos máximos que el DTO del back
const MAX = { razon_social: 150, cuit: 20, telefono: 50, email: 150, direccion: 255 }

function getInitialValues(cliente) {
  return {
    razon_social: cliente?.razon_social ?? '',
    cuit: cliente?.cuit ?? '',
    telefono: cliente?.telefono ?? '',
    email: cliente?.email ?? '',
    direccion: cliente?.direccion ?? '',
  }
}

function getData(values) {
  return Object.fromEntries(Object.entries(values).map(([campo, valor]) => [campo, valor.trim()]))
}

function validate(data) {
  const errors = {}
  if (!data.razon_social) errors.razon_social = 'Ingresá la razón social.'
  if (data.email && !EMAIL_PATTERN.test(data.email)) errors.email = 'Ingresá un email válido.'
  return errors
}

/**
 * Alta: la razón social y los opcionales que se completaron. Edición: solo lo que cambió; un opcional que se vació
 * viaja como null (el back ignora los textos vacíos, así que con "" el dato no se borraría)
 * @returns {ClienteAlta | ClienteEdicion}
 */
function getBody(data, cliente) {
  if (!cliente) {
    return Object.fromEntries(Object.entries(data).filter(([, valor]) => valor))
  }
  const cambios = {}
  if (data.razon_social !== cliente.razon_social) cambios.razon_social = data.razon_social
  for (const campo of OPCIONALES) {
    if (data[campo] !== (cliente[campo] ?? '')) cambios[campo] = data[campo] || null
  }
  return cambios
}

/**
 * Alta y edición de un cliente. Con `cliente` se edita (precargado); sin él, se crea (nace activo).
 * Antes de enviar valida la razón social y, si se cargó, el formato del email.
 * Errores: 409 (CUIT de otro cliente) se marca en el CUIT, 400 muestra el mensaje del back arriba del formulario y el
 * resto va a un aviso; en todos los casos el modal queda abierto con lo cargado.
 * Al guardar llama a `onSaved(clienteDelBack)`; el modal lo cierra quien lo abrió
 * @param {{ cliente?: Cliente | null, onClose: () => void, onSaved: (cliente: Cliente) => void }} props
 */
export default function ClienteFormModal({ cliente = null, onClose, onSaved }) {
  const isEdit = Boolean(cliente)
  const { showToast } = useToast()
  const [values, setValues] = useState(() => getInitialValues(cliente))
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
    const errors = validate(data)
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) {
      // El foco va al primer campo con error
      formRef.current.elements[Object.keys(errors)[0]].focus()
      return
    }

    const body = getBody(data, cliente)
    // Editar sin cambiar nada no necesita ir al back
    if (isEdit && Object.keys(body).length === 0) {
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      const guardado = isEdit ? await editarCliente(cliente.id, body) : await crearCliente(body)
      onSaved(guardado)
    } catch (error) {
      setIsSubmitting(false)
      if (error.status === 409) {
        setFieldErrors({ cuit: CUIT_REPETIDO })
        focusAfterSubmit.current = 'cuit'
      } else if (error.status === 400) {
        setFormError(error.message)
      } else {
        const mensaje = getErrorGenerico(error)
        if (mensaje) showToast(mensaje)
      }
    }
  }

  const inputProps = (name) => ({
    value: values[name],
    onChange,
    disabled: isSubmitting,
    maxLength: MAX[name],
    autoComplete: 'off',
    className: 'field px-3.5',
  })

  return (
    <Modal
      title={isEdit ? 'Editar cliente' : 'Nuevo cliente'}
      description={
        isEdit
          ? 'Los cambios se ven en el listado y en los alquileres del cliente.'
          : 'Empresa a la que se le va a alquilar maquinaria. Solo la razón social es obligatoria.'
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
          <Field name="razon_social" label="Razón social" error={fieldErrors.razon_social} className="sm:col-span-2">
            {(props) => <input {...props} {...inputProps('razon_social')} type="text" autoFocus />}
          </Field>

          <Field name="cuit" label="CUIT" optional error={fieldErrors.cuit}>
            {(props) => <input {...props} {...inputProps('cuit')} type="text" placeholder="30-12345678-9" />}
          </Field>

          <Field name="telefono" label="Teléfono" optional error={fieldErrors.telefono}>
            {(props) => <input {...props} {...inputProps('telefono')} type="tel" inputMode="tel" />}
          </Field>

          <Field name="email" label="Email" optional error={fieldErrors.email} className="sm:col-span-2">
            {(props) => (
              <input
                {...props}
                {...inputProps('email')}
                type="email"
                inputMode="email"
                placeholder="contacto@empresa.com"
              />
            )}
          </Field>

          <Field name="direccion" label="Dirección" optional error={fieldErrors.direccion} className="sm:col-span-2">
            {(props) => <input {...props} {...inputProps('direccion')} type="text" />}
          </Field>
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
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
