import { ArrowLeft, CloudOff, FileQuestion, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import ChecklistDetalle, { ChecklistDetalleSkeleton } from '../../components/admin/ChecklistDetalle'
import PanelMessage from '../../components/admin/PanelMessage'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'
import { useChecklistHistorial } from '../../hooks/useChecklistHistorial'
import { useEquipo } from '../../hooks/useEquipo'
import { obtenerEquipo } from '../../services/equiposService'

/*
 * Detalle de un checklist del historial (/admin/maquinas/:id/historial/checklists/:checklistId), de solo lectura.
 * Pide el checklist y, en paralelo, el equipo (para el título y para saber si tiene horas de motor). Como todo va en
 * la ruta, recargar o compartir el enlace vuelve a abrir el mismo checklist.
 * Si el back responde 404 (el checklist no existe o es de otro equipo, o no existe el equipo) muestra "Checklist
 * no encontrado"; un error de red, "Reintentar".
 * "Volver al historial" vuelve a la lista con los filtros con los que se abrió (llegan en el state del enlace y
 * sobreviven a recargar); si se entró directo, a la pestaña Checklists sin filtros
 */
export default function MachineChecklistPage() {
  const { id, checklistId } = useParams()
  const { state } = useLocation()
  const listado = typeof state?.listado === 'string' ? state.listado : ''
  const volverHref = `${RUTAS_MAQUINAS.historial(id)}${listado}`

  const equipo = useEquipo(id, obtenerEquipo)
  const checklist = useChecklistHistorial(id, checklistId)

  // Desde la lista se llega con la página scrolleada: el detalle se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [checklistId])

  const retry = () => {
    if (equipo.status === 'error') equipo.retry()
    if (checklist.status === 'error') checklist.retry()
  }

  let content
  if (equipo.status === 'not-found' || checklist.status === 'not-found') {
    content = (
      <PanelMessage
        titleAs="h1"
        icon={FileQuestion}
        title="Checklist no encontrado"
        description="El checklist que buscás no existe o no es de este equipo. Revisá el enlace o buscalo en el historial."
      >
        <Link to={volverHref} className="btn-tonal">
          Volver al historial
        </Link>
      </PanelMessage>
    )
  } else if (equipo.status === 'error' || checklist.status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        titleAs="h1"
        icon={CloudOff}
        title="No pudimos cargar el checklist"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (equipo.status === 'loading' || checklist.status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando checklist…
        </p>
        <ChecklistDetalleSkeleton />
      </div>
    )
  } else {
    content = <ChecklistDetalle checklist={checklist.checklist} equipo={equipo.equipo} />
  }

  return (
    <article className="flex flex-col gap-4 sm:gap-6">
      <Link
        to={volverHref}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver al historial
      </Link>

      {content}
    </article>
  )
}
