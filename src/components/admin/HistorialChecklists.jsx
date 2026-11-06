import { ClipboardCheck, CloudOff, FileDown, LoaderCircle, RotateCw, SearchX } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'
import { useChecklistsEquipo } from '../../hooks/useChecklistsEquipo'
import { useExportacionChecklists } from '../../hooks/useExportacionChecklists'
import { useFiltrosHistorial } from '../../hooks/useFiltrosHistorial'
import { useTextoDiferido } from '../../hooks/useTextoDiferido'
import { CHECKLISTS_POR_PAGINA, contar, getNombreArchivo } from '../../utils/historial'
import ChecklistsToolbar from './ChecklistsToolbar'
import HistorialChecklistsTable, { HistorialChecklistsSkeleton } from './HistorialChecklistsTable'
import HojaImpresion from './HojaImpresion'
import InformeChecklists from './InformeChecklists'
import Pagination from './Pagination'
import PanelMessage from './PanelMessage'

const NOUN = { one: 'checklist', other: 'checklists' }

/*
 * Pestaña Checklists del historial: filtros, listado paginado de a 20 (el más nuevo arriba) y sus estados
 * (cargando, sin checklists, sin resultados y error con reintento). Filtros y página viven en la URL
 * (useFiltrosHistorial); el buscador y el responsable se aplican cuando se deja de tipear.
 * Cada fila abre el detalle del checklist llevando la búsqueda actual, para volver a la misma lista.
 * "Exportar PDF" arma una hoja de impresión con todos los checklists que cumplen los filtros (no solo la página)
 */
export default function HistorialChecklists({ equipo }) {
  const { search } = useLocation()
  const { filtros, hasFilters, setFiltros, setPage, limpiarFiltros } = useFiltrosHistorial()
  const { status, checklists, meta, isLoading, hasData, retry } = useChecklistsEquipo(equipo.id, filtros)

  const q = useTextoDiferido(filtros.q, (valor) => setFiltros({ q: valor }))
  const responsable = useTextoDiferido(filtros.responsable, (valor) => setFiltros({ responsable: valor }))

  const clearFilters = () => {
    q.descartar()
    responsable.descartar()
    limpiarFiltros()
  }

  // Una página que ya no existe (un enlace viejo, o filtros que achicaron la lista) lleva a la última
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / CHECKLISTS_POR_PAGINA)) : 1
  const pageOutOfRange = !isLoading && hasData && filtros.page > totalPages
  useEffect(() => {
    if (pageOutOfRange) setPage(totalPages)
  }, [pageOutOfRange, totalPages, setPage])

  const getHref = (checklist) => RUTAS_MAQUINAS.checklist(equipo.id, checklist.id)

  // Se exporta lo que se está viendo: con la lista cargada, sin error y con al menos un checklist
  const exportacion = useExportacionChecklists(equipo.id, filtros)
  const puedeExportar = !isLoading && status === 'success' && meta?.total > 0

  let content
  if ((isLoading && !hasData) || pageOutOfRange) {
    content = <HistorialChecklistsSkeleton />
  } else if (!isLoading && status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar los checklists"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (meta.total === 0 && hasFilters) {
    content = (
      <PanelMessage
        icon={SearchX}
        title="Ningún checklist coincide"
        description="Probá con otra búsqueda, otras fechas o cambiá los filtros."
      >
        <button type="button" onClick={clearFilters} className="btn-tonal">
          Limpiar filtros
        </button>
      </PanelMessage>
    )
  } else if (meta.total === 0) {
    content = (
      <PanelMessage
        icon={ClipboardCheck}
        title="Todavía no hay checklists"
        description="Los checklists que se carguen desde el QR del equipo van a aparecer acá."
      />
    )
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <HistorialChecklistsTable
          checklists={checklists}
          esMaquina={equipo.tipo === 'maquina'}
          getHref={getHref}
          linkState={{ listado: search }}
        />
        <Pagination
          page={filtros.page}
          total={meta.total}
          limit={CHECKLISTS_POR_PAGINA}
          noun={NOUN}
          onPageChange={setPage}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <ChecklistsToolbar
        q={q}
        responsable={responsable}
        filtros={filtros}
        onFiltrosChange={setFiltros}
        hasFilters={hasFilters}
        onClear={clearFilters}
      >
        <button
          type="button"
          onClick={exportacion.exportar}
          disabled={!puedeExportar || exportacion.preparando}
          className="btn-secondary text-sm"
        >
          {exportacion.preparando ? (
            <LoaderCircle
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            <FileDown size={18} strokeWidth={1.75} aria-hidden="true" />
          )}
          {exportacion.preparando ? 'Preparando PDF…' : 'Exportar PDF'}
        </button>
      </ChecklistsToolbar>

      {exportacion.informe && (
        <HojaImpresion
          titulo={getNombreArchivo(['Historial de checklists', equipo.codigoInterno], exportacion.informe.emitido)}
          onTerminar={exportacion.terminar}
        >
          <InformeChecklists equipo={equipo} {...exportacion.informe} />
        </HojaImpresion>
      )}

      <p role="status" className="sr-only">
        {isLoading || !hasData
          ? 'Cargando checklists…'
          : `${contar(meta.total, NOUN)}${hasFilters ? (meta.total === 1 ? ' encontrado' : ' encontrados') : ''}`}
      </p>

      {/* Mientras llega la nueva página se sigue viendo la anterior, atenuada */}
      <div
        aria-busy={isLoading}
        className={`transition-opacity duration-200 ease-glass ${isLoading && hasData ? 'pointer-events-none opacity-60' : ''}`}
      >
        {content}
      </div>
    </div>
  )
}
