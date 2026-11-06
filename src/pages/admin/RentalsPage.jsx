import { CalendarCheck, CloudOff, KeyRound, Plus, RotateCw, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import AlquileresTable, { AlquileresTableSkeleton } from '../../components/admin/AlquileresTable'
import AlquileresToolbar from '../../components/admin/AlquileresToolbar'
import EquiposDisponiblesCard from '../../components/admin/EquiposDisponiblesCard'
import Pagination from '../../components/admin/Pagination'
import PanelMessage from '../../components/admin/PanelMessage'
import PermissionBadge from '../../components/admin/PermissionBadge'
import SegmentedTabs from '../../components/admin/SegmentedTabs'
import { MODULOS, RUTAS_ALQUILERES } from '../../config/rutasPanel'
import { useAlquileres } from '../../hooks/useAlquileres'
import { useFiltrosAlquileres } from '../../hooks/useFiltrosAlquileres'
import { usePermiso } from '../../hooks/usePermiso'
import {
  ALQUILERES_POR_PAGINA,
  DIAS_POR_VENCER,
  ESTADOS_EN_CURSO,
  PESTANAS_ALQUILERES,
} from '../../utils/alquileres'

// Consultas fijas de las pestañas Activos y Por vencer (GET /alquileres)
const CONSULTA_ACTIVOS = { estado: ESTADOS_EN_CURSO }
const CONSULTA_POR_VENCER = { por_vencer: true }

const NOUN = { one: 'alquiler', other: 'alquileres' }

function countLabel(cantidad) {
  return cantidad === 1 ? '1 alquiler' : `${cantidad} alquileres`
}

/*
 * /admin/alquileres: lo que está alquilado, lo que vence pronto y cuántos equipos quedan disponibles.
 * Tres pestañas, con la activa en la URL (?tab=): Activos (PENDIENTE y ACTIVO), Por vencer (ACTIVOS que vencen en
 * 7 días o menos, o ya vencidos, el más urgente primero) e Historial (todos, con filtros de estado y cliente en la URL).
 * Por vencer se pide siempre al entrar, para mostrar cuántos son en su pestaña; las otras dos, recién al abrirlas.
 * El back manda la lista entera: se pagina acá. Toda la fila abre el detalle; la ubicación abre Google Maps.
 * Arriba, los equipos disponibles (solo si el rol tiene Máquinas, que es lo que exige GET /equipos).
 * "Nuevo alquiler" solo con edición en Alquileres
 */
export default function RentalsPage() {
  const { puedeEditar } = usePermiso(MODULOS.ALQUILERES)
  const { puedeVer: puedeVerMaquinas } = usePermiso(MODULOS.MAQUINAS)
  const { filtros, hasFilters, setPestana, setFiltros, setPage, limpiarFiltros } = useFiltrosAlquileres()
  const { tab } = filtros
  // Los filtros son solo del Historial: en otra pestaña se ignoran aunque vengan en la URL
  const filtrando = tab === 'historial' && hasFilters

  // Fecha contra la que se calcula el vencimiento: la de cuando se abrió la pantalla
  const [hoy] = useState(() => new Date())

  // Cada pestaña guarda su lista: al volver a una, se ve la anterior (atenuada) mientras llega la nueva
  const porVencer = useAlquileres(CONSULTA_POR_VENCER)
  const activos = useAlquileres(tab === 'activos' ? CONSULTA_ACTIVOS : null)
  const historial = useAlquileres(
    tab === 'historial' ? { estado: filtros.estado || undefined, cliente_id: filtros.clienteId ?? undefined } : null,
  )
  const datos = { activos, 'por-vencer': porVencer, historial }[tab]
  const { status, alquileres, isLoading, hasData, retry } = datos

  const pestanas = PESTANAS_ALQUILERES.map((pestana) =>
    pestana.id === 'por-vencer'
      ? { ...pestana, contador: porVencer.hasData && porVencer.status === 'success' ? porVencer.alquileres.length : null }
      : pestana,
  )

  // Una página que ya no existe (un enlace viejo, o alquileres que cambiaron de estado) lleva a la última
  const total = alquileres.length
  const totalPages = Math.max(1, Math.ceil(total / ALQUILERES_POR_PAGINA))
  const pageOutOfRange = !isLoading && hasData && filtros.page > totalPages
  useEffect(() => {
    if (pageOutOfRange) setPage(totalPages)
  }, [pageOutOfRange, totalPages, setPage])

  const desde = (filtros.page - 1) * ALQUILERES_POR_PAGINA
  const pagina = alquileres.slice(desde, desde + ALQUILERES_POR_PAGINA)

  let content
  if ((isLoading && !hasData) || pageOutOfRange) {
    content = <AlquileresTableSkeleton />
  } else if (!isLoading && status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar los alquileres"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (total === 0 && tab === 'activos') {
    content = (
      <PanelMessage
        icon={KeyRound}
        title="No hay alquileres en curso"
        description={
          puedeEditar
            ? 'Los alquileres pendientes y activos van a aparecer acá. Cargá uno con «Nuevo alquiler».'
            : 'Los alquileres pendientes y activos van a aparecer acá.'
        }
      />
    )
  } else if (total === 0 && tab === 'por-vencer') {
    content = (
      <PanelMessage
        icon={CalendarCheck}
        title="Nada por vencer"
        description={`Ningún alquiler activo vence en los próximos ${DIAS_POR_VENCER} días ni está vencido.`}
      />
    )
  } else if (total === 0 && filtrando) {
    content = (
      <PanelMessage icon={SearchX} title="Ningún alquiler coincide" description="Probá con otro estado o cliente.">
        <button type="button" onClick={limpiarFiltros} className="btn-tonal">
          Limpiar filtros
        </button>
      </PanelMessage>
    )
  } else if (total === 0) {
    content = (
      <PanelMessage
        icon={KeyRound}
        title="Todavía no hay alquileres"
        description={
          puedeEditar
            ? 'Cargá el primero con «Nuevo alquiler».'
            : 'Cuando se carguen alquileres, se van a ver acá.'
        }
      />
    )
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <AlquileresTable alquileres={pagina} hoy={hoy} />
        <Pagination
          page={filtros.page}
          total={total}
          limit={ALQUILERES_POR_PAGINA}
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
            <h1 className="text-2xl font-semibold sm:text-3xl">Alquileres</h1>
            {!puedeEditar && <PermissionBadge puedeEditar={false} />}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Qué está alquilado, qué vence pronto y qué está disponible.</p>
        </div>
        {puedeEditar && (
          <Link to={RUTAS_ALQUILERES.nuevo} className="btn-primary shrink-0">
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nuevo alquiler
          </Link>
        )}
      </header>

      {puedeVerMaquinas && <EquiposDisponiblesCard />}

      <SegmentedTabs pestanas={pestanas} activa={tab} onCambiar={setPestana} label="Alquileres">
        <div className="flex flex-col gap-4">
          {tab === 'historial' && (
            <AlquileresToolbar
              filtros={filtros}
              onFiltrosChange={setFiltros}
              hasFilters={hasFilters}
              onClear={limpiarFiltros}
            />
          )}

          <p role="status" className="sr-only">
            {isLoading || !hasData ? 'Cargando alquileres…' : `${countLabel(total)}${filtrando ? ' encontrados' : ''}`}
          </p>

          {/* Mientras llega la nueva lista se sigue viendo la anterior, atenuada */}
          <div
            aria-busy={isLoading}
            className={`transition-opacity duration-200 ease-glass ${isLoading && hasData ? 'pointer-events-none opacity-60' : ''}`}
          >
            {content}
          </div>
        </div>
      </SegmentedTabs>
    </section>
  )
}
