import { useEffect } from 'react'
import { useAtrasDelFlujo } from '../../hooks/useAtrasDelFlujo'
import { useChecklist } from '../../hooks/useChecklist'
import ChecklistDone from './ChecklistDone'
import ChecklistStart from './ChecklistStart'
import DraftPrompt from './DraftPrompt'
import CierreStep from './steps/CierreStep'
import HorasStep from './steps/HorasStep'
import ItemsStep from './steps/ItemsStep'
import RevisionStep from './steps/RevisionStep'
import WizardHeader from './WizardHeader'

// Pantalla de cada paso, por el id que usa ChecklistProvider
const PASOS = {
  inicio: ChecklistStart,
  horas: HorasStep,
  items: ItemsStep,
  cierre: CierreStep,
  revision: RevisionStep,
}

/*
 * Asistente del checklist: un solo camino hacia adelante, un paso por pantalla. Si quedó un borrador, primero
 * pregunta si seguirlo. Cada paso recibe su encabezado (Atrás y progreso) y arma su propia acción principal.
 * Después de enviar se ve "Listo": el checklist enviado ya se descartó, así que su Atrás (el del celular y su botón)
 * lleva a uno nuevo y nunca reabre el formulario cargado. Mientras se envía, la pantalla no ofrece "Atrás"
 */
export default function ChecklistWizard() {
  const { borrador, resultado, pasos, paso, numeroPaso, totalPasos, enviando, retroceder, otroChecklist } =
    useChecklist()
  const atras = useAtrasDelFlujo(paso, pasos[0], resultado ? otroChecklist : retroceder)

  // Cada paso arranca desde arriba, también al volver con el Atrás del celular
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [paso, borrador, resultado])

  if (borrador) return <DraftPrompt />
  if (resultado) return <ChecklistDone onOtro={atras} />

  const Paso = PASOS[paso]
  const header = (
    <WizardHeader numero={numeroPaso} total={totalPasos} onAtras={numeroPaso > 1 && !enviando ? atras : null} />
  )
  return <Paso header={header} />
}
