import { Archive, ArrowLeft, CloudOff, PackageX, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import EquipoForm, { EquipoFormSkeleton } from '../../components/admin/EquipoForm'
import PanelMessage from '../../components/admin/PanelMessage'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'
import { useEquipo } from '../../hooks/useEquipo'
import { useToast } from '../../hooks/useToast'
import { crearEquipo, editarEquipo, obtenerEquipo } from '../../services/equiposService'
import { getCambiosEquipo, getNombreEquipo } from '../../utils/equipos'

const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Alta: la ubicación y la descripción viajan solo si se cargaron
function getBodyAlta({ ubicacion, descripcion, ...datos }) {
  return { ...datos, ...(ubicacion && { ubicacion }), ...(descripcion && { descripcion }) }
}

/*
 * El PATCH responde 409 por código interno repetido o porque el equipo está dado de baja. Si el body no lleva
 * el código, solo puede ser la baja; si lo lleva, se reconoce la baja por el mensaje del back
 */
function esConflictoPorBaja(error, cambios) {
  if (error.status !== 409) return false
  return !Object.hasOwn(cambios, 'codigoInterno') || /baja/i.test(error.message ?? '')
}

function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
      {children}
    </Link>
  )
}

function Encabezado({ title, children }) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {children}
    </header>
  )
}

// Al crear, avisa y lleva al detalle del equipo nuevo (reemplazando el alta en el historial)
function NewMachine() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const crear = async (datos) => {
    const creado = await crearEquipo(getBodyAlta(datos))
    showToast(`Se creó el equipo ${creado.codigoInterno}.`, { tipo: 'exito' })
    navigate(RUTAS_MAQUINAS.detalle(creado.id), { replace: true })
  }

  return (
    <article className="flex flex-col gap-4">
      <BackLink to={RUTAS_MAQUINAS.inventario}>Volver al inventario</BackLink>

      <div className="flex flex-col gap-6">
        <Encabezado title="Nuevo equipo">
          <p className={textMuted}>Cargá una máquina o un aditamento al inventario.</p>
        </Encabezado>

        <EquipoForm submitLabel="Crear equipo" cancelTo={RUTAS_MAQUINAS.inventario} onSubmit={crear} />
      </div>
    </article>
  )
}

/*
 * Edición de los datos generales: horas, estado y baja tienen sus propias acciones. Envía solo los campos modificados.
 * Un equipo dado de baja no se puede editar; si se da de baja mientras se edita, el 409 lleva de vuelta al detalle
 */
function EditMachine({ id }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { status, equipo, retry } = useEquipo(id, obtenerEquipo)
  const detalle = RUTAS_MAQUINAS.detalle(id)

  // Desde el inventario se llega con la página scrolleada: el formulario se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const guardar = async (datos) => {
    const cambios = getCambiosEquipo(equipo, datos)
    if (Object.keys(cambios).length === 0) {
      showToast('No hay cambios para guardar.', { tipo: 'info' })
      return
    }

    try {
      await editarEquipo(equipo.id, cambios)
    } catch (error) {
      if (!esConflictoPorBaja(error, cambios)) throw error
      showToast('El equipo está dado de baja: no se puede editar.')
      navigate(detalle, { replace: true })
      return
    }
    showToast('Se guardaron los cambios del equipo.', { tipo: 'exito' })
    navigate(detalle, { replace: true })
  }

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true" className="flex flex-col gap-6">
        <p role="status" className="sr-only">
          Cargando equipo…
        </p>
        <Encabezado title="Editar equipo">
          <span aria-hidden="true" className="h-6 w-56 max-w-full animate-pulse rounded-control bg-black/5 dark:bg-white/10" />
        </Encabezado>
        <EquipoFormSkeleton />
      </div>
    )
  } else if (status === 'not-found') {
    content = (
      <PanelMessage
        titleAs="h1"
        icon={PackageX}
        title="Equipo no encontrado"
        description="El equipo que querés editar no existe en el inventario. Revisá el enlace o buscalo en el listado."
      >
        <Link to={RUTAS_MAQUINAS.inventario} className="btn-tonal">
          Volver al inventario
        </Link>
      </PanelMessage>
    )
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        titleAs="h1"
        icon={CloudOff}
        title="No pudimos cargar el equipo"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (equipo.activo === false) {
    content = (
      <PanelMessage
        titleAs="h1"
        icon={Archive}
        title="Este equipo está dado de baja"
        description="Se conserva por su historial: se puede consultar, pero no editar."
      >
        <Link to={detalle} className="btn-tonal">
          Ver detalle
        </Link>
      </PanelMessage>
    )
  } else {
    content = (
      <div className="flex flex-col gap-6">
        <Encabezado title="Editar equipo">
          <p className={`break-words ${textMuted}`}>
            <span className="tabular-nums">{equipo.codigoInterno}</span> · {getNombreEquipo(equipo)}
          </p>
        </Encabezado>

        <EquipoForm equipo={equipo} submitLabel="Guardar cambios" cancelTo={detalle} onSubmit={guardar} />
      </div>
    )
  }

  return (
    <article className="flex flex-col gap-4">
      {status === 'not-found' ? (
        <BackLink to={RUTAS_MAQUINAS.inventario}>Volver al inventario</BackLink>
      ) : (
        <BackLink to={detalle}>Volver al detalle</BackLink>
      )}

      {content}
    </article>
  )
}

// Alta (/admin/maquinas/nuevo) y edición (/admin/maquinas/:id/editar) de un equipo: comparten el formulario
export default function MachineFormPage() {
  const { id } = useParams()
  return id ? <EditMachine key={id} id={id} /> : <NewMachine />
}
