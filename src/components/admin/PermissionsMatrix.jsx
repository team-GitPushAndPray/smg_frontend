import { LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react'
import { getNivel } from '../../utils/roles'
import { getRolLabel } from '../../utils/usuarios'
import AccessLevelControl, { AccessLevelBadge } from './AccessLevelControl'
import RoleActionsMenu from './RoleActionsMenu'

const SKELETON_ROWS = 4
const SKELETON_COLUMNS = 3
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

/*
 * Columna del rol, fija a la izquierda al hacer scroll horizontal: vidrio opaco con su propio blur para que
 * las celdas que pasan por debajo no se lean encima del nombre. Es la segunda (y última) capa de vidrio
 */
const stickyCell =
  'sticky left-0 z-10 border-r border-black/5 bg-(--glass-bg-strong) backdrop-blur-(--glass-blur) dark:border-white/10'

// Los inactivos se atenúan con un gris que igual pasa AA sobre el vidrio.
// En celular no va la descripción: la columna fija tiene que dejar lugar a las celdas
function RoleName({ rol }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={`font-medium ${rol.activo ? 'text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          {getRolLabel(rol)}
        </span>
        {rol.esSistema && <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" className="text-brand-700 dark:text-brand-400" />}
        {!rol.activo && (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-300">
            Inactivo
          </span>
        )}
      </span>
      {rol.descripcion && (
        <span className="hidden text-sm text-neutral-600 sm:line-clamp-2 dark:text-neutral-400">{rol.descripcion}</span>
      )}
    </span>
  )
}

// El superAdmin no tiene ⋯: se marca con un candado. Mientras se guarda una celda, la fila muestra la carga
function RoleActions({ rol, canEdit, isSaving, isPending, onEdit, onToggleEstado }) {
  if (rol.esSistema) {
    return (
      <span
        role="img"
        aria-label="Rol de sistema: no se modifica"
        title="Rol de sistema: no se modifica"
        className="grid size-11 shrink-0 place-items-center text-neutral-600 dark:text-neutral-400"
      >
        <LockKeyhole size={16} strokeWidth={1.75} aria-hidden="true" />
      </span>
    )
  }
  if (isSaving) {
    return (
      <span className="grid size-11 shrink-0 place-items-center text-neutral-600 dark:text-neutral-400">
        <LoaderCircle size={20} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />
        <span className="sr-only">Guardando permisos…</span>
      </span>
    )
  }
  if (!canEdit) return null
  return <RoleActionsMenu rol={rol} isPending={isPending} onEdit={onEdit} onToggleEstado={onToggleEstado} />
}

function MatrixCell({ rol, modulo, canEdit, isSaving, onChangeNivel }) {
  const nivel = getNivel(rol.modulos, modulo.codigo)
  let content
  // El superAdmin llega con `modulos: []`: su acceso no sale de la lista sino de `esSistema`
  if (rol.esSistema) content = <AccessLevelBadge total />
  else if (!canEdit || !rol.activo) content = <AccessLevelBadge value={nivel} isMuted={!rol.activo} />
  else {
    content = (
      <AccessLevelControl
        name={`permiso-${rol.id}-${modulo.codigo}`}
        label={`${modulo.nombre} para ${getRolLabel(rol)}`}
        value={nivel}
        isBusy={isSaving}
        onChange={(siguiente) => onChangeNivel(rol, modulo.codigo, siguiente)}
      />
    )
  }
  return <td className="px-4 py-3">{content}</td>
}

/*
 * Matriz de permisos: una fila por rol y una columna por módulo (las columnas salen de GET /modulos).
 * `canEdit` en false la deja de solo lectura. `savingIds` son los roles guardando una celda (la fila queda bloqueada);
 * `pendingId`, el que está cambiando de estado. Los roles inactivos se ven atenuados y no se editan hasta reactivarlos
 */
export default function PermissionsMatrix({
  roles,
  modulos,
  canEdit,
  savingIds,
  pendingId,
  onChangeNivel,
  onEdit,
  onToggleEstado,
}) {
  return (
    <div className="glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              <th
                scope="col"
                className={`${stickyCell} min-w-40 px-4 py-3.5 text-xs font-medium tracking-wide text-neutral-600 uppercase sm:min-w-64 sm:pl-6 dark:text-neutral-400`}
              >
                Rol
              </th>
              {modulos.map((modulo) => (
                <th
                  key={modulo.codigo}
                  scope="col"
                  className="px-4 py-3.5 text-xs font-medium tracking-wide whitespace-nowrap text-neutral-600 uppercase dark:text-neutral-400"
                >
                  {modulo.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {roles.map((rol) => {
              const isSaving = savingIds.has(rol.id)
              return (
                <tr key={rol.id} aria-busy={isSaving || undefined}>
                  <th scope="row" className={`${stickyCell} max-w-72 py-2.5 pr-2 pl-4 align-middle font-normal sm:pl-6`}>
                    <span className="flex items-center justify-between gap-2">
                      <RoleName rol={rol} />
                      <RoleActions
                        rol={rol}
                        canEdit={canEdit}
                        isSaving={isSaving}
                        isPending={pendingId === rol.id}
                        onEdit={onEdit}
                        onToggleEstado={onToggleEstado}
                      />
                    </span>
                  </th>
                  {modulos.map((modulo) => (
                    <MatrixCell
                      key={modulo.codigo}
                      rol={rol}
                      modulo={modulo}
                      canEdit={canEdit}
                      isSaving={isSaving}
                      onChangeNivel={onChangeNivel}
                    />
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function PermissionsMatrixSkeleton() {
  return (
    <div aria-hidden="true" className="glass overflow-hidden">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="flex items-center gap-6 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex w-40 shrink-0 flex-col gap-2 sm:w-56">
              <span className={`h-4 w-3/5 ${skeletonBar}`} />
              <span className={`h-4 w-4/5 ${skeletonBar}`} />
            </div>
            {Array.from({ length: SKELETON_COLUMNS }, (_, column) => (
              <span key={column} className={`hidden h-11 w-48 sm:block ${skeletonBar}`} />
            ))}
            <span className={`h-11 flex-1 sm:hidden ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
