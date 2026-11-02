import FieldScreen from '../FieldScreen'
import MainAction from '../MainAction'
import ProvisionalNote from './ProvisionalNote'

// Último paso: observaciones, fotos y nombre, y el envío. Provisorio: el envío todavía no está, el botón queda deshabilitado
export default function CierreStep({ header }) {
  return (
    <FieldScreen header={header} footer={<MainAction label="Enviar (todavía no disponible)" disabled />}>
      <h1 className="text-2xl font-semibold text-balance">Terminá y enviá</h1>
      <ProvisionalNote>Acá vas a sumar observaciones, fotos y tu nombre y apellido.</ProvisionalNote>
    </FieldScreen>
  )
}
