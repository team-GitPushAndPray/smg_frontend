import { ArrowRight, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router'
import PermissionBadge from '../../components/admin/PermissionBadge'
import { RUTAS_PANEL } from '../../config/rutasPanel'
import { useAuth } from '../../hooks/useAuth'
import { getRolLabel } from '../../utils/usuarios'

function SectionCard({ route, canEdit }) {
  const Icon = route.icon
  return (
    <li>
      <Link
        to={route.path}
        className="glass interactive group flex h-full flex-col gap-4 p-5 hover:-translate-y-0.5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="icon-badge">
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          {/* Con edición no se marca nada: es el caso normal. Solo se avisa la lectura */}
          {!canEdit && <PermissionBadge puedeEditar={false} />}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          {route.grupo && (
            <p className="text-xs font-medium tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
              {route.grupo}
            </p>
          )}
          <h2 className="text-lg font-semibold">{route.label}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{route.descripcion}</p>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-medium text-brand-700 dark:text-brand-400">
          Ir a la sección
          <ArrowRight
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="transition-transform duration-200 ease-glass group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </li>
  )
}

// Inicio del panel: lo ve cualquier usuario logueado, con una tarjeta por cada sección que su rol tiene
export default function AdminHomePage() {
  const { usuario, tieneModulo, puedeEditar } = useAuth()
  const routes = RUTAS_PANEL.filter((route) => tieneModulo(route.modulo))
  const rol = getRolLabel(usuario.rol)

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Hola, {usuario.nombre}</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {rol && <span className="font-medium text-neutral-700 dark:text-neutral-300">{rol}</span>}
          {rol && routes.length > 0 && ' · '}
          {routes.length > 0 && 'Elegí una sección para empezar.'}
        </p>
      </header>

      {routes.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {routes.map((route) => (
            <SectionCard key={route.path} route={route} canEdit={puedeEditar(route.modulo)} />
          ))}
        </ul>
      ) : (
        <div className="glass flex flex-col items-center gap-3 px-6 py-12 text-center sm:py-16">
          <span className="icon-badge">
            <LayoutGrid size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="max-w-sm font-medium">
            Tu rol todavía no tiene secciones asignadas. Consultá con un administrador.
          </p>
        </div>
      )}
    </section>
  )
}
