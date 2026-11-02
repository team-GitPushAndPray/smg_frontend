import { ChevronRight } from 'lucide-react'
import { useChecklist } from '../../../hooks/useChecklist'
import FieldScreen from '../FieldScreen'
import MainAction from '../MainAction'
import ProvisionalNote from './ProvisionalNote'

// Paso de ítems del checklist elegido. Provisorio: lista los ítems que mandó el back, sin las respuestas
export default function ItemsStep({ header }) {
  const { opcion, avanzar } = useChecklist()
  const items = opcion?.items ?? []

  return (
    <FieldScreen header={header} footer={<MainAction label="Siguiente" icon={ChevronRight} onClick={avanzar} />}>
      <h1 className="text-2xl font-semibold text-balance">Revisá cada ítem</h1>
      <ProvisionalNote>Acá vas a marcar cada ítem como Normal, Anormal o No aplica.</ProvisionalNote>
      {items.length > 0 && (
        <ol className="campo-card flex list-decimal flex-col gap-2 py-4 pr-4 pl-10 text-neutral-700">
          {items.map((item) => (
            <li key={item.id}>{item.nombre}</li>
          ))}
        </ol>
      )}
    </FieldScreen>
  )
}
