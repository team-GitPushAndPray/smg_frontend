import { Gauge } from 'lucide-react'
import { formatHorasMotor } from '../../utils/equipos'

const skeletonBar = 'animate-pulse rounded-control bg-neutral-200'

// Encabezado con el equipo del QR: código interno, categoría y marca y, si es una máquina, sus horas actuales
export default function EquipoSummary({ equipo }) {
  const detalle = [equipo.categoria, equipo.marca].filter(Boolean).join(' · ')

  return (
    <section aria-label="Equipo" className="campo-card flex flex-col gap-1 p-4">
      <p className="text-2xl font-semibold tracking-tight break-words">{equipo.codigoInterno}</p>
      {detalle && <p className="text-neutral-700">{detalle}</p>}
      {equipo.esMaquina && (
        <p className="mt-3 flex items-center gap-2 border-t border-neutral-200 pt-3 text-neutral-700">
          <Gauge size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <span>
            Horas actuales: <span className="font-semibold text-black">{formatHorasMotor(equipo)}</span>
          </span>
        </p>
      )}
    </section>
  )
}

export function EquipoSummarySkeleton() {
  return (
    <div aria-hidden="true" className="campo-card flex flex-col gap-3 p-4">
      <span className={`h-7 w-32 ${skeletonBar}`} />
      <span className={`h-5 w-48 ${skeletonBar}`} />
      <span className={`mt-2 h-5 w-40 ${skeletonBar}`} />
    </div>
  )
}
