import { ArrowDown, Check, ChevronRight, CircleCheck, ClipboardList, Minus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChecklist } from '../../../hooks/useChecklist'
import { getEstadoItem, marcarPendientes, permiteNoAplicaMasivo, textoFaltanItems } from '../../../utils/checklists'
import EnvioAlert from '../EnvioAlert'
import FieldScreen from '../FieldScreen'
import ItemCard from '../ItemCard'
import MainAction from '../MainAction'

// Cuánto queda marcado el ítem pendiente al que lleva el botón principal
const DURACION_RESALTADO = 2500

/*
 * Paso de ítems: la lista del checklist elegido, en el orden del back, con un contador fijo arriba. Al final, para
 * los pendientes, marcar en bloque como Normal (y como No aplica en entrega y devolución) sin pisar lo respondido.
 * Con pendientes no se avanza: el botón principal dice cuántos faltan y lleva al primero. Las respuestas van a los
 * datos del asistente y, con ellos, al borrador. Si se llegó desde la revisión, el botón vuelve directo a ella
 */
export default function ItemsStep({ header }) {
  const { opcion, datos, editando, actualizarDatos, avanzar } = useChecklist()
  const tarjetas = useRef(new Map())
  const [resaltado, setResaltado] = useState(null)

  const items = opcion?.items ?? []
  const { respuestas } = datos
  const pendientes = items.filter((item) => !getEstadoItem(respuestas, item.id))
  const respondidos = items.length - pendientes.length

  // Cada toque en el botón principal crea un objeto nuevo: el resaltado vuelve a durar lo mismo
  useEffect(() => {
    if (!resaltado) return
    const timer = setTimeout(() => setResaltado(null), DURACION_RESALTADO)
    return () => clearTimeout(timer)
  }, [resaltado])

  const responder = (itemId, estado) => {
    actualizarDatos({ respuestas: { ...respuestas, [itemId]: estado } })
    if (resaltado?.id === itemId) setResaltado(null)
  }

  const marcarTodos = (estado) => actualizarDatos({ respuestas: marcarPendientes(respuestas, items, estado) })

  // Centrado en la pantalla, así no queda tapado por el encabezado ni por el botón fijos
  const irAlPrimerPendiente = () => {
    const { id } = pendientes[0]
    const tarjeta = tarjetas.current.get(id)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    tarjeta?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    tarjeta?.querySelector('button')?.focus({ preventScroll: true })
    setResaltado({ id })
  }

  const accion =
    pendientes.length > 0 ? (
      <MainAction label={textoFaltanItems(pendientes.length)} icon={ArrowDown} incompleto onClick={irAlPrimerPendiente} />
    ) : (
      <MainAction label={editando ? 'Volver a la revisión' : 'Siguiente'} icon={ChevronRight} onClick={avanzar} />
    )

  const encabezado = (
    <div className="flex flex-col gap-3">
      {header}
      <p className="flex items-center gap-2 text-lg font-semibold tabular-nums">
        {pendientes.length === 0 && (
          <CircleCheck size={22} strokeWidth={2} aria-hidden="true" className="shrink-0 text-ok-700" />
        )}
        {respondidos} de {items.length} respondidos
      </p>
    </div>
  )

  return (
    <FieldScreen header={encabezado} footer={accion}>
      <h1 className="text-2xl font-semibold text-balance">Revisá cada ítem</h1>
      <EnvioAlert />

      {items.length === 0 ? (
        <div className="campo-card flex items-center gap-4 p-4 text-neutral-700">
          <ClipboardList size={28} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <p>Esta revisión no tiene ítems. Podés seguir.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((item, index) => (
            <ItemCard
              key={item.id}
              ref={(node) => {
                tarjetas.current.set(item.id, node)
                return () => tarjetas.current.delete(item.id)
              }}
              numero={index + 1}
              item={item}
              estado={getEstadoItem(respuestas, item.id)}
              resaltado={resaltado?.id === item.id}
              onResponder={responder}
            />
          ))}
        </ol>
      )}

      {pendientes.length > 0 && (
        <section aria-label="Marcar los pendientes" className="mt-2 flex flex-col gap-3">
          <p className="text-pretty text-neutral-700">Lo que ya marcaste no cambia.</p>
          <button type="button" className="campo-btn-secondary py-3 text-center" onClick={() => marcarTodos('NORMAL')}>
            <Check size={22} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-ok-700" />
            <span className="text-balance">Marcar pendientes como Normal</span>
          </button>
          {permiteNoAplicaMasivo(opcion?.tipo) && (
            <button
              type="button"
              className="campo-btn-secondary py-3 text-center"
              onClick={() => marcarTodos('NO_APLICA')}
            >
              <Minus size={22} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-neutral-700" />
              <span className="text-balance">Marcar pendientes como No aplica</span>
            </button>
          )}
        </section>
      )}
    </FieldScreen>
  )
}
