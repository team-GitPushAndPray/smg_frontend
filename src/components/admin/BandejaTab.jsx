import { CloudOff, Inbox, Info, RotateCw, SearchX, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router'
import { MODULOS } from '../../config/rutasPanel'
import { useAnalisisPendientes } from '../../hooks/useAnalisisPendientes'
import { useFiltrosPostulaciones } from '../../hooks/useFiltrosPostulaciones'
import { usePermiso } from '../../hooks/usePermiso'
import { usePostulaciones } from '../../hooks/usePostulaciones'
import { useResumenVacante } from '../../hooks/useResumenVacante'
import { useVacantes } from '../../hooks/useVacantes'
import { contar } from '../../utils/historial'
import AnalisisProgreso from './AnalisisProgreso'
import PanelMessage from './PanelMessage'
import PostulacionesTable, { PostulacionesTableSkeleton } from './PostulacionesTable'
import PostulacionesToolbar from './PostulacionesToolbar'
import ResumenVacanteCard from './ResumenVacanteCard'

const NOUN = { one: 'postulación', other: 'postulaciones' }
const textMuted = 'text-neutral-600 dark:text-neutral-400'

/*
 * Pestaña Bandeja del módulo Postulaciones: todas las postulaciones recibidas (GET /postulaciones), con filtros por
 * vacante y estado que se combinan y un orden, todo en la URL (?vacante_id=&estado=&orden=): cada cambio vuelve a
 * pedir, y al volver de la ficha la bandeja sigue igual. Por defecto van de la más nueva a la más vieja; con una
 * vacante elegida se pueden ver como ranking por afinidad (orden=afinidad), con el puesto, el top 3 destacado y el
 * aviso de que el puntaje es una recomendación de la IA.
 * Con una vacante elegida y permiso de edición, "Analizar pendientes" analiza de a una las postulaciones de esa
 * vacante que lo necesiten (useAnalisisPendientes) y al terminar recarga la bandeja y el resumen.
 * Con una vacante elegida (en cualquier orden), arriba de la tabla va la card con su resumen con IA para gerencia
 * (ResumenVacanteCard): top 3, comparación y recomendación, con "Generar" / "Regenerar" si hay permiso de edición.
 * Las vacantes del filtro (activas e inactivas) se piden aparte; si fallan, solo ese filtro queda deshabilitado.
 * Sin resultados distingue "todavía no llegó ninguna" de "ninguna coincide con los filtros"
 */
export default function BandejaTab() {
  const { search } = useLocation()
  const { puedeEditar } = usePermiso(MODULOS.POSTULACIONES)
  const { filtros, hasFilters, setFiltros, limpiarFiltros } = useFiltrosPostulaciones()
  const { status, postulaciones, isLoading, hasData, retry } = usePostulaciones(filtros)
  const resumenVacante = useResumenVacante(filtros.vacanteId)
  const { recargar: recargarResumen } = resumenVacante
  // Al terminar "Analizar pendientes" cambian los puntajes: se recargan la bandeja y el resumen (queda desactualizado)
  const onTerminarAnalisis = () => {
    retry()
    recargarResumen()
  }
  const analisis = useAnalisisPendientes({ onTerminar: onTerminarAnalisis })
  const vacantes = useVacantes()
  const vacanteElegida = vacantes.vacantes.find(({ id }) => id === filtros.vacanteId)
  const vacantesStatus = vacantes.isLoading && !vacantes.hasData ? 'loading' : vacantes.status

  const total = postulaciones.length
  const ranking = filtros.orden === 'afinidad'
  const puedeAnalizar = puedeEditar && filtros.vacanteId !== null

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
    content = <PostulacionesTable postulaciones={postulaciones} ranking={ranking} linkState={{ listado: search }} />
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

      {filtros.vacanteId !== null && (
        <ResumenVacanteCard
          resumenVacante={resumenVacante}
          vacanteTitulo={vacanteElegida?.titulo}
          puedeEditar={puedeEditar}
          linkState={{ listado: search }}
        />
      )}

      {analisis.enCurso && <AnalisisProgreso progreso={analisis.progreso} onCancelar={analisis.cancelar} />}

      {((hasData && total > 0) || puedeAnalizar) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {/* El contador lo leen los lectores en el status de abajo */}
          {hasData && total > 0 ? (
            <p aria-hidden="true" className={`text-sm tabular-nums ${textMuted}`}>
              {contar(total, NOUN)}
              {hasFilters && ' con estos filtros'}
            </p>
          ) : (
            <span />
          )}
          {puedeAnalizar && (
            <button
              type="button"
              onClick={() => analisis.iniciar(filtros.vacanteId)}
              disabled={analisis.enCurso}
              className="btn-secondary px-4 text-sm"
            >
              <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
              Analizar pendientes
            </button>
          )}
        </div>
      )}

      {ranking && (
        <p className="flex items-start gap-2.5 rounded-control bg-black/5 px-3.5 py-3 text-sm text-neutral-800 dark:bg-white/10 dark:text-neutral-200">
          <Info size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          <span>El puntaje es una recomendación generada por IA; la decisión final es de la empresa.</span>
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
