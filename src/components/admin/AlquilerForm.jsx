import { Lock, RotateCw, UserPlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { RUTAS_ALQUILERES } from '../../config/rutasPanel'
import { useClientes } from '../../hooks/useClientes'
import { useEquiposAlquilables } from '../../hooks/useEquiposAlquilables'
import { useToast } from '../../hooks/useToast'
import { crearAlquiler, obtenerAlquiler } from '../../services/alquileresService'
import {
  codigosNoDisponibles,
  duracionAlquiler,
  ERROR_FIN_ANTERIOR,
  fechaCalendario,
  formatFechaAlquiler,
  MAX_CONTACTO_OBRA,
  validarAltaAlquiler,
} from '../../utils/alquileres'
import { validarUbicacion } from '../../utils/ubicacion'
import { getErrorGenerico } from '../../utils/usuarios'
import ClienteCombobox from './ClienteCombobox'
import ClienteFormModal from './ClienteFormModal'
import ConfirmDialog from './ConfirmDialog'
import EquiposSelector from './EquiposSelector'
import { Field } from './FormField'
import UbicacionInput from './UbicacionInput'

/** @import { AlquilerAlta, Cliente } from '../../types/alquileres' */

const sectionClass = 'glass flex flex-col gap-5 p-6 sm:p-8'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Solo los clientes activos: a uno inactivo el back no le deja cargar alquileres (409)
const FILTRO_CLIENTES_ACTIVOS = { q: '', estado: 'activos' }

const UBICACION_VACIA = { latitud: null, longitud: null, ubicacion_referencia: '' }

const ERROR_CLIENTE_INACTIVO = 'Ese cliente ya no está activo. Elegí otro.'
const ERROR_EQUIPOS_GENERICO =
  'Algún equipo dejó de estar disponible mientras cargabas. Revisá la selección y volvé a confirmar.'

function getValoresIniciales() {
  return {
    fecha_inicio: fechaCalendario(),
    fecha_fin_prevista: '',
    contacto_obra_nombre: '',
    contacto_obra_telefono: '',
    observaciones: '',
  }
}

function porRazonSocial(a, b) {
  return a.razon_social.localeCompare(b.razon_social, 'es', { sensitivity: 'base' })
}

// Los clientes creados desde el formulario se suman a la lista sin esperar a recargarla
function unirClientes(clientes, creados) {
  const ids = new Set(clientes.map((cliente) => cliente.id))
  const nuevos = creados.filter((cliente) => !ids.has(cliente.id))
  return nuevos.length === 0 ? clientes : [...clientes, ...nuevos].sort(porRazonSocial)
}

/**
 * Body del POST: los opcionales vacíos no viajan
 * @returns {AlquilerAlta}
 */
function getBody({ clienteId, equipos, valores, ubicacion }) {
  const opcional = (texto) => texto.trim() || undefined
  return {
    cliente_id: clienteId,
    equipo_ids: equipos.map((equipo) => equipo.id),
    fecha_inicio: valores.fecha_inicio,
    fecha_fin_prevista: valores.fecha_fin_prevista,
    latitud: ubicacion.latitud,
    longitud: ubicacion.longitud,
    ubicacion_referencia: ubicacion.ubicacion_referencia.trim(),
    contacto_obra_nombre: opcional(valores.contacto_obra_nombre),
    contacto_obra_telefono: opcional(valores.contacto_obra_telefono),
    observaciones: opcional(valores.observaciones),
  }
}

function Seccion({ id, numero, title, description, optional, children }) {
  return (
    <section aria-labelledby={id} className={sectionClass}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-full bg-black/5 text-sm font-medium text-neutral-700 tabular-nums dark:bg-white/10 dark:text-neutral-300"
        >
          {numero}
        </span>
        <div className="flex flex-col gap-1">
          <h2 id={id} className="text-lg leading-7 font-semibold">
            {title}
            {optional && <span className={`text-sm font-normal ${textMuted}`}> (opcional)</span>}
          </h2>
          {description && <p className={`text-sm text-pretty ${textMuted}`}>{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

/**
 * Alta de un alquiler en un solo formulario: cliente (solo activos, con "Nuevo cliente" que lo deja elegido), equipos
 * disponibles (Máquinas y Aditamentos), fechas, ubicación de la obra, contacto en obra y observaciones.
 * Antes de enviar valida en el front y muestra un resumen para confirmar, porque después del alta no se puede cambiar
 * ni el cliente ni los equipos. Al crear, pide el detalle (la respuesta del POST no tiene su forma), avisa y lleva a
 * /alquileres/:id con el detalle en el state de la navegación.
 * Si el back responde que algún equipo ya no está disponible (409), recarga la lista, saca de la selección los que
 * fallaron y los nombra; si el cliente dejó de estar activo, lo marca en su campo y recarga los clientes.
 * `puedeVerEquipos`: el rol tiene Máquinas (GET /equipos lo exige); sin él no se pide la lista y se explica por qué
 * @param {{ puedeVerEquipos: boolean }} props
 */
export default function AlquilerForm({ puedeVerEquipos }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const formRef = useRef(null)
  const equiposRef = useRef(null)

  const clientesActivos = useClientes(FILTRO_CLIENTES_ACTIVOS)
  const [clientesCreados, setClientesCreados] = useState(/** @type {Cliente[]} */ ([]))
  const clientes = unirClientes(clientesActivos.clientes, clientesCreados)
  const clientesStatus = clientesActivos.isLoading && !clientesActivos.hasData ? 'loading' : clientesActivos.status

  const equiposDisponibles = useEquiposAlquilables({ habilitado: puedeVerEquipos })

  const [clienteId, setClienteId] = useState(/** @type {number | null} */ (null))
  const [equipos, setEquipos] = useState(/** @type {object[]} */ ([]))
  const [valores, setValores] = useState(getValoresIniciales)
  const [ubicacion, setUbicacion] = useState(UBICACION_VACIA)

  const [mostrarErrores, setMostrarErrores] = useState(false)
  // Errores que vienen del back y se borran apenas se corrige el campo
  const [errorClienteBack, setErrorClienteBack] = useState('')
  const [avisoEquipos, setAvisoEquipos] = useState(/** @type {{ codigos: string[], mensaje: string } | null} */ (null))

  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  // Después de un intento fallido, el foco va al primer campo con error (espera al render que lo marca)
  const [enfocarError, setEnfocarError] = useState(0)
  const [enfocarEquipos, setEnfocarEquipos] = useState(0)

  const errores = validarAltaAlquiler({ clienteId, equipos, ...valores })
  const erroresUbicacion = validarUbicacion(ubicacion)
  const hayErrores = Object.keys(errores).length > 0 || Object.keys(erroresUbicacion).length > 0

  // La fecha de fin anterior al inicio se marca apenas pasa, sin esperar al primer intento
  const finAnterior = errores.fecha_fin_prevista === ERROR_FIN_ANTERIOR
  const visible = (campo) => (mostrarErrores || (campo === 'fecha_fin_prevista' && finAnterior) ? errores[campo] : undefined)
  const errorCliente = errorClienteBack || visible('cliente')

  useEffect(() => {
    if (enfocarError === 0) return
    const campo = formRef.current?.querySelector('[aria-invalid="true"]')
    campo?.focus()
    campo?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [enfocarError])

  useEffect(() => {
    if (enfocarEquipos === 0) return
    equiposRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    equiposRef.current?.focus({ preventScroll: true })
  }, [enfocarEquipos])

  const cambiarValor = (event) => {
    const { name, value } = event.target
    setValores((current) => ({ ...current, [name]: value }))
  }

  const cambiarCliente = (id) => {
    setClienteId(id)
    setErrorClienteBack('')
  }

  const onClienteCreado = (cliente) => {
    setIsClienteModalOpen(false)
    setClientesCreados((current) => [...current, cliente])
    cambiarCliente(cliente.id)
    showToast(`Se creó el cliente ${cliente.razon_social}.`, { tipo: 'exito' })
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setMostrarErrores(true)
    if (hayErrores || errorClienteBack) {
      setEnfocarError((value) => value + 1)
      return
    }
    setSubmitError('')
    setIsConfirmOpen(true)
  }

  // 409 por equipos: recarga la lista para saber cuáles ya no están y los saca de la selección
  const manejarEquiposNoDisponibles = async (mensaje) => {
    const codigosDelBack = codigosNoDisponibles(mensaje)
    let fallidos
    try {
      const disponibles = await equiposDisponibles.recargar()
      const ids = new Set(disponibles.map((equipo) => equipo.id))
      fallidos = equipos.filter((equipo) => !ids.has(equipo.id))
    } catch {
      // Sin la lista nueva, quedan los que nombró el back
      fallidos = equipos.filter((equipo) => codigosDelBack.includes(equipo.codigoInterno))
    }

    const idsFallidos = new Set(fallidos.map((equipo) => equipo.id))
    setEquipos((current) => current.filter((equipo) => !idsFallidos.has(equipo.id)))
    const codigos = fallidos.length > 0 ? fallidos.map((equipo) => equipo.codigoInterno) : codigosDelBack
    setAvisoEquipos({ codigos, mensaje: ERROR_EQUIPOS_GENERICO })
    setEnfocarEquipos((value) => value + 1)
  }

  const confirmar = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    let creado
    try {
      creado = await crearAlquiler(getBody({ clienteId, equipos, valores, ubicacion }))
    } catch (error) {
      setIsSubmitting(false)
      const sobreCliente = /cliente/i.test(error.message ?? '')
      if ((error.status === 409 || error.status === 404) && sobreCliente) {
        setIsConfirmOpen(false)
        setClienteId(null)
        setClientesCreados((current) => current.filter((cliente) => cliente.id !== clienteId))
        setErrorClienteBack(ERROR_CLIENTE_INACTIVO)
        clientesActivos.reload()
        setEnfocarError((value) => value + 1)
      } else if (error.status === 409) {
        setIsConfirmOpen(false)
        await manejarEquiposNoDisponibles(error.message)
      } else if (error.status === 400) {
        setSubmitError(error.message)
      } else if (error.status === 403) {
        // El aviso de permiso ya lo muestra apiFetch
        setIsConfirmOpen(false)
      } else {
        setSubmitError(getErrorGenerico(error) ?? '')
      }
      return
    }

    // La respuesta del POST no tiene la forma del detalle: se pide antes de ir. Si falla, el detalle lo vuelve a pedir
    const detalle = await obtenerAlquiler(creado.id).catch(() => null)
    showToast(`Se creó el alquiler N.º ${creado.id}.`, { tipo: 'exito' })
    navigate(RUTAS_ALQUILERES.detalle(creado.id), { replace: true, state: detalle ? { alquiler: detalle } : null })
  }

  const cliente = clientes.find((item) => item.id === clienteId) ?? null

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Seccion
          id="alquiler-cliente"
          numero={1}
          title="Cliente"
          description="Solo aparecen los clientes activos. Si es nuevo, cargalo desde acá."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <Field name="cliente" label="Cliente" error={errorCliente} className="min-w-0 flex-1">
              {(props) => (
                <ClienteCombobox
                  id={props.id}
                  label="Cliente"
                  clientes={clientes}
                  status={clientesStatus}
                  value={clienteId}
                  onChange={cambiarCliente}
                  opcionTodos={null}
                  enFormulario
                  invalid={props['aria-invalid']}
                  describedBy={props['aria-describedby']}
                />
              )}
            </Field>
            <button
              type="button"
              onClick={() => setIsClienteModalOpen(true)}
              className="interactive inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-brand-700 hover:bg-brand-600/10 sm:mt-7 dark:text-brand-400 dark:hover:bg-brand-500/15"
            >
              <UserPlus size={18} strokeWidth={1.75} aria-hidden="true" />
              Nuevo cliente
            </button>
          </div>
          {clientesStatus === 'error' && (
            <p role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-700 dark:text-neutral-300">
              No pudimos cargar los clientes.
              <button type="button" onClick={clientesActivos.retry} className="btn-tonal min-h-9 px-3 text-sm">
                <RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />
                Reintentar
              </button>
            </p>
          )}
        </Seccion>

        <div ref={equiposRef} tabIndex={-1} className="scroll-mt-24 rounded-card outline-none">
          <Seccion
            id="alquiler-equipos"
            numero={2}
            title="Equipos"
            description="Solo se pueden elegir los que están disponibles. Podés buscarlos por código o categoría."
          >
            <EquiposSelector
              equipos={equiposDisponibles.equipos}
              status={equiposDisponibles.status}
              isLoading={equiposDisponibles.isLoading}
              hasData={equiposDisponibles.hasData}
              onRetry={equiposDisponibles.retry}
              seleccionados={equipos}
              onChange={setEquipos}
              error={visible('equipos')}
              sinPermiso={!puedeVerEquipos}
              aviso={avisoEquipos}
              onCerrarAviso={() => setAvisoEquipos(null)}
            />
          </Seccion>
        </div>

        <Seccion id="alquiler-fechas" numero={3} title="Fechas" description="La de fin se puede prorrogar después del alta.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="fecha_inicio" label="Inicio" error={visible('fecha_inicio')}>
              {(props) => (
                <input
                  {...props}
                  type="date"
                  value={valores.fecha_inicio}
                  onChange={cambiarValor}
                  className="field px-3.5 tabular-nums"
                />
              )}
            </Field>
            <Field name="fecha_fin_prevista" label="Fin prevista" error={visible('fecha_fin_prevista')}>
              {(props) => (
                <input
                  {...props}
                  type="date"
                  value={valores.fecha_fin_prevista}
                  onChange={cambiarValor}
                  min={valores.fecha_inicio || undefined}
                  className="field px-3.5 tabular-nums"
                />
              )}
            </Field>
          </div>
        </Seccion>

        <Seccion
          id="alquiler-ubicacion"
          numero={4}
          title="Ubicación de la obra"
          description="Donde se entregan los equipos. Pegá lo que te pasaron por WhatsApp o lo que copiaste de Google Maps."
        >
          <UbicacionInput value={ubicacion} onChange={setUbicacion} mostrarErrores={mostrarErrores} />
        </Seccion>

        <Seccion
          id="alquiler-contacto"
          numero={5}
          title="Contacto en obra"
          optional
          description="A quién llamar al llegar con los equipos."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="contacto_obra_nombre" label="Nombre">
              {(props) => (
                <input
                  {...props}
                  type="text"
                  value={valores.contacto_obra_nombre}
                  onChange={cambiarValor}
                  maxLength={MAX_CONTACTO_OBRA.nombre}
                  autoComplete="off"
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
                  value={valores.contacto_obra_telefono}
                  onChange={cambiarValor}
                  maxLength={MAX_CONTACTO_OBRA.telefono}
                  autoComplete="off"
                  placeholder="299 512-3456"
                  className="field px-3.5"
                />
              )}
            </Field>
          </div>
        </Seccion>

        <Seccion id="alquiler-observaciones" numero={6} title="Observaciones" optional>
          <Field name="observaciones" label="Observaciones">
            {(props) => (
              <textarea
                {...props}
                value={valores.observaciones}
                onChange={cambiarValor}
                rows={3}
                placeholder="Lo que haya que saber del alquiler: condiciones acordadas, horarios de acceso…"
                className="field resize-y px-3.5 py-2.5"
              />
            )}
          </Field>
        </Seccion>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            to={RUTAS_ALQUILERES.listado}
            className="interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Cancelar
          </Link>
          <button type="submit" className="btn-primary">
            Revisar y confirmar
          </button>
        </div>
      </form>

      {isClienteModalOpen && (
        <ClienteFormModal onClose={() => setIsClienteModalOpen(false)} onSaved={onClienteCreado} />
      )}

      {isConfirmOpen && (
        <ConfirmDialog
          title="Confirmá el alquiler"
          confirmLabel="Crear alquiler"
          submittingLabel="Creando…"
          isSubmitting={isSubmitting}
          error={submitError}
          onConfirm={confirmar}
          onClose={() => setIsConfirmOpen(false)}
        >
          <ResumenAlquiler cliente={cliente} equipos={equipos} valores={valores} ubicacion={ubicacion} />
        </ConfirmDialog>
      )}
    </>
  )
}

// Lo que no se va a poder cambiar (cliente y equipos), las fechas y la obra, con el aviso arriba
function ResumenAlquiler({ cliente, equipos, valores, ubicacion }) {
  const dias = duracionAlquiler(valores.fecha_inicio, valores.fecha_fin_prevista)

  return (
    <>
      <p className="flex items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
        <Lock size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
        <span>
          <strong className="font-medium">Después del alta no vas a poder cambiar el cliente ni los equipos.</strong> La
          fecha de fin, la ubicación y el contacto en obra sí se pueden editar.
        </span>
      </p>

      <dl className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className={textMuted}>Cliente</dt>
          <dd className="font-medium text-black dark:text-white">{cliente?.razon_social ?? '—'}</dd>
        </div>

        <div className="flex flex-col gap-1.5">
          <dt className={textMuted}>{equipos.length === 1 ? 'Equipo' : `Equipos (${equipos.length})`}</dt>
          <dd>
            <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {equipos.map((equipo) => (
                <li key={equipo.id} className="flex flex-wrap gap-x-2">
                  <span className="font-medium text-black tabular-nums dark:text-white">{equipo.codigoInterno}</span>
                  {equipo.categoria?.nombre && <span className={textMuted}>{equipo.categoria.nombre}</span>}
                </li>
              ))}
            </ul>
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className={textMuted}>Fechas</dt>
          <dd className="text-black tabular-nums dark:text-white">
            {formatFechaAlquiler(valores.fecha_inicio)} al {formatFechaAlquiler(valores.fecha_fin_prevista)}
            {dias && <span className={textMuted}> · {dias === 1 ? '1 día' : `${dias} días`}</span>}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className={textMuted}>Obra</dt>
          <dd className="text-black dark:text-white">{ubicacion.ubicacion_referencia.trim()}</dd>
        </div>
      </dl>
    </>
  )
}
