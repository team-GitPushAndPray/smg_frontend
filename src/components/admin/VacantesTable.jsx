import { formatFechaVacante } from '../../utils/vacantes'
import EstadoActivoBadge from './EstadoActivoBadge'
import VacanteActionsMenu from './VacanteActionsMenu'

/** @import { Vacante } from '../../types/vacantes' */

const SKELETON_COUNT = 4
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

// Las inactivas se atenúan con un gris que igual pasa AA sobre el vidrio
const textStrong = {
  activa: 'text-black dark:text-white',
  inactiva: 'text-neutral-600 dark:text-neutral-400',
}
const textSoft = {
  activa: 'text-neutral-700 dark:text-neutral-300',
  inactiva: 'text-neutral-600 dark:text-neutral-400',
}
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const thBase = `px-3 py-3.5 text-xs font-medium tracking-wide whitespace-nowrap uppercase ${textMuted}`

function estadoKey(vacante) {
  return vacante.activa ? 'activa' : 'inactiva'
}

/**
 * Vacantes del panel: tabla desde md y tarjetas por debajo. Título, estado (Activa / Inactiva), cantidad de
 * postulaciones y fecha de alta, en el orden en que las manda el back (no se reordena).
 * Con `canEdit` cada fila suma su menú ⋯ (Editar y Desactivar / Activar), que llama a `onEdit` u `onToggleEstado`;
 * sin edición no hay columna de acciones. `pendingId` es la vacante que se está activando (su ⋯ muestra la carga)
 * @param {{
 *   vacantes: Vacante[],
 *   canEdit?: boolean,
 *   pendingId?: number | null,
 *   onEdit?: (vacante: Vacante) => void,
 *   onToggleEstado?: (vacante: Vacante) => void,
 * }} props
 */
export default function VacantesTable({ vacantes, canEdit = false, pendingId = null, onEdit, onToggleEstado }) {
  const acciones = (vacante) => (
    <VacanteActionsMenu
      vacante={vacante}
      isPending={pendingId === vacante.id}
      onEdit={onEdit}
      onToggleEstado={onToggleEstado}
    />
  )

  return (
    <div className="glass overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              <th scope="col" className={`${thBase} pl-6`}>
                Título
              </th>
              <th scope="col" className={thBase}>
                Estado
              </th>
              <th scope="col" className={`${thBase} text-right`}>
                Postulaciones
              </th>
              <th scope="col" className={`${thBase} ${canEdit ? '' : 'pr-6'}`}>
                Creada
              </th>
              {canEdit && (
                <th scope="col" className="w-px py-3.5 pr-4">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {vacantes.map((vacante) => {
              const estado = estadoKey(vacante)
              return (
                <tr key={vacante.id}>
                  <td className={`min-w-56 py-3 pr-3 pl-6 font-medium text-pretty ${textStrong[estado]}`}>
                    {vacante.titulo}
                  </td>
                  <td className="px-3 py-3">
                    <EstadoActivoBadge activo={vacante.activa} femenino />
                  </td>
                  <td className={`px-3 py-3 text-right tabular-nums ${textSoft[estado]}`}>
                    {vacante.cantidad_postulaciones}
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft[estado]} ${canEdit ? '' : 'pr-6'}`}>
                    {formatFechaVacante(vacante.creado_en)}
                  </td>
                  {canEdit && <td className="py-2 pr-4">{acciones(vacante)}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 md:hidden dark:divide-white/10">
        {vacantes.map((vacante) => {
          const estado = estadoKey(vacante)
          return (
            <li key={vacante.id} className="flex items-start gap-3 py-4 pr-2 pl-4 sm:pl-5">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className={`font-medium text-pretty ${textStrong[estado]}`}>{vacante.titulo}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <EstadoActivoBadge activo={vacante.activa} femenino />
                  <span className={`text-sm tabular-nums ${textSoft[estado]}`}>
                    {vacante.cantidad_postulaciones}{' '}
                    {vacante.cantidad_postulaciones === 1 ? 'postulación' : 'postulaciones'}
                  </span>
                </div>
                <p className={`text-sm tabular-nums ${textMuted}`}>Creada el {formatFechaVacante(vacante.creado_en)}</p>
              </div>
              {canEdit && <div className="-mt-1.5 shrink-0">{acciones(vacante)}</div>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function VacantesTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
              <span className={`h-4 w-3/5 max-w-72 ${skeletonBar}`} />
              <span className={`h-4 w-20 ${skeletonBar}`} />
              <span className={`hidden h-4 w-10 md:block ${skeletonBar}`} />
              <span className={`h-4 w-24 ${skeletonBar}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
