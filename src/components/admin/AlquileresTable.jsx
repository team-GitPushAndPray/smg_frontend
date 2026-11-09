import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { RUTAS_ALQUILERES } from '../../config/rutasPanel'
import { formatFechaAlquiler, getVencimiento, resumirEquipos } from '../../utils/alquileres'
import EstadoAlquilerBadge from './EstadoAlquilerBadge'
import UbicacionLink from './UbicacionLink'
import VencimientoTag from './VencimientoTag'

/** @import { AlquilerListado } from '../../types/alquileres' */

const SKELETON_COUNT = 5
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

const COLUMNAS = ['N.º', 'Cliente', 'Equipos', 'Inicio', 'Fin prevista', 'Estado', 'Entregados', 'Ubicación']

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const rowHover = 'transition-colors duration-200 ease-glass hover:bg-black/5 dark:hover:bg-white/5'
const focusRing = 'focus-visible:outline-2 focus-visible:outline-(--focus-ring)'

// Equipos resumidos ("MC-01 +3"): el title y los lectores de pantalla tienen la lista completa
function EquiposResumen({ equipos }) {
  const { texto, completo } = resumirEquipos(equipos)
  if (texto === completo || !completo) return texto
  return (
    <span title={completo}>
      <span aria-hidden="true">{texto}</span>
      <span className="sr-only">{completo}</span>
    </span>
  )
}

// "2/4": equipos entregados sobre el total del alquiler
function entregadosLabel(alquiler) {
  return `${alquiler.entregados ?? 0}/${alquiler.equipos?.length ?? 0}`
}

/**
 * Listado de alquileres: tabla desde xl y tarjetas por debajo (con el sidebar abierto, las ocho columnas no entran
 * cómodas antes). Toda la fila (o la tarjeta) abre el detalle del alquiler, salvo la ubicación, que abre Google Maps.
 * En la tabla el enlace real es el número (teclado, lectores de pantalla, abrir en otra pestaña) y el resto de la fila
 * navega con un clic; Ctrl o ⌘ + clic la abre en otra pestaña. En la tarjeta, el enlace del número se estira sobre
 * toda la tarjeta y la ubicación queda por encima (un enlace no puede ir adentro de otro).
 * `hoy` es la fecha contra la que se calcula el vencimiento
 * @param {{ alquileres: AlquilerListado[], hoy: Date }} props
 */
export default function AlquileresTable({ alquileres, hoy }) {
  const navigate = useNavigate()

  const onRowClick = (event, alquiler) => {
    // Los enlaces (número y ubicación) navegan solos; si se está seleccionando texto de la fila, no se navega
    if (event.target.closest('a, button') || window.getSelection()?.toString()) return
    const href = RUTAS_ALQUILERES.detalle(alquiler.id)
    if (event.ctrlKey || event.metaKey) window.open(href, '_blank', 'noopener')
    else navigate(href)
  }

  return (
    <div className="glass overflow-hidden">
      <div className="hidden overflow-x-auto xl:block">
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
                <td className={`max-w-56 truncate px-3 py-3 font-medium ${textStrong}`}>
                  {alquiler.cliente?.razon_social ?? '—'}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap ${textSoft}`}>
                  <EquiposResumen equipos={alquiler.equipos} />
                </td>
                <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft}`}>
                  {formatFechaAlquiler(alquiler.fecha_inicio)}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft}`}>
                  <div className="flex flex-col items-start gap-0.5">
                    {formatFechaAlquiler(alquiler.fecha_fin_prevista)}
                    <VencimientoTag vencimiento={getVencimiento(alquiler, hoy)} />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <EstadoAlquilerBadge estado={alquiler.estado} />
                </td>
                <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft}`}>{entregadosLabel(alquiler)}</td>
                <td className={`max-w-52 px-3 py-3 ${textSoft}`}>
                  <UbicacionLink alquiler={alquiler} className="-my-3 min-h-11" />
                </td>
                <td className={`py-3 pr-4 ${textMuted}`}>
                  <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 xl:hidden dark:divide-white/10">
        {alquileres.map((alquiler) => (
          <li key={alquiler.id} className={`relative flex items-center gap-3 py-4 pr-3 pl-4 sm:pl-5 ${rowHover}`}>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {/* El ::after cubre toda la tarjeta: cualquier toque fuera de la ubicación abre el detalle */}
                <Link
                  to={RUTAS_ALQUILERES.detalle(alquiler.id)}
                  className={`font-medium tabular-nums outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-(--focus-ring) ${textStrong}`}
                >
                  Alquiler N.º {alquiler.id}
                </Link>
                <EstadoAlquilerBadge estado={alquiler.estado} />
              </div>
              <p className={`truncate font-medium ${textStrong}`}>{alquiler.cliente?.razon_social ?? '—'}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className={textSoft}>
                  <span className={textMuted}>Equipos </span>
                  <EquiposResumen equipos={alquiler.equipos} />
                </span>
                <span className={`tabular-nums ${textSoft}`}>
                  <span className={textMuted}>Entregados </span>
                  {entregadosLabel(alquiler)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums">
                <span className={textSoft}>
                  <span className={textMuted}>Inicio </span>
                  {formatFechaAlquiler(alquiler.fecha_inicio)}
                </span>
                <span className={textSoft}>
                  <span className={textMuted}>Fin prevista </span>
                  {formatFechaAlquiler(alquiler.fecha_fin_prevista)}
                </span>
                <VencimientoTag vencimiento={getVencimiento(alquiler, hoy)} />
              </div>
              <p className={`relative z-10 flex max-w-full min-w-0 self-start text-sm ${textSoft}`}>
                <UbicacionLink alquiler={alquiler} className="-my-3 min-h-11" />
              </p>
            </div>
            <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" className={`shrink-0 ${textMuted}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function AlquileresTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex flex-1 flex-col gap-2 xl:flex-row xl:items-center xl:gap-6">
              <span className={`h-4 w-28 xl:w-8 ${skeletonBar}`} />
              <span className={`h-4 w-3/5 max-w-48 ${skeletonBar}`} />
              <span className={`h-4 w-24 ${skeletonBar}`} />
              <span className={`hidden h-4 w-20 xl:block ${skeletonBar}`} />
              <span className={`hidden h-4 w-20 xl:block ${skeletonBar}`} />
              <span className={`h-6 w-24 ${skeletonBar}`} />
              <span className={`hidden h-4 w-10 xl:block ${skeletonBar}`} />
              <span className={`hidden h-4 w-32 xl:block ${skeletonBar}`} />
            </div>
            <span className={`size-5 shrink-0 ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
