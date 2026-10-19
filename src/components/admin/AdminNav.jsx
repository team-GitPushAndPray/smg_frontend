import { ChevronDown, LayoutDashboard } from 'lucide-react'
import { useId, useState } from 'react'
import { NavLink, matchPath, useLocation } from 'react-router'
import { ICONOS_GRUPO, RUTAS_PANEL } from '../../config/rutasPanel'

const linkBase = 'interactive flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium'
const linkActive = 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
const linkIdle =
  'text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

function linkClass({ isActive }) {
  return `${linkBase} ${isActive ? linkActive : linkIdle}`
}

// Agrupa las rutas respetando el orden de RUTAS_PANEL: un ítem suelto o un grupo con sus ítems
function groupRoutes(routes) {
  const entries = []
  for (const route of routes) {
    if (!route.grupo) {
      entries.push({ type: 'item', route })
      continue
    }
    const group = entries.find((entry) => entry.type === 'group' && entry.label === route.grupo)
    if (group) group.routes.push(route)
    else entries.push({ type: 'group', label: route.grupo, routes: [route] })
  }
  return entries
}

function NavItem({ route, onNavigate }) {
  const Icon = route.icon
  return (
    <li>
      <NavLink to={route.path} end={route.end} onClick={onNavigate} className={linkClass}>
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        {route.label}
      </NavLink>
    </li>
  )
}

function NavGroup({ label, routes, onNavigate }) {
  const { pathname } = useLocation()
  const listId = useId()
  const hasActive = routes.some((route) => matchPath({ path: route.path, end: false }, pathname))
  // Mientras el usuario no lo toque, el grupo está abierto solo si contiene la página actual
  const [userOpen, setUserOpen] = useState(null)
  const isOpen = userOpen ?? hasActive
  const Icon = ICONOS_GRUPO[label]

  return (
    <li>
      <button
        type="button"
        onClick={() => setUserOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={listId}
        className={`${linkBase} w-full ${hasActive && !isOpen ? linkActive : linkIdle}`}
      >
        {Icon && <Icon size={18} strokeWidth={1.75} aria-hidden="true" />}
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className={`transition-transform duration-200 ease-glass ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <ul id={listId} className="mt-1 ml-5 flex flex-col gap-1 border-l border-neutral-300 pl-2 dark:border-neutral-700">
          {routes.map((route) => (
            <NavItem key={route.path} route={route} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  )
}

// Inicio queda fijo: no depende de ningún módulo, así que no forma parte de RUTAS_PANEL
const homeRoute = { path: '/admin', label: 'Inicio', icon: LayoutDashboard, end: true }

// Menú del panel generado desde RUTAS_PANEL. Lo usan el sidebar de escritorio y el menú de celular
export default function AdminNav({ onNavigate }) {
  const entries = groupRoutes(RUTAS_PANEL)

  return (
    <ul className="flex flex-col gap-1">
      <NavItem route={homeRoute} onNavigate={onNavigate} />
      {entries.map((entry) =>
        entry.type === 'item' ? (
          <NavItem key={entry.route.path} route={entry.route} onNavigate={onNavigate} />
        ) : (
          <NavGroup key={entry.label} label={entry.label} routes={entry.routes} onNavigate={onNavigate} />
        ),
      )}
    </ul>
  )
}
