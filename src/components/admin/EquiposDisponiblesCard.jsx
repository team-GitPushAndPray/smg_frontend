import { ArrowRight, RotateCw, Truck } from 'lucide-react'
import { Link } from 'react-router'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'
import { useEquiposDisponibles } from '../../hooks/useEquiposDisponibles'

// Inventario de Máquinas filtrado por "disponible" (mismo parámetro que useFiltrosInventario): ahí se ve el mismo número
const HREF_DISPONIBLES = `${RUTAS_MAQUINAS.inventario}?estado=disponible`

const linkBase =
  'interactive inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-brand-700 hover:bg-brand-600/10 dark:text-brand-400 dark:hover:bg-brand-500/15'

/*
 * Tarjeta chica arriba del listado: cuántos equipos se pueden alquilar ahora (activos y disponibles, el mismo total que
 * Máquinas con ese filtro), con un enlace al inventario filtrado. La página la monta solo si el rol tiene Máquinas:
 * GET /equipos lo exige. Mientras carga, el número es una barra; si falla, una raya y "Reintentar"
 */
export default function EquiposDisponiblesCard() {
  const { status, total, retry } = useEquiposDisponibles()

  let numero
  if (status === 'loading') {
    numero = (
      <>
        <span aria-hidden="true" className="block h-7 w-10 animate-pulse rounded-control bg-black/5 dark:bg-white/10" />
        <span className="sr-only">Cargando…</span>
      </>
    )
  } else if (status === 'error') {
    numero = (
      <>
        <span aria-hidden="true">—</span>
        <span className="sr-only">No se pudo cargar</span>
      </>
    )
  } else {
    numero = total
  }

  return (
    <section
      aria-labelledby="equipos-disponibles"
      className="glass flex flex-wrap items-center gap-x-4 gap-y-2 self-stretch py-3 pr-3 pl-4 sm:self-start sm:pl-5"
    >
      <span className="icon-badge">
        <Truck size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="flex flex-col">
        <h2 id="equipos-disponibles" className="text-sm text-neutral-600 dark:text-neutral-400">
          Equipos disponibles
        </h2>
        <p aria-live="polite" className="text-2xl font-semibold tracking-tight tabular-nums">
          {numero}
        </p>
      </div>
      {status === 'error' ? (
        <button type="button" onClick={retry} className={linkBase}>
          <RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      ) : (
        <Link to={HREF_DISPONIBLES} className={linkBase}>
          Ver en Máquinas
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      )}
    </section>
  )
}
