import { formatHorasActualizadas, formatHorasMotor, TIPOS_EQUIPO } from '../../utils/equipos'
import EquipoActionsMenu from './EquipoActionsMenu'
import EstadoEquipoBadge from './EstadoEquipoBadge'

const SKELETON_COUNT = 5
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

// Todavía no hay mantenimientos programados: la columna queda lista para cuando lleguen
const PROXIMO_SERVICIO = 'Sin programar'

const COLUMNAS = [
  'Código',
  'Nombre',
  'Marca',
  'Modelo',
  'Horas de motor',
  'Última carga de horas',
  'Próximo servicio',
  'Estado',
]

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

// El "nombre" de un equipo es el de su categoría
function getNombre(equipo) {
  return equipo.nombre ?? equipo.categoria?.nombre ?? 'Sin categoría'
}

/*
 * Inventario de equipos: tabla desde xl (con el sidebar abierto, en lg no entran las 9 columnas) y tarjetas por debajo.
 * `dadosDeBaja` indica que el listado es de equipos dados de baja: su menú solo tiene "Ver detalle".
 * Las acciones que abren un modal llegan como callbacks; Ver detalle y Editar son enlaces
 */
export default function InventarioTable({ equipos, canEdit, dadosDeBaja, onActualizarHoras, onCambiarEstado, onDarDeBaja }) {
  const actionProps = { canEdit, dadoDeBaja: dadosDeBaja, onActualizarHoras, onCambiarEstado, onDarDeBaja }

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
                  className={`px-3 py-3.5 align-bottom text-xs font-medium tracking-wide uppercase first:pl-6 ${textMuted}`}
                >
                  {columna}
                </th>
              ))}
              <th scope="col" className="w-px py-3.5 pr-4 align-bottom">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {equipos.map((equipo) => (
              <tr key={equipo.id}>
                <td className={`py-3 pr-3 pl-6 font-medium whitespace-nowrap tabular-nums ${textStrong}`}>
                  {equipo.codigoInterno}
                </td>
                <td className={`max-w-48 truncate px-3 py-3 font-medium ${textStrong}`}>{getNombre(equipo)}</td>
                <td className={`max-w-40 truncate px-3 py-3 ${textSoft}`}>{equipo.marca || '—'}</td>
                <td className={`max-w-40 truncate px-3 py-3 ${textSoft}`}>{equipo.modelo || '—'}</td>
                <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft}`}>{formatHorasMotor(equipo)}</td>
                <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft}`}>
                  {formatHorasActualizadas(equipo)}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap ${textMuted}`}>{PROXIMO_SERVICIO}</td>
                <td className="px-3 py-3">
                  <EstadoEquipoBadge estado={equipo.estado} />
                </td>
                <td className="py-2 pr-4">
                  <EquipoActionsMenu equipo={equipo} {...actionProps} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 xl:hidden dark:divide-white/10">
        {equipos.map((equipo) => (
          <li key={equipo.id} className="flex items-start gap-3 py-4 pr-2 pl-4 sm:pl-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-0.5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className={`text-xs font-medium tabular-nums ${textMuted}`}>
                  {equipo.codigoInterno}
                  {TIPOS_EQUIPO[equipo.tipo] && ` · ${TIPOS_EQUIPO[equipo.tipo]}`}
                </p>
                <p className={`truncate font-medium ${textStrong}`}>{getNombre(equipo)}</p>
                <p className={`truncate text-sm ${textSoft}`}>
                  {[equipo.marca, equipo.modelo].filter(Boolean).join(' ') || '—'}
                </p>
              </div>
              <div>
                <EstadoEquipoBadge estado={equipo.estado} />
              </div>
              <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                <div>
                  <dt className={textMuted}>Horas de motor</dt>
                  <dd className={`tabular-nums ${textSoft}`}>{formatHorasMotor(equipo)}</dd>
                </div>
                <div>
                  <dt className={textMuted}>Última carga de horas</dt>
                  <dd className={`tabular-nums ${textSoft}`}>{formatHorasActualizadas(equipo)}</dd>
                </div>
                <div>
                  <dt className={textMuted}>Próximo servicio</dt>
                  <dd className={textSoft}>{PROXIMO_SERVICIO}</dd>
                </div>
              </dl>
            </div>
            <EquipoActionsMenu equipo={equipo} {...actionProps} />
          </li>
        ))}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function InventarioTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <span className={`h-4 w-16 shrink-0 ${skeletonBar}`} />
            <div className="flex flex-1 flex-col gap-2 xl:flex-row xl:gap-6">
              <span className={`h-4 w-2/5 max-w-40 ${skeletonBar}`} />
              <span className={`h-4 w-3/5 max-w-56 ${skeletonBar}`} />
            </div>
            <span className={`hidden h-4 w-16 xl:block ${skeletonBar}`} />
            <span className={`hidden h-6 w-24 xl:block ${skeletonBar}`} />
            <span className={`size-8 shrink-0 ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
