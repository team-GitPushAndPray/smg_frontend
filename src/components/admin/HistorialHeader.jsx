import { getTituloEquipo } from '../../utils/equipos'
import AvisoDadoDeBaja from './AvisoDadoDeBaja'
import EstadoEquipoBadge from './EstadoEquipoBadge'

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

/*
 * Encabezado del historial de un equipo: el equipo en una línea ("M027 · Minicargadora Bobcat S530"), el badge de su
 * estado y, si está dado de baja, el aviso (su historial se sigue mostrando). No tiene acciones: la pantalla es de
 * solo lectura
 */
export default function HistorialHeader({ equipo }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <header className="flex flex-col gap-2">
        <p className={`text-sm font-medium ${textMuted}`}>Historial del equipo</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="min-w-0 text-2xl font-semibold text-balance break-words sm:text-3xl">
            {getTituloEquipo(equipo)}
          </h1>
          <EstadoEquipoBadge estado={equipo.estado} />
        </div>
      </header>

      {equipo.activo === false && (
        <AvisoDadoDeBaja description="Su historial se conserva completo y se puede consultar." />
      )}
    </div>
  )
}

// Marcador con la forma de toda la pantalla (encabezado, pestañas y contenido) mientras carga el equipo
export function HistorialSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-2">
        <span className={`h-4 w-36 ${skeletonBar}`} />
        <span className={`h-9 w-80 max-w-full ${skeletonBar}`} />
      </div>
      <span className={`h-16 w-full sm:h-13 sm:w-md ${skeletonBar}`} />
      <span className={`h-56 w-full ${skeletonBar}`} />
    </div>
  )
}
