import { getEstadoEquipo, getTituloEquipo } from '../../utils/equipos'
import { formatFechaChecklist } from '../../utils/historial'

/*
 * Encabezado de una hoja impresa del historial: marca del sistema y fecha de emisión arriba, el título del documento
 * y el equipo con su estado (y "Dado de baja" si corresponde). `emitido` es el momento en que se pidió el PDF
 */
export default function EncabezadoImpresion({ titulo, equipo, emitido }) {
  const momento = formatFechaChecklist(emitido.toISOString())
  const estado = getEstadoEquipo(equipo.estado)?.label ?? equipo.estado

  return (
    <header className="flex flex-col gap-3 border-b-2 border-black pb-4">
      <div className="flex items-baseline justify-between gap-4 text-xs text-neutral-700">
        <p>
          <span className="font-semibold text-brand-700">SGM</span> · Sistema Integral de Gestión de Maquinaria
        </p>
        {momento && (
          <p className="tabular-nums">
            Emitido el {momento.fecha} a las {momento.hora}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        <p className="text-base font-medium break-words">{getTituloEquipo(equipo)}</p>
        <p className="text-xs text-neutral-700">
          {[estado && `Estado: ${estado}`, equipo.activo === false && 'Dado de baja'].filter(Boolean).join(' · ')}
        </p>
      </div>
    </header>
  )
}
