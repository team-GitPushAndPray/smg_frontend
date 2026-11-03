import { TriangleAlert, WifiOff } from 'lucide-react'
import { useChecklist } from '../../hooks/useChecklist'

/*
 * Por qué no salió el envío, arriba del paso al que llevó el error (horas, ítems, cierre o la misma revisión).
 * Sin conexión dice que lo cargado sigue ahí; el resto muestra el mensaje del back. Desaparece al salir del paso
 */
export default function EnvioAlert() {
  const { paso, errorEnvio } = useChecklist()
  if (errorEnvio?.paso !== paso) return null

  const Icon = errorEnvio.red ? WifiOff : TriangleAlert

  return (
    <div role="alert" className="campo-card flex items-start gap-3 border-brand-200 bg-brand-50 p-4 text-pretty">
      <Icon size={22} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700" />
      {errorEnvio.red ? (
        <p>
          <span className="block font-semibold">No se pudo enviar</span>
          Buscá un lugar con señal y probá de nuevo. Lo que cargaste sigue acá.
        </p>
      ) : (
        <p className="font-medium">{errorEnvio.mensaje}</p>
      )}
    </div>
  )
}
