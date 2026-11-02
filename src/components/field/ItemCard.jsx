import { useId } from 'react'
import { ESTADOS_ITEM } from '../../utils/checklists'

/*
 * Un ítem del checklist: su nombre y, debajo, los tres estados del mismo ancho. Se responde con un toque y se
 * cambia tocando otro. `resaltado` la marca cuando el botón principal lleva hasta ella por estar pendiente
 */
export default function ItemCard({ ref, numero, item, estado, resaltado = false, onResponder }) {
  const nombreId = useId()

  return (
    <li ref={ref} className="campo-item" data-estado={estado ?? undefined} data-resaltado={resaltado || undefined}>
      <p id={nombreId} className="flex gap-2 px-1 pt-1 text-lg leading-snug font-medium">
        <span className="shrink-0 text-neutral-600 tabular-nums">{numero}.</span>
        <span className="min-w-0 break-words">{item.nombre}</span>
      </p>
      <div role="group" aria-labelledby={nombreId} className="flex gap-2">
        {ESTADOS_ITEM.map(({ valor, etiqueta, icono: Icon }) => (
          <button
            key={valor}
            type="button"
            className="campo-estado"
            data-estado={valor}
            aria-pressed={estado === valor}
            onClick={() => onResponder(item.id, valor)}
          >
            <Icon size={24} strokeWidth={2.5} aria-hidden="true" />
            {etiqueta}
          </button>
        ))}
      </div>
    </li>
  )
}
