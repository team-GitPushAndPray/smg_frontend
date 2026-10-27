import { Archive, CloudOff, Plus, RotateCw, SearchX, Truck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import EquipoAccionModal from '../../components/admin/EquipoAccionModal'
import InventarioTable, { InventarioTableSkeleton } from '../../components/admin/InventarioTable'
import InventarioToolbar from '../../components/admin/InventarioToolbar'
import Pagination from '../../components/admin/Pagination'
import PanelMessage from '../../components/admin/PanelMessage'
import PermissionBadge from '../../components/admin/PermissionBadge'
import { MODULOS, RUTAS_MAQUINAS } from '../../config/rutasPanel'
import { useCategorias } from '../../hooks/useCategorias'
import { EQUIPOS_POR_PAGINA, useEquipos } from '../../hooks/useEquipos'
import { useFiltrosInventario } from '../../hooks/useFiltrosInventario'
import { usePermiso } from '../../hooks/usePermiso'

// Espera desde la última tecla antes de buscar, para no consultar al back con cada letra
const SEARCH_DELAY = 400
const NOUN = { one: 'equipo', other: 'equipos' }

function countLabel(cantidad) {
  return cantidad === 1 ? '1 equipo' : `${cantidad} equipos`
}

/*
 * Máquinas: inventario de máquinas y aditamentos con buscador, filtros y paginación del back.
 * Filtros y página viven en la URL (useFiltrosInventario). Sin edición en el módulo (por ejemplo, taller)
 * la pantalla es de solo lectura: sin "Nuevo equipo" y con "Ver detalle" como única acción.
 * Después de actualizar horas, cambiar el estado o dar de baja, se vuelve a pedir la página actual
 */
export default function MachinesPage() {
  const { puedeEditar } = usePermiso(MODULOS.MAQUINAS)
  const { filtros, hasFilters, setFiltros, setPage, limpiarFiltros } = useFiltrosInventario()
  const { status, equipos, meta, dadosDeBaja, isLoading, hasData, retry } = useEquipos(filtros)
  const { status: categoriasStatus, categorias } = useCategorias()

  // Lo escrito en el buscador: llega a la URL (y al back) recién cuando se deja de tipear
  const [query, setQuery] = useState(filtros.search)
  const [urlSearch, setUrlSearch] = useState(filtros.search)
  const searchTimer = useRef(null)

  // Si la búsqueda de la URL cambia por otro lado (por ejemplo, el enlace del sidebar), el campo se pone al día
  if (filtros.search !== urlSearch) {
    setUrlSearch(filtros.search)
    if (filtros.search !== query.trim()) setQuery(filtros.search)
  }

  useEffect(() => () => clearTimeout(searchTimer.current), [])

  const onQueryChange = (value) => {
    setQuery(value)
    clearTimeout(searchTimer.current)
    // Un espacio de más no cambia la búsqueda: no se vuelve a la página 1
    if (value.trim() === filtros.search) return
    searchTimer.current = setTimeout(() => setFiltros({ search: value.trim() }), SEARCH_DELAY)
  }

  const clearQuery = () => {
    clearTimeout(searchTimer.current)
    setQuery('')
    setFiltros({ search: '' })
  }

  const clearFilters = () => {
    clearTimeout(searchTimer.current)
    setQuery('')
    limpiarFiltros()
  }

  // Una página que ya no existe (un enlace viejo, o equipos que se dieron de baja) lleva a la última
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / EQUIPOS_POR_PAGINA)) : 1
  const pageOutOfRange = !isLoading && hasData && filtros.page > totalPages
  useEffect(() => {
    if (pageOutOfRange) setPage(totalPages)
  }, [pageOutOfRange, totalPages, setPage])

  // Acción con modal abierta: { tipo: 'horas' | 'estado' | 'baja', equipo }
  const [accion, setAccion] = useState(null)
  const abrir = (tipo) => (equipo) => setAccion({ tipo, equipo })

  // Solo el switch de bajas, sin otros filtros: el "sin resultados" ofrece volver a los activos
  const soloBajas = filtros.bajas && !filtros.search && !filtros.tipo && !filtros.estado && !filtros.categoriaId

  let content
  if ((isLoading && !hasData) || pageOutOfRange) {
    content = <InventarioTableSkeleton />
  } else if (!isLoading && status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar el inventario"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (meta.total === 0 && soloBajas) {
    content = (
      <PanelMessage
        icon={Archive}
        title="No hay equipos dados de baja"
        description="Los equipos que se den de baja van a aparecer acá."
      >
        <button type="button" onClick={() => setFiltros({ bajas: false })} className="btn-tonal">
          Ver equipos activos
        </button>
      </PanelMessage>
    )
  } else if (meta.total === 0 && hasFilters) {
    content = (
      <PanelMessage
        icon={SearchX}
        title="Ningún equipo coincide"
        description="Probá con otra búsqueda o cambiá los filtros."
      >
        <button type="button" onClick={clearFilters} className="btn-tonal">
          Limpiar filtros
        </button>
      </PanelMessage>
    )
  } else if (meta.total === 0) {
    content = (
      <PanelMessage
        icon={Truck}
        title="Todavía no hay equipos"
        description={
          puedeEditar
            ? 'Cargá el primero con «Nuevo equipo» para empezar el inventario.'
            : 'Cuando se carguen equipos, se van a ver acá.'
        }
      />
    )
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <InventarioTable
          equipos={equipos}
          canEdit={puedeEditar}
          dadosDeBaja={dadosDeBaja}
          onActualizarHoras={abrir('horas')}
          onCambiarEstado={abrir('estado')}
          onDarDeBaja={abrir('baja')}
        />
        <Pagination
          page={filtros.page}
          total={meta.total}
          limit={EQUIPOS_POR_PAGINA}
          noun={NOUN}
          onPageChange={setPage}
        />
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">Máquinas</h1>
            {!puedeEditar && <PermissionBadge puedeEditar={false} />}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Inventario de máquinas y aditamentos de la empresa.</p>
        </div>
        {puedeEditar && (
          <Link to={RUTAS_MAQUINAS.nuevo} className="btn-primary shrink-0">
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nuevo equipo
          </Link>
        )}
      </header>

      <InventarioToolbar
        query={query}
        onQueryChange={onQueryChange}
        onQueryClear={clearQuery}
        filtros={filtros}
        onFiltrosChange={setFiltros}
        categorias={categorias}
        categoriasStatus={categoriasStatus}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      <p role="status" className="sr-only">
        {isLoading || !hasData ? 'Cargando equipos…' : `${countLabel(meta.total)}${hasFilters ? ' encontrados' : ''}`}
      </p>

      {/* Mientras llega la nueva página se sigue viendo la anterior, atenuada */}
      <div
        aria-busy={isLoading}
        className={`transition-opacity duration-200 ease-glass ${isLoading && hasData ? 'pointer-events-none opacity-60' : ''}`}
      >
        {content}
      </div>

      <EquipoAccionModal accion={accion} onClose={() => setAccion(null)} onDone={retry} />
    </section>
  )
}
