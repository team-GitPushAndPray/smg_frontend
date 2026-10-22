import { ArrowLeft, CloudOff, PackageX, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import EquipoDetail, { EquipoDetailSkeleton } from '../../components/admin/EquipoDetail'
import PanelMessage from '../../components/admin/PanelMessage'
import { MODULOS, RUTAS_MAQUINAS } from '../../config/rutasPanel'
import { useEquipo } from '../../hooks/useEquipo'
import { usePermiso } from '../../hooks/usePermiso'
import { obtenerEquipo } from '../../services/equiposService'

/*
 * Detalle de un equipo del panel (/admin/maquinas/:id), activo o dado de baja.
 * Las fotos y el historial del equipo todavía no forman parte de esta pantalla
 */
export default function MachineDetailPage() {
  const { id } = useParams()
  const { puedeEditar } = usePermiso(MODULOS.MAQUINAS)
  const { status, equipo, retry } = useEquipo(id, obtenerEquipo)

  // Desde el inventario se llega con la página scrolleada: cada equipo se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando equipo…
        </p>
        <EquipoDetailSkeleton />
      </div>
    )
  } else if (status === 'not-found') {
    content = (
      <PanelMessage
        titleAs="h1"
        icon={PackageX}
        title="Equipo no encontrado"
        description="El equipo que buscás no existe en el inventario. Revisá el enlace o buscalo en el listado."
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
  } else {
    content = <EquipoDetail equipo={equipo} canEdit={puedeEditar} />
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

      {content}
    </article>
  )
}
