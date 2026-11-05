import { Camera, ChevronRight, TriangleAlert } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { contar, formatFechaChecklist, formatHorasChecklist } from '../../utils/historial'
import TipoChecklistBadge from './TipoChecklistBadge'

const SKELETON_COUNT = 6
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

const COLUMNAS = ['Fecha', 'Tipo', 'Horas motor', 'Responsable', 'Anormales', 'Fotos']

const ANORMALES = { one: 'anormal', other: 'anormales' }
const FOTOS = { one: 'foto', other: 'fotos' }

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const rowHover = 'transition-colors duration-200 ease-glass hover:bg-black/5 dark:hover:bg-white/5'
const focusRing = 'focus-visible:outline-2 focus-visible:outline-(--focus-ring)'

/*
 * Anormales de un checklist: con alguno, badge rojo sólido (blanco sobre brand-600 pasa AA); sin ninguno, el 0 en
 * gris. `conTexto` agrega "anormal(es)", para las tarjetas, donde no hay encabezado de columna
 */
function AnormalesBadge({ cantidad, conTexto = false }) {
  if (cantidad > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white tabular-nums">
        <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" />
        {conTexto ? contar(cantidad, ANORMALES) : cantidad}
      </span>
    )
  }
  return <span className={`tabular-nums ${textMuted}`}>{conTexto ? 'Sin anormales' : '0'}</span>
}

function Fotos({ cantidad, conTexto = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums ${cantidad > 0 ? textSoft : textMuted}`}>
      <Camera size={16} strokeWidth={1.75} aria-hidden="true" />
      {conTexto ? contar(cantidad, FOTOS) : cantidad}
    </span>
  )
}

/*
 * Checklists de un equipo: tabla desde md y tarjetas por debajo. Toda la fila (o la tarjeta) abre el detalle.
 * En la tabla el enlace real es la fecha (teclado, lectores de pantalla, abrir en otra pestaña) y el resto de la
 * fila navega con un clic; Ctrl o ⌘ + clic la abre en otra pestaña, igual que un enlace. `getHref` arma la ruta
 * del detalle y `linkState` viaja con la navegación (los filtros, para volver a la misma lista).
 * `esMaquina` decide las horas: los aditamentos no tienen motor
 */
export default function HistorialChecklistsTable({ checklists, esMaquina, getHref, linkState }) {
  const navigate = useNavigate()

  const onRowClick = (event, checklist) => {
    // El enlace de la fecha navega solo; si se está seleccionando texto de la fila, no se navega
    if (event.target.closest('a') || window.getSelection()?.toString()) return
    const href = getHref(checklist)
    if (event.ctrlKey || event.metaKey) window.open(href, '_blank', 'noopener')
    else navigate(href, { state: linkState })
  }

  return (
    <div className="glass overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              {COLUMNAS.map((columna) => (
                <th
                  key={columna}
                  scope="col"
                  className={`px-3 py-3.5 align-bottom text-xs font-medium tracking-wide whitespace-nowrap uppercase first:pl-6 ${textMuted}`}
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
            {checklists.map((checklist) => {
              const momento = formatFechaChecklist(checklist.fecha)
              return (
                <tr
                  key={checklist.id}
                  onClick={(event) => onRowClick(event, checklist)}
                  className={`cursor-pointer has-[a:focus-visible]:bg-black/5 dark:has-[a:focus-visible]:bg-white/5 ${rowHover}`}
                >
                  <td className="py-3 pr-3 pl-6 whitespace-nowrap">
                    <Link
                      to={getHref(checklist)}
                      state={linkState}
                      className={`rounded-sm font-medium tabular-nums focus-visible:outline-offset-2 ${textStrong} ${focusRing}`}
                    >
                      {momento ? (
                        <>
                          {momento.fecha}
                          <span className={`ml-2 font-normal ${textMuted}`}>{momento.hora}</span>
                        </>
                      ) : (
                        'Sin fecha'
                      )}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <TipoChecklistBadge tipo={checklist.tipo} />
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft}`}>
                    {formatHorasChecklist(checklist.horasMotor, esMaquina)}
                  </td>
                  <td className={`max-w-56 truncate px-3 py-3 ${textSoft}`}>{checklist.responsable || '—'}</td>
                  <td className="px-3 py-3">
                    <AnormalesBadge cantidad={checklist.anormales} />
                  </td>
                  <td className="px-3 py-3">
                    <Fotos cantidad={checklist.fotos} />
                  </td>
                  <td className={`py-3 pr-4 ${textMuted}`}>
                    <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 md:hidden dark:divide-white/10">
        {checklists.map((checklist) => {
          const momento = formatFechaChecklist(checklist.fecha)
          return (
            <li key={checklist.id}>
              <Link
                to={getHref(checklist)}
                state={linkState}
                className={`flex items-center gap-3 py-4 pr-3 pl-4 focus-visible:-outline-offset-2 sm:pl-5 ${rowHover} ${focusRing}`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <TipoChecklistBadge tipo={checklist.tipo} />
                    {checklist.anormales > 0 && <AnormalesBadge cantidad={checklist.anormales} conTexto />}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className={`font-medium tabular-nums ${textStrong}`}>
                      {momento ? `${momento.fecha} · ${momento.hora}` : 'Sin fecha'}
                    </p>
                    <p className={`truncate text-sm ${textSoft}`}>{checklist.responsable || 'Sin responsable'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {esMaquina && (
                      <span className={`tabular-nums ${textSoft}`}>
                        <span className={textMuted}>Horas motor </span>
                        {formatHorasChecklist(checklist.horasMotor, esMaquina)}
                      </span>
                    )}
                    <Fotos cantidad={checklist.fotos} conTexto />
                  </div>
                </div>
                <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" className={`shrink-0 ${textMuted}`} />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function HistorialChecklistsSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
              <span className={`h-4 w-32 ${skeletonBar}`} />
              <span className={`h-6 w-28 ${skeletonBar}`} />
              <span className={`hidden h-4 w-16 md:block ${skeletonBar}`} />
              <span className={`h-4 w-2/5 max-w-40 ${skeletonBar}`} />
            </div>
            <span className={`hidden h-6 w-10 md:block ${skeletonBar}`} />
            <span className={`hidden h-4 w-10 md:block ${skeletonBar}`} />
            <span className={`size-5 shrink-0 ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
