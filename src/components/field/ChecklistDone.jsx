import { Check } from 'lucide-react'
import { useChecklist } from '../../hooks/useChecklist'
import { formatCambioHoras } from '../../utils/checklists'
import FieldScreen from './FieldScreen'
import MainAction from './MainAction'

function textoAnormales(cantidad) {
  if (cantidad === 0) return 'Ninguno'
  return cantidad === 1 ? '1 ítem' : `${cantidad} ítems`
}

/*
 * Confirmación de un envío exitoso, con lo que respondió el back: tipo, equipo, horas (solo si se cargaron) y
 * cuántos anormales. Sin salidas al resto del sistema: la única acción es empezar otro checklist del mismo equipo
 * (`onOtro`, que hace lo mismo que el Atrás del celular). El ✓ va en negro: el verde queda solo para "Normal"
 */
export default function ChecklistDone({ onOtro }) {
  const { opciones, resultado } = useChecklist()
  const titulo = opciones.find(({ tipo }) => tipo === resultado.tipo)?.titulo ?? resultado.titulo
  const filas = [
    { etiqueta: 'Revisión', valor: titulo },
    { etiqueta: 'Equipo', valor: resultado.equipo ?? resultado.codigoInterno },
    resultado.horasMotor != null && {
      etiqueta: 'Horas actualizadas',
      valor: formatCambioHoras(resultado.horasAnteriores, resultado.horasMotor),
    },
    { etiqueta: 'Anormales', valor: textoAnormales(resultado.anormales) },
  ].filter(Boolean)

  return (
    <FieldScreen centered footer={<MainAction label="Hacer otro checklist de este equipo" onClick={onOtro} />}>
      <div role="status" className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-black text-white">
          <Check size={56} strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h1 className="text-3xl font-semibold text-balance">Listo</h1>
        <p className="text-lg text-pretty text-neutral-700">Se envió el checklist.</p>
      </div>

      <dl className="campo-card mt-2 flex flex-col divide-y divide-neutral-200 px-4">
        {filas.map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="flex flex-col gap-0.5 py-3">
            <dt className="text-neutral-700">{etiqueta}</dt>
            <dd className="text-lg font-semibold break-words tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>
    </FieldScreen>
  )
}
