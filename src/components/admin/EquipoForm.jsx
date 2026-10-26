import { ChevronDown, CircleAlert, LoaderCircle, RotateCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useCategorias } from '../../hooks/useCategorias'
import { useToast } from '../../hooks/useToast'
import { getErrorEquipo, TIPOS_EQUIPO } from '../../utils/equipos'
import { Field } from './FormField'

// Rango de año que acepta el back
const ANIO_MINIMO = 1950
const ANIO_MAXIMO = new Date().getFullYear() + 1

const CODIGO_REPETIDO = 'Ya existe un equipo con ese código interno.'

const DESCRIPCION_TIPO = {
  maquina: 'Lleva modelo, año, n.º de serie y horas de motor.',
  aditamento: 'Implemento que se monta en una máquina: no tiene motor ni datos de máquina.',
}

// Campos que solo tiene una máquina: en un aditamento quedan vacíos y no se envían
const MAQUINA_VACIA = { modelo: '', anio: '', nSerie: '', horasMotorActual: '' }
const SIN_ERRORES_DE_MAQUINA = { modelo: undefined, anio: undefined, nSerie: undefined, horasMotorActual: undefined }

const sectionClass = 'glass flex flex-col gap-5 p-6 sm:p-8'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Radio interno = radio del control menos el padding de la pista (p-1)
const segmentClass =
  'flex min-h-11 cursor-pointer items-center justify-center rounded-[calc(var(--radius-control)-0.25rem)] px-5 text-sm font-medium whitespace-nowrap text-neutral-600 transition duration-200 ease-glass hover:text-black active:scale-98 has-checked:bg-(--segment-active-bg) has-checked:text-black has-checked:shadow-(--segment-active-shadow) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring) has-disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-white dark:has-checked:text-white'

function getInitialValues(equipo) {
  return {
    tipo: equipo?.tipo ?? 'maquina',
    codigoInterno: equipo?.codigoInterno ?? '',
    categoriaId: equipo?.categoria?.id ? String(equipo.categoria.id) : '',
    marca: equipo?.marca ?? '',
    ubicacion: equipo?.ubicacion ?? '',
    descripcion: equipo?.descripcion ?? '',
    modelo: equipo?.modelo ?? '',
    anio: equipo?.anio != null ? String(equipo.anio) : '',
    nSerie: equipo?.nSerie ?? '',
    horasMotorActual: '',
  }
}

function getData(values) {
  const data = {}
  for (const [campo, valor] of Object.entries(values)) data[campo] = valor.trim()
  return data
}

// En la edición, la ubicación y la descripción que ya estaban cargadas se pueden cambiar, pero no borrar
function getOpcionalesFijos(equipo) {
  return { ubicacion: Boolean(equipo?.ubicacion?.trim()), descripcion: Boolean(equipo?.descripcion?.trim()) }
}

function validate(data, { conHoras, fijos }) {
  const errors = {}
  if (!data.codigoInterno) errors.codigoInterno = 'Ingresá el código interno.'
  if (!data.categoriaId) errors.categoriaId = 'Elegí una categoría.'
  if (!data.marca) errors.marca = 'Ingresá la marca.'
  if (fijos.ubicacion && !data.ubicacion) errors.ubicacion = 'La ubicación ya estaba cargada: no se puede dejar vacía.'
  if (fijos.descripcion && !data.descripcion) {
    errors.descripcion = 'La descripción ya estaba cargada: no se puede dejar vacía.'
  }
  if (data.tipo !== 'maquina') return errors

  if (!data.modelo) errors.modelo = 'Ingresá el modelo.'
  if (!data.anio) errors.anio = 'Ingresá el año.'
  else if (!/^\d{4}$/.test(data.anio)) errors.anio = 'Ingresá el año con 4 dígitos.'
  else if (Number(data.anio) < ANIO_MINIMO || Number(data.anio) > ANIO_MAXIMO) {
    errors.anio = `El año tiene que estar entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`
  }
  if (!data.nSerie) errors.nSerie = 'Ingresá el n.º de serie.'
  if (conHoras) {
    if (!data.horasMotorActual) errors.horasMotorActual = 'Ingresá las horas de motor.'
    else if (!/^\d+$/.test(data.horasMotorActual)) errors.horasMotorActual = 'Ingresá un número entero, sin decimales.'
  }
  return errors
}

// Datos con los nombres del DTO del back. Los opcionales pueden llegar vacíos: cada pantalla decide si los envía
function getDatos(data, conHoras) {
  const { tipo, codigoInterno, categoriaId, marca, ubicacion, descripcion } = data
  const datos = { tipo, codigoInterno, categoriaId: Number(categoriaId), marca, ubicacion, descripcion }
  if (tipo !== 'maquina') return datos

  datos.modelo = data.modelo
  datos.anio = Number(data.anio)
  datos.nSerie = data.nSerie
  if (conHoras) datos.horasMotorActual = Number(data.horasMotorActual)
  return datos
}

// Un 400 puede traer varias validaciones: se muestran todas
function getMensajesValidacion(error) {
  const mensajes = error.data?.message
  return Array.isArray(mensajes) ? mensajes : [error.message]
}

function SelectChevron() {
  return (
    <ChevronDown
      size={18}
      strokeWidth={1.75}
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-neutral-600 dark:text-neutral-400"
    />
  )
}

function Seccion({ id, title, description, children }) {
  return (
    <section aria-labelledby={id} className={sectionClass}>
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-lg font-semibold">
          {title}
        </h2>
        {description && <p className={`text-sm text-pretty ${textMuted}`}>{description}</p>}
      </div>
      {children}
    </section>
  )
}

/*
 * Formulario de un equipo del módulo Máquinas, pensado para el alta y la edición. Con `equipo` arranca precargado,
 * el tipo no se puede cambiar, no muestra las horas de motor (el PATCH no las acepta: tienen su propia acción) y
 * la ubicación y la descripción ya cargadas no se pueden vaciar.
 * Valida en el front y llama a `onSubmit(datos)` con los nombres del DTO; en un aditamento, sin campos de máquina.
 * Si `onSubmit` termina sin salir de la pantalla (por ejemplo, no había cambios), el formulario vuelve a habilitarse.
 * Si falla: 409 se marca en el código interno, 400 muestra los mensajes del back arriba y el resto va a un aviso
 */
export default function EquipoForm({ equipo, submitLabel, cancelTo, onSubmit }) {
  const isEdit = Boolean(equipo)
  const conHoras = !isEdit
  const fijos = getOpcionalesFijos(equipo)
  const { showToast } = useToast()
  const { status: categoriasStatus, categorias, retry: retryCategorias } = useCategorias()
  const [values, setValues] = useState(() => getInitialValues(equipo))
  const [fieldErrors, setFieldErrors] = useState({})
  const [formErrors, setFormErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)
  const alertRef = useRef(null)
  // Lo que se enfoca cuando el back rechaza el envío: espera al render que vuelve a habilitar los campos
  const focusAfterSubmit = useRef(null)

  useEffect(() => {
    if (isSubmitting || !focusAfterSubmit.current) return
    if (focusAfterSubmit.current === 'alert') alertRef.current?.focus()
    else formRef.current?.elements[focusAfterSubmit.current]?.focus()
    focusAfterSubmit.current = null
  }, [isSubmitting, fieldErrors, formErrors])

  const esMaquina = values.tipo === 'maquina'

  const onChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // El error de un campo se va apenas se lo corrige
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  const onTipoChange = (tipo) => {
    // Al pasar a aditamento se borra lo cargado de máquina, para que nunca se envíe
    setValues((current) => ({ ...current, tipo, ...(tipo === 'aditamento' && MAQUINA_VACIA) }))
    setFieldErrors((current) => ({ ...current, ...SIN_ERRORES_DE_MAQUINA }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = getData(values)
    const errors = validate(data, { conHoras, fijos })
    setFieldErrors(errors)
    setFormErrors([])
    if (Object.keys(errors).length > 0) {
      // El foco va al primer campo con error
      formRef.current.elements[Object.keys(errors)[0]].focus()
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(getDatos(data, conHoras))
      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      if (error.status === 409) {
        setFieldErrors({ codigoInterno: CODIGO_REPETIDO })
        focusAfterSubmit.current = 'codigoInterno'
      } else if (error.status === 400) {
        setFormErrors(getMensajesValidacion(error))
        focusAfterSubmit.current = 'alert'
      } else {
        const mensaje = getErrorEquipo(error)
        if (mensaje) showToast(mensaje)
      }
    }
  }

  let categoriaHint
  if (categoriasStatus === 'loading') categoriaHint = 'Cargando categorías…'
  else if (categoriasStatus === 'success' && categorias.length === 0) categoriaHint = 'Todavía no hay categorías cargadas.'

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formErrors.length > 0 && (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="flex scroll-mt-24 items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 outline-none dark:bg-brand-500/15 dark:text-brand-300"
        >
          <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">El servidor no aceptó los datos:</p>
            <ul className="list-disc pl-4">
              {formErrors.map((mensaje) => (
                <li key={mensaje}>{mensaje}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Seccion
        id="equipo-tipo"
        title="Tipo de equipo"
        description={isEdit ? 'El tipo no se puede cambiar.' : DESCRIPCION_TIPO[values.tipo]}
      >
        <fieldset>
          <legend className="sr-only">Tipo de equipo</legend>
          <div className="grid grid-cols-2 gap-0.5 rounded-control bg-black/5 p-1 sm:inline-grid dark:bg-white/5">
            {Object.entries(TIPOS_EQUIPO).map(([tipo, label]) => (
              <label key={tipo} className={segmentClass}>
                <input
                  type="radio"
                  name="tipo"
                  value={tipo}
                  checked={values.tipo === tipo}
                  onChange={() => onTipoChange(tipo)}
                  disabled={isSubmitting || isEdit}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </Seccion>

      <Seccion id="equipo-datos-generales" title="Datos generales">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="codigoInterno"
            label="Código interno"
            hint="Se guarda en mayúsculas. No puede repetirse."
            error={fieldErrors.codigoInterno}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={values.codigoInterno}
                onChange={onChange}
                disabled={isSubmitting}
                className="field px-3.5"
              />
            )}
          </Field>

          <div className="flex flex-col gap-2">
            <Field name="categoriaId" label="Categoría" hint={categoriaHint} error={fieldErrors.categoriaId}>
              {(props) => (
                <div className="relative">
                  <select
                    {...props}
                    value={values.categoriaId}
                    onChange={onChange}
                    disabled={isSubmitting || categoriasStatus !== 'success'}
                    className="field appearance-none pr-11 pl-3.5"
                  >
                    <option value="" disabled>
                      Elegí una categoría
                    </option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              )}
            </Field>
            {categoriasStatus === 'error' && (
              <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <p className="text-brand-700 dark:text-brand-400">No pudimos cargar las categorías.</p>
                <button
                  type="button"
                  onClick={retryCategorias}
                  className="interactive -mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />
                  Reintentar
                </button>
              </div>
            )}
          </div>

          <Field name="marca" label="Marca" error={fieldErrors.marca}>
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="off"
                value={values.marca}
                onChange={onChange}
                disabled={isSubmitting}
                className="field px-3.5"
              />
            )}
          </Field>

          <Field name="ubicacion" label="Ubicación" optional={!fijos.ubicacion} error={fieldErrors.ubicacion}>
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="off"
                value={values.ubicacion}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="Ej.: Depósito central"
                className="field px-3.5"
              />
            )}
          </Field>

          <Field
            name="descripcion"
            label="Descripción"
            optional={!fijos.descripcion}
            error={fieldErrors.descripcion}
            className="sm:col-span-2"
          >
            {(props) => (
              <textarea
                {...props}
                rows={4}
                value={values.descripcion}
                onChange={onChange}
                disabled={isSubmitting}
                className="field resize-y px-3.5 py-2.5"
              />
            )}
          </Field>
        </div>
      </Seccion>

      {esMaquina && (
        <Seccion id="equipo-datos-maquina" title="Datos de máquina">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="modelo" label="Modelo" error={fieldErrors.modelo}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  autoComplete="off"
                  value={values.modelo}
                  onChange={onChange}
                  disabled={isSubmitting}
                  className="field px-3.5"
                />
              )}
            </Field>

            <Field name="anio" label="Año" hint={`Entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`} error={fieldErrors.anio}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={values.anio}
                  onChange={onChange}
                  disabled={isSubmitting}
                  className="field px-3.5 tabular-nums"
                />
              )}
            </Field>

            <Field name="nSerie" label="N.º de serie" error={fieldErrors.nSerie}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={values.nSerie}
                  onChange={onChange}
                  disabled={isSubmitting}
                  className="field px-3.5"
                />
              )}
            </Field>

            {conHoras && (
              <Field
                name="horasMotorActual"
                label="Horas de motor iniciales"
                hint="Las que marca el horómetro hoy, sin decimales."
                error={fieldErrors.horasMotorActual}
              >
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={values.horasMotorActual}
                    onChange={onChange}
                    disabled={isSubmitting}
                    className="field px-3.5 tabular-nums"
                  />
                )}
              </Field>
            )}
          </div>
        </Seccion>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          to={cancelTo}
          aria-disabled={isSubmitting || undefined}
          className={`interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white ${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}
        >
          Cancelar
        </Link>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
          {isSubmitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

function SkeletonSeccion({ count }) {
  return (
    <div className={sectionClass}>
      <span className={`h-6 w-40 ${skeletonBar}`} />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <span className={`h-4 w-24 ${skeletonBar}`} />
            <span className={`h-11 ${skeletonBar}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Marcador con la forma del formulario mientras carga el equipo a editar
export function EquipoFormSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className={sectionClass}>
        <span className={`h-6 w-40 ${skeletonBar}`} />
        <span className={`h-12 w-full sm:w-64 ${skeletonBar}`} />
      </div>
      <SkeletonSeccion count={4} />
      <SkeletonSeccion count={3} />
    </div>
  )
}
