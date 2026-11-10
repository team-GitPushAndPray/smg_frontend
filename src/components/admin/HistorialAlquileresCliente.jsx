import { ChevronRight, CloudOff, KeyRound, RotateCw } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { RUTAS_ALQUILERES } from '../../config/rutasPanel'
import { formatFechaAlquiler } from '../../utils/alquileres'
import EstadoAlquilerBadge from './EstadoAlquilerBadge'
import PanelMessage from './PanelMessage'

/** @import { AlquilerListado } from '../../types/alquileres' */

const SKELETON_COUNT = 3
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

const COLUMNAS = ['N.º', 'Estado', 'Equipos', 'Inicio', 'Fin prevista']

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const rowHover = 'transition-colors duration-200 ease-glass hover:bg-black/5 dark:hover:bg-white/5'
const focusRing = 'focus-visible:outline-2 focus-visible:outline-(--focus-ring)'

// Códigos internos de los equipos del alquiler, separados por coma
function codigosEquipos(alquiler) {
  const codigos = (alquiler.equipos ?? []).map((equipo) => equipo.codigo_interno).filter(Boolean)
  return codigos.length > 0 ? codigos.join(', ') : '—'
}

function contarAlquileres(cantidad) {
  return cantidad === 1 ? '1 alquiler' : `${cantidad} alquileres`
}

/*
 * Alquileres de un cliente: tabla desde lg y tarjetas por debajo (con el sidebar abierto, las cinco columnas no entran
 * cómodas en tablet). Toda la fila (o la tarjeta) abre el detalle del alquiler. En la tabla el enlace real es el número
 * (teclado, lectores de pantalla, abrir en otra pestaña) y el resto de la fila navega con un clic; Ctrl o ⌘ + clic la
 * abre en otra pestaña, igual que un enlace
 */
function AlquileresTable({ alquileres }) {
  const navigate = useNavigate()

  const onRowClick = (event, alquiler) => {
    // El enlace del número navega solo; si se está seleccionando texto de la fila (un código), no se navega
    if (event.target.closest('a') || window.getSelection()?.toString()) return
    const href = RUTAS_ALQUILERES.detalle(alquiler.id)
    if (event.ctrlKey || event.metaKey) window.open(href, '_blank', 'noopener')
    else navigate(href)
  }

  return (
    <div className="glass overflow-hidden">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              {COLUMNAS.map((columna) => (
                <th
                  key={columna}
                  scope="col"
                  className={`px-3 py-3.5 text-xs font-medium tracking-wide whitespace-nowrap uppercase first:pl-6 ${textMuted}`}
                >
                  {columna}
                </th>
              ))}
              <th scope="col" className="w-px py-3.5 pr-4">
                <span className="sr-only">Abrir</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {alquileres.map((alquiler) => (
              <tr
                key={alquiler.id}
                onClick={(event) => onRowClick(event, alquiler)}
                className={`cursor-pointer has-[a:focus-visible]:bg-black/5 dark:has-[a:focus-visible]:bg-white/5 ${rowHover}`}
              >
                <td className="py-3 pr-3 pl-6 whitespace-nowrap">
                  <Link
                    to={RUTAS_ALQUILERES.detalle(alquiler.id)}
                    aria-label={`Alquiler N.º ${alquiler.id}`}
                    className={`rounded-sm font-medium tabular-nums focus-visible:outline-offset-2 ${textStrong} ${focusRing}`}
                  >
                    {alquiler.id}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <EstadoAlquilerBadge estado={alquiler.estado} />
                </td>
                <td className={`max-w-80 px-3 py-3 break-words ${textSoft}`}>{codigosEquipos(alquiler)}</td>
                <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft}`}>
                  {formatFechaAlquiler(alquiler.fecha_inicio)}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft}`}>
                  {formatFechaAlquiler(alquiler.fecha_fin_prevista)}
                </td>
                <td className={`py-3 pr-4 ${textMuted}`}>
                  <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 lg:hidden dark:divide-white/10">
        {alquileres.map((alquiler) => (
          <li key={alquiler.id}>
            <Link
              to={RUTAS_ALQUILERES.detalle(alquiler.id)}
              className={`flex items-center gap-3 py-4 pr-3 pl-4 focus-visible:-outline-offset-2 sm:pl-5 ${rowHover} ${focusRing}`}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p className={`font-medium tabular-nums ${textStrong}`}>Alquiler N.º {alquiler.id}</p>
                  <EstadoAlquilerBadge estado={alquiler.estado} />
                </div>
                <p className={`text-sm break-words ${textSoft}`}>
                  <span className={textMuted}>Equipos </span>
                  {codigosEquipos(alquiler)}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums">
                  <span className={textSoft}>
                    <span className={textMuted}>Inicio </span>
                    {formatFechaAlquiler(alquiler.fecha_inicio)}
                  </span>
                  <span className={textSoft}>
                    <span className={textMuted}>Fin prevista </span>
                    {formatFechaAlquiler(alquiler.fecha_fin_prevista)}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" className={`shrink-0 ${textMuted}`} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
function AlquileresTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
              <span className={`h-4 w-24 lg:w-8 ${skeletonBar}`} />
              <span className={`h-6 w-24 ${skeletonBar}`} />
              <span className={`h-4 w-2/5 max-w-48 ${skeletonBar}`} />
              <span className={`hidden h-4 w-20 lg:block ${skeletonBar}`} />
              <span className={`hidden h-4 w-20 lg:block ${skeletonBar}`} />
            </div>
            <span className={`size-5 shrink-0 ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Sección "Historial de alquileres" del detalle de un cliente: todos sus alquileres (también finalizados y anulados),
 * el más nuevo arriba, con sus estados de carga, error con reintento y "todavía no tiene alquileres". Cada alquiler
 * abre su detalle. Solo lectura: lo ve todo el que ve el módulo
 * @param {{ status: 'loading' | 'success' | 'error', alquileres: AlquilerListado[], onRetry: () => void }} props
 */
export default function HistorialAlquileresCliente({ status, alquileres, onRetry }) {
  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando alquileres…
        </p>
        <AlquileresTableSkeleton />
      </div>
    )
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        titleAs="h3"
        icon={CloudOff}
        title="No pudimos cargar los alquileres"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={onRetry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (alquileres.length === 0) {
    content = (
      <PanelMessage
        titleAs="h3"
        icon={KeyRound}
        title="Este cliente todavía no tiene alquileres"
        description="Cuando se le dé de alta un alquiler, va a aparecer acá."
      />
    )
  } else {
    content = <AlquileresTable alquileres={alquileres} />
  }

  return (
    <section aria-labelledby="historial-alquileres" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="historial-alquileres" className="text-lg font-semibold">
          Historial de alquileres
        </h2>
        {status === 'success' && alquileres.length > 0 && (
          <p className={`text-sm tabular-nums ${textMuted}`}>{contarAlquileres(alquileres.length)}</p>
        )}
      </div>
      {content}
    </section>
  )
}
