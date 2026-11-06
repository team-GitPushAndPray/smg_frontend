import { Building2, KeyRound } from 'lucide-react'
import { Link, matchPath, useLocation } from 'react-router'
import { RUTAS_ALQUILERES } from '../../config/rutasPanel'

// Mismo control segmentado que HistorialTabs. Radio interno = radio de la pista (rounded-card) menos su padding (p-1)
const tabBase =
  'interactive flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-[calc(var(--radius-card)-0.25rem)] px-5 text-sm font-medium whitespace-nowrap'
const tabIdle = 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
const tabActive = 'bg-(--segment-active-bg) text-black shadow-(--segment-active-shadow) dark:text-white'
// El ícono de la pestaña activa lleva el acento: brand-700 / brand-400 pasan AA sobre el vidrio
const iconActive = 'text-brand-700 dark:text-brand-400'

const PESTANAS = [
  { id: 'alquileres', label: 'Alquileres', to: RUTAS_ALQUILERES.listado, Icon: KeyRound },
  { id: 'clientes', label: 'Clientes', to: RUTAS_ALQUILERES.clientes, Icon: Building2 },
]

/*
 * Pestañas del módulo: cada una es una ruta, así que son links (navegación), no un tablist de WAI-ARIA.
 * Clientes queda marcada en /clientes y en el detalle de un cliente; Alquileres, en todo lo demás del módulo
 * (listado, alta y detalle). En la ruta exacta de la pestaña es la página actual (aria-current="page")
 */
export default function AlquileresTabs() {
  const { pathname } = useLocation()
  const enClientes = matchPath({ path: RUTAS_ALQUILERES.clientes, end: false }, pathname) !== null
  const activa = enClientes ? 'clientes' : 'alquileres'

  return (
    <nav aria-label="Secciones de Alquileres" className="glass grid w-full grid-cols-2 gap-0.5 p-1 sm:w-auto sm:self-start">
      {PESTANAS.map(({ id, label, to, Icon }) => {
        const isActive = id === activa
        const esLaPagina = matchPath({ path: to, end: true }, pathname) !== null
        return (
          <Link
            key={id}
            to={to}
            aria-current={isActive ? (esLaPagina ? 'page' : 'true') : undefined}
            className={`${tabBase} ${isActive ? tabActive : tabIdle}`}
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={isActive ? iconActive : undefined} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
