import { ChevronRight } from 'lucide-react'
import { useChecklist } from '../../../hooks/useChecklist'
import { formatHorasMotor } from '../../../utils/equipos'
import FieldScreen from '../FieldScreen'
import MainAction from '../MainAction'
import ProvisionalNote from './ProvisionalNote'

// Paso de horas del motor (solo máquinas). Provisorio: todavía no tiene el campo de horas
export default function HorasStep({ header }) {
  const { equipo, avanzar } = useChecklist()

  return (
    <FieldScreen header={header} footer={<MainAction label="Siguiente" icon={ChevronRight} onClick={avanzar} />}>
      <h1 className="text-2xl font-semibold text-balance">Cargá las horas del motor</h1>
      <p className="text-lg text-neutral-700">
        Horas actuales: <span className="font-semibold text-black">{formatHorasMotor(equipo)}</span>
      </p>
      <ProvisionalNote>Acá vas a cargar las horas que marca el horómetro.</ProvisionalNote>
    </FieldScreen>
  )
}
