import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import AdminPlaceholder from '../../components/admin/AdminPlaceholder'
import EquipoForm from '../../components/admin/EquipoForm'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'
import { useToast } from '../../hooks/useToast'
import { crearEquipo } from '../../services/equiposService'

// Alta: la ubicación y la descripción viajan solo si se cargaron
function getBodyAlta({ ubicacion, descripcion, ...datos }) {
  return { ...datos, ...(ubicacion && { ubicacion }), ...(descripcion && { descripcion }) }
}

/*
 * Alta (/admin/maquinas/nuevo) y edición (/admin/maquinas/:id/editar) de un equipo: comparten pantalla y formulario.
 * Al crear, avisa y lleva al detalle del equipo nuevo (reemplazando el alta en el historial). La edición llega en F-21
 */
export default function MachineFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  if (id) return <AdminPlaceholder title="Editar equipo" description="Modificá los datos del equipo." />

  const crear = async (datos) => {
    const creado = await crearEquipo(getBodyAlta(datos))
    showToast(`Se creó el equipo ${creado.codigoInterno}.`, { tipo: 'exito' })
    navigate(RUTAS_MAQUINAS.detalle(creado.id), { replace: true })
  }

  return (
    <article className="flex flex-col gap-4">
      <Link
        to={RUTAS_MAQUINAS.inventario}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver al inventario
      </Link>

      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">Nuevo equipo</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Cargá una máquina o un aditamento al inventario.</p>
        </header>

        <EquipoForm submitLabel="Crear equipo" cancelTo={RUTAS_MAQUINAS.inventario} onSubmit={crear} />
      </div>
    </article>
  )
}
