import { useEffect } from 'react'
import { useAtrasDelFlujo } from '../../hooks/useAtrasDelFlujo'
import { useChecklist } from '../../hooks/useChecklist'
import ChecklistStart from './ChecklistStart'
import DraftPrompt from './DraftPrompt'
import CierreStep from './steps/CierreStep'
import HorasStep from './steps/HorasStep'
import ItemsStep from './steps/ItemsStep'
import WizardHeader from './WizardHeader'

// Pantalla de cada paso, por el id que usa ChecklistProvider
const PASOS = {
  inicio: ChecklistStart,
  horas: HorasStep,
  items: ItemsStep,
  cierre: CierreStep,
}

/*
 * Asistente del checklist: un solo camino hacia adelante, un paso por pantalla. Si quedó un borrador, primero
 * pregunta si seguirlo. Cada paso recibe su encabezado (Atrás y progreso) y arma su propia acción principal
 */
export default function ChecklistWizard() {
  const { borrador, pasos, paso, numeroPaso, totalPasos, retroceder } = useChecklist()
  const atras = useAtrasDelFlujo(paso, pasos[0], retroceder)

  // Cada paso arranca desde arriba, también al volver con el Atrás del celular
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [paso, borrador])

  if (borrador) return <DraftPrompt />

  const Paso = PASOS[paso]
  const header = <WizardHeader numero={numeroPaso} total={totalPasos} onAtras={numeroPaso > 1 ? atras : null} />
  return <Paso header={header} />
}
