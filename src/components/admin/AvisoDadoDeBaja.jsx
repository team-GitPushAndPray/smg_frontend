import { Archive } from 'lucide-react'

/*
 * Aviso de un equipo dado de baja (`activo: false`): se conserva por su historial. Lo muestran el detalle y el
 * historial del equipo, cada uno con su `description`
 */
export default function AvisoDadoDeBaja({ description }) {
  return (
    <div className="glass flex items-start gap-4 p-5 sm:p-6">
      <span className="icon-badge">
        <Archive size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-0.5 pt-0.5">
        <p className="font-semibold">Equipo dado de baja</p>
        <p className="text-sm text-pretty text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
    </div>
  )
}
