import { Truck, Wrench } from 'lucide-react'
import { Link, matchPath, useLocation } from 'react-router'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'

// Mismo control segmentado que AlquileresTabs. Radio interno = radio de la pista (rounded-card) menos su padding (p-1)
const tabBase =
  'interactive flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-[calc(var(--radius-card)-0.25rem)] px-5 text-sm font-medium whitespace-nowrap'
const tabIdle = 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
const tabActive = 'bg-(--segment-active-bg) text-black shadow-(--segment-active-shadow) dark:text-white'
// El ícono de la pestaña activa lleva el acento: brand-700 / brand-400 pasan AA sobre el vidrio
const iconActive = 'text-brand-700 dark:text-brand-400'

const PESTANAS = [
  { id: 'inventario', label: 'Inventario', to: RUTAS_MAQUINAS.inventario, Icon: Truck },
  { id: 'servicios', label: 'Servicios', to: RUTAS_MAQUINAS.servicios, Icon: Wrench },
]

/*
 * Pestañas del módulo Máquinas (Inventario / Servicios): cada una es una ruta, así que son links (navegación), no un
 * tablist de WAI-ARIA. Solo se muestran en esas dos pantallas (MaquinasLayout); el alta, el detalle, la edición y el
 * historial de un equipo van sin pestañas
 */
export default function MaquinasTabs() {
  const { pathname } = useLocation()
  const activa = matchPath({ path: RUTAS_MAQUINAS.servicios, end: true }, pathname) ? 'servicios' : 'inventario'

  return (
    <nav aria-label="Secciones de Máquinas" className="glass grid w-full grid-cols-2 gap-0.5 p-1 sm:w-auto sm:self-start">
      {PESTANAS.map(({ id, label, to, Icon }) => {
        const isActive = id === activa
        return (
          <Link
            key={id}
            to={to}
            aria-current={isActive ? 'page' : undefined}
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
