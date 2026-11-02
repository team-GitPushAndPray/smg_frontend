import { History } from 'lucide-react'
import { useChecklist } from '../../hooks/useChecklist'
import { formatMomentoBorrador } from '../../utils/checklists'
import FieldScreen from './FieldScreen'
import MainAction from './MainAction'

/*
 * Lo primero que se ve si para este QR quedó un checklist sin terminar: seguirlo (acción principal, abajo)
 * o empezar de nuevo, que borra el borrador. "Empezar de nuevo" va lejos de "Seguir" para no tocarlo sin querer
 */
export default function DraftPrompt() {
  const { equipo, opciones, pasos, borrador, seguirBorrador, descartarBorrador } = useChecklist()
  const opcion = opciones.find(({ tipo }) => tipo === borrador.tipo)
  const numero = Math.max(pasos.indexOf(borrador.paso), 0) + 1
  const momento = formatMomentoBorrador(borrador.actualizadoEn)

  return (
    <FieldScreen centered footer={<MainAction label="Seguir donde quedaste" onClick={seguirBorrador} />}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-16 place-items-center rounded-card bg-brand-50 text-brand-700">
          <History size={32} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold text-balance">Tenés un checklist sin terminar</h1>
        <p className="text-lg text-pretty text-neutral-700">
          {opcion?.titulo ?? 'Checklist'} de {equipo.codigoInterno}. Lo dejaste en el paso {numero} de {pasos.length}
          {momento && `, ${momento}`}.
        </p>
      </div>
      <button type="button" className="campo-btn-secondary mt-4" onClick={descartarBorrador}>
        Empezar de nuevo
      </button>
    </FieldScreen>
  )
}
