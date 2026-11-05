import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import PanelMessage from '../../components/admin/PanelMessage'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'

/*
 * Detalle de un checklist del historial (/admin/maquinas/:id/historial/checklists/:checklistId), de solo lectura.
 * Provisorio: el detalle con respuestas, fotos y observaciones llega en la próxima issue de M-07.
 * "Volver al historial" vuelve a la lista con los filtros con los que se abrió (llegan en el state del enlace y
 * sobreviven a recargar); si se entró directo, a la pestaña Checklists sin filtros
 */
export default function MachineChecklistPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const listado = typeof state?.listado === 'string' ? state.listado : ''

  // Desde la lista se llega con la página scrolleada: el detalle se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="flex flex-col gap-4 sm:gap-6">
      <Link
        to={`${RUTAS_MAQUINAS.historial(id)}${listado}`}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver al historial
      </Link>

      <PanelMessage
        titleAs="h1"
        icon={ClipboardCheck}
        title="Detalle del checklist"
        description="Acá vas a ver las respuestas, las fotos y las observaciones del checklist. Disponible en la próxima versión."
      />
    </article>
  )
}
