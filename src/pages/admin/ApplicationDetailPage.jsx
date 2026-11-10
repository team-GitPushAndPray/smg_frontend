import { ArrowLeft, Construction } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import PanelMessage from '../../components/admin/PanelMessage'
import { RUTAS_POSTULACIONES } from '../../config/rutasPanel'

/*
 * /admin/postulaciones/:id (requiere ver Postulaciones): ficha de un postulante. Por ahora es un aviso de "en
 * construcción"; los datos, el CV y el cambio de estado se completan en la próxima issue.
 * "Volver a la bandeja" vuelve con los filtros con los que se abrió (llegan en el state del enlace); si se entró
 * directo, a la bandeja sin filtros
 */
export default function ApplicationDetailPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const listado = typeof state?.listado === 'string' ? state.listado : ''
  const volverHref = `${RUTAS_POSTULACIONES.bandeja}${listado}`

  // Desde la bandeja se llega con la página scrolleada: la ficha se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  return (
    <article className="flex flex-col gap-4">
      <Link
        to={volverHref}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver a la bandeja
      </Link>

      <PanelMessage
        titleAs="h1"
        icon={Construction}
        title="Ficha en construcción"
        description="Acá vas a ver los datos del postulante, su CV y el estado de la postulación. Se habilita en una próxima etapa."
      />
    </article>
  )
}
