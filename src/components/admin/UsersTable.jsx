import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { formatUltimoAcceso, getNombreCompleto, getRolLabel } from '../../utils/usuarios'
import { getIniciales } from '../../utils/vendedores'
import UserActionsMenu from './UserActionsMenu'

const SKELETON_COUNT = 4
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

// Los inactivos se atenúan con un gris que igual pasa AA sobre el vidrio
const textStrong = {
  activo: 'text-black dark:text-white',
  inactivo: 'text-neutral-600 dark:text-neutral-400',
}
const textSoft = {
  activo: 'text-neutral-700 dark:text-neutral-300',
  inactivo: 'text-neutral-600 dark:text-neutral-400',
}

function estadoKey(usuario) {
  return usuario.activo ? 'activo' : 'inactivo'
}

function Avatar({ usuario }) {
  const className = usuario.activo
    ? 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
    : 'bg-black/5 text-neutral-600 dark:bg-white/10 dark:text-neutral-400'
  return (
    <span
      aria-hidden="true"
      className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${className}`}
    >
      {getIniciales(getNombreCompleto(usuario))}
    </span>
  )
}

function UserName({ usuario, isSelf }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className={`truncate font-medium ${textStrong[estadoKey(usuario)]}`}>{getNombreCompleto(usuario)}</span>
      {isSelf && (
        <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-300">
          Vos
        </span>
      )}
    </span>
  )
}

function RoleBadge({ rol, esSistema }) {
  const className = esSistema
    ? 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
    : 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {esSistema && <ShieldCheck size={14} strokeWidth={1.75} aria-hidden="true" />}
      {getRolLabel(rol) || 'Sin rol'}
    </span>
  )
}

// Sin verde en la paleta: activo es un punto lleno en el color del texto; inactivo, un punto hueco y en gris
function StatusBadge({ activo }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-medium ${activo ? textStrong.activo : textStrong.inactivo}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full ${activo ? 'bg-current' : 'border-[1.5px] border-current'}`}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

// El superAdmin no tiene ⋯: no se edita ni se da de baja desde acá
function Actions({ usuario, esSistema, isSelf, isPending, onEdit, onToggleEstado }) {
  if (esSistema) {
    return (
      <span
        role="img"
        aria-label="Protegido: no se modifica desde esta pantalla"
        title="Protegido: no se modifica desde esta pantalla"
        className="grid size-11 place-items-center text-neutral-500 dark:text-neutral-400"
      >
        <LockKeyhole size={16} strokeWidth={1.75} aria-hidden="true" />
      </span>
    )
  }
  return (
    <UserActionsMenu
      usuario={usuario}
      canDeactivate={!isSelf}
      isPending={isPending}
      onEdit={onEdit}
      onToggleEstado={onToggleEstado}
    />
  )
}

/*
 * Usuarios del panel: tabla desde lg y tarjetas por debajo (con el sidebar abierto, la tabla no entra en tablet).
 * `rolesSistema` son los ids de los roles con `esSistema`; `sesionId`, el usuario logueado; `pendingId`, el que está cambiando de estado
 */
export default function UsersTable({ usuarios, rolesSistema, sesionId, pendingId, onEdit, onToggleEstado }) {
  const rows = usuarios.map((usuario) => ({
    usuario,
    esSistema: rolesSistema.has(usuario.rol?.id),
    isSelf: usuario.id === sesionId,
    isPending: usuario.id === pendingId,
  }))
  const actionProps = { onEdit, onToggleEstado }

  return (
    <div className="relative isolate">
      {/*
       * El vidrio va en una capa aparte: si este contenedor tuviera backdrop-filter, el menú ⋯
       * (que es hijo suyo) no podría desenfocar el contenido de las filas que tiene detrás
       */}
      <div aria-hidden="true" className="glass absolute inset-0 -z-10" />
      <table className="hidden w-full text-left text-sm lg:table">
        <thead>
          <tr className="border-b border-black/5 dark:border-white/10">
            {['Nombre y apellido', 'Email', 'Rol', 'Estado', 'Último acceso'].map((columna) => (
              <th
                key={columna}
                scope="col"
                className="px-4 py-3.5 text-xs font-medium tracking-wide text-neutral-600 uppercase first:pl-6 dark:text-neutral-400"
              >
                {columna}
              </th>
            ))}
            <th scope="col" className="w-px py-3.5 pr-4">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/10">
          {rows.map(({ usuario, esSistema, isSelf, isPending }) => (
            <tr key={usuario.id}>
              <td className="max-w-64 py-3 pr-4 pl-6">
                <span className="flex items-center gap-3">
                  <Avatar usuario={usuario} />
                  <UserName usuario={usuario} isSelf={isSelf} />
                </span>
              </td>
              <td className={`max-w-72 truncate px-4 py-3 ${textSoft[estadoKey(usuario)]}`}>{usuario.email}</td>
              <td className="px-4 py-3">
                <RoleBadge rol={usuario.rol} esSistema={esSistema} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <StatusBadge activo={usuario.activo} />
              </td>
              <td className={`px-4 py-3 whitespace-nowrap tabular-nums ${textSoft[estadoKey(usuario)]}`}>
                {formatUltimoAcceso(usuario.ultimoAcceso)}
              </td>
              <td className="py-2 pr-4">
                <Actions
                  usuario={usuario}
                  esSistema={esSistema}
                  isSelf={isSelf}
                  isPending={isPending}
                  {...actionProps}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-black/5 lg:hidden dark:divide-white/10">
        {rows.map(({ usuario, esSistema, isSelf, isPending }) => (
          <li key={usuario.id} className="flex items-start gap-3 py-4 pr-2 pl-4 sm:pl-5">
            <Avatar usuario={usuario} />
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-0.5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <UserName usuario={usuario} isSelf={isSelf} />
                <p className={`truncate text-sm ${textSoft[estadoKey(usuario)]}`}>{usuario.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <RoleBadge rol={usuario.rol} esSistema={esSistema} />
                <StatusBadge activo={usuario.activo} />
              </div>
              <p className={`text-sm ${textSoft[estadoKey(usuario)]}`}>
                <span className="text-neutral-600 dark:text-neutral-400">Último acceso: </span>
                <span className="tabular-nums">{formatUltimoAcceso(usuario.ultimoAcceso)}</span>
              </p>
            </div>
            <Actions usuario={usuario} esSistema={esSistema} isSelf={isSelf} isPending={isPending} {...actionProps} />
          </li>
        ))}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function UsersTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-3 py-4 pr-4 pl-4 sm:pl-6">
            <span className={`size-10 rounded-full ${skeletonBar}`} />
            <div className="flex flex-1 flex-col gap-2">
              <span className={`h-4 w-2/5 max-w-48 ${skeletonBar}`} />
              <span className={`h-4 w-3/5 max-w-64 ${skeletonBar}`} />
            </div>
            <span className={`hidden h-6 w-24 lg:block ${skeletonBar}`} />
            <span className={`hidden h-5 w-20 lg:block ${skeletonBar}`} />
            <span className={`size-8 ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
