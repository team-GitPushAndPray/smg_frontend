import { CloudOff, Inbox, RotateCw, SearchX } from 'lucide-react'
import { useLocation } from 'react-router'
import { useFiltrosPostulaciones } from '../../hooks/useFiltrosPostulaciones'
import { usePostulaciones } from '../../hooks/usePostulaciones'
import { useVacantes } from '../../hooks/useVacantes'
import { contar } from '../../utils/historial'
import PanelMessage from './PanelMessage'
import PostulacionesTable, { PostulacionesTableSkeleton } from './PostulacionesTable'
import PostulacionesToolbar from './PostulacionesToolbar'

const NOUN = { one: 'postulación', other: 'postulaciones' }
const textMuted = 'text-neutral-600 dark:text-neutral-400'

/*
 * Pestaña Bandeja del módulo Postulaciones: todas las postulaciones recibidas (GET /postulaciones), de la más nueva a
 * la más vieja como las manda el back, con filtros por vacante y estado que se combinan y viven en la URL
 * (?vacante_id=&estado=): cada cambio vuelve a pedir, y al volver de la ficha la bandeja sigue filtrada.
 * Las vacantes del filtro (activas e inactivas) se piden aparte; si fallan, solo ese filtro queda deshabilitado.
 * Sin resultados distingue "todavía no llegó ninguna" de "ninguna coincide con los filtros"
 */
export default function BandejaTab() {
  const { search } = useLocation()
  const { filtros, hasFilters, setFiltros, limpiarFiltros } = useFiltrosPostulaciones()
  const { status, postulaciones, isLoading, hasData, retry } = usePostulaciones(filtros)
  const vacantes = useVacantes()
  const vacantesStatus = vacantes.isLoading && !vacantes.hasData ? 'loading' : vacantes.status

  const total = postulaciones.length

  let content
  if (isLoading && !hasData) {
    content = <PostulacionesTableSkeleton />
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar las postulaciones"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (total === 0 && hasFilters) {
    content = (
      <PanelMessage
        icon={SearchX}
        title="No hay postulaciones con estos filtros"
        description="Probá con otra vacante u otro estado."
      >
        <button type="button" onClick={limpiarFiltros} className="btn-tonal">
          Limpiar filtros
        </button>
      </PanelMessage>
    )
  } else if (total === 0) {
    content = (
      <PanelMessage
        icon={Inbox}
        title="Todavía no recibiste postulaciones"
        description="Cuando alguien se postule a una vacante desde «Trabajá con nosotros», va a aparecer acá."
      />
    )
  } else {
    content = <PostulacionesTable postulaciones={postulaciones} linkState={{ listado: search }} />
  }

  return (
    <div className="flex flex-col gap-4">
      <PostulacionesToolbar
        filtros={filtros}
        onFiltrosChange={setFiltros}
        vacantes={vacantes.vacantes}
        vacantesStatus={vacantesStatus}
        hasFilters={hasFilters}
        onClear={limpiarFiltros}
      />

      {/* El contador lo leen los lectores en el status de abajo */}
      {hasData && total > 0 && (
        <p aria-hidden="true" className={`text-sm tabular-nums ${textMuted}`}>
          {contar(total, NOUN)}
          {hasFilters && ' con estos filtros'}
        </p>
      )}

      <p role="status" className="sr-only">
        {isLoading ? 'Cargando postulaciones…' : status === 'success' ? contar(total, NOUN) : ''}
      </p>

      {/* Mientras llega la lista filtrada se sigue viendo la anterior, atenuada */}
      <div
        aria-busy={isLoading}
        className={`transition-opacity duration-200 ease-glass ${isLoading && hasData ? 'pointer-events-none opacity-60' : ''}`}
      >
        {content}
      </div>
    </div>
  )
}
