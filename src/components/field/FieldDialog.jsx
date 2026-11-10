import { useId } from 'react'

/*
 * Pregunta del módulo de campo que frena el flujo: un <dialog> nativo que se abre con ref.current.showModal(),
 * así el foco queda adentro y lo de atrás no se puede tocar. `children` son los botones, uno debajo del otro.
 * Escape (o el Atrás del celular, en los navegadores que lo cierran) llama a `onCancel`
 */
export default function FieldDialog({ ref, title, description, onCancel, children }) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={onCancel}
      className="campo-dialog"
    >
      <div className="flex flex-col gap-2 pb-6 text-center">
        <h2 id={titleId} className="text-xl font-semibold text-balance">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="text-lg text-pretty text-neutral-700">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </dialog>
  )
}
