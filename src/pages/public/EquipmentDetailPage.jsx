import { ArrowLeft, CloudOff, PackageX, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import CatalogMessage from '../../components/public/CatalogMessage'
import EquipmentDetail, { EquipmentDetailSkeleton } from '../../components/public/EquipmentDetail'
import { useEquipo } from '../../hooks/useEquipo'
import { getEquipo } from '../../services/catalogoService'

/*
 * Detalle de un equipo del catálogo (/catalogo/:id).
 * Es una sola página para todos los equipos: el id de la URL decide qué equipo se le pide al back.
 */
export default function EquipmentDetailPage() {
  const { id } = useParams()
  const { status, equipo, retry } = useEquipo(id, getEquipo)

  // El layout se comparte con el catálogo: cada equipo se ve desde arriba
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
        <EquipmentDetailSkeleton />
      </div>
    )
  } else if (status === 'not-found') {
    content = (
      <CatalogMessage
        titleAs="h1"
        icon={PackageX}
        title="Este equipo no está disponible"
        description="Puede que ya no esté en el catálogo. Mirá los demás equipos disponibles para tu obra."
      >
        <Link to="/catalogo" className="btn-primary">
          Ver catálogo
        </Link>
      </CatalogMessage>
    )
  } else if (status === 'error') {
    content = (
      <CatalogMessage
        role="alert"
        titleAs="h1"
        icon={CloudOff}
        title="No pudimos cargar el equipo"
        description="Revisá tu conexión e intentá de nuevo en unos segundos."
      >
        <button type="button" onClick={retry} className="btn-primary">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </CatalogMessage>
    )
  } else {
    content = <EquipmentDetail equipo={equipo} />
  }

  return (
    <article
      aria-labelledby={status === 'success' ? 'detalle-titulo' : undefined}
      className="page-container pt-8 pb-8 sm:pt-12"
    >
      <Link
        to="/catalogo"
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver al catálogo
      </Link>

      <div className="mt-6">{content}</div>
    </article>
  )
}
