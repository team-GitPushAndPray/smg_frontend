import { useId, useRef } from 'react'

// Radio interno = radio de la pista (rounded-card) menos su padding (p-1)
const tabBase =
  'interactive flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[calc(var(--radius-card)-0.25rem)] px-1 text-xs font-medium whitespace-nowrap sm:min-h-11 sm:flex-row sm:gap-2 sm:px-5 sm:text-sm'
const tabIdle = 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
const tabActive = 'bg-(--segment-active-bg) text-black shadow-(--segment-active-shadow) dark:text-white'
// El ícono de la pestaña activa lleva el acento: brand-700 / brand-400 pasan AA sobre el vidrio
const iconActive = 'text-brand-700 dark:text-brand-400'

// Contador de una pestaña: con algo que mirar, relleno del acento (blanco sobre brand-600 pasa AA); en 0, gris
const contadorBase = 'inline-grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums'
const contadorConValor = 'bg-brand-600 text-white'
const contadorVacio = 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300'

const GRID_COLS = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }

/**
 * Pestañas sobre vidrio (control segmentado) con el patrón de tabs de WAI-ARIA: las flechas, Inicio y Fin cambian de
 * pestaña; Tab pasa al contenido. `pestanas` es una lista de { id, label, Icon, contador? }; `activa` es el id de la
 * pestaña y `onCambiar` recibe el nuevo. `contador` (un número, o null mientras no se sabe) se muestra al lado del
 * texto y los lectores lo leen como parte del nombre ("Por vencer, 3").
 * En celular el ícono va arriba del texto, así tres pestañas entran en una línea a 360px sin cortarse.
 * Solo se monta el contenido de la activa: cada pestaña pide sus datos recién cuando se abre
 * @param {{
 *   pestanas: ReadonlyArray<{ id: string, label: string, Icon: import('react').ElementType, contador?: number | null }>,
 *   activa: string,
 *   onCambiar: (id: string) => void,
 *   label: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export default function SegmentedTabs({ pestanas, activa, onCambiar, label, children }) {
  const baseId = useId()
  const tabsRef = useRef([])
  const tabId = (id) => `${baseId}-tab-${id}`
  const panelId = `${baseId}-panel`

  const elegir = (index) => {
    const pestana = pestanas[index]
    tabsRef.current[index]?.focus()
    if (pestana.id !== activa) onCambiar(pestana.id)
  }

  const onKeyDown = (event) => {
    const actual = pestanas.findIndex(({ id }) => id === activa)
    const ultima = pestanas.length - 1
    const destino = {
      ArrowRight: actual === ultima ? 0 : actual + 1,
      ArrowLeft: actual === 0 ? ultima : actual - 1,
      Home: 0,
      End: ultima,
    }[event.key]
    if (destino === undefined) return
    event.preventDefault()
    elegir(destino)
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={`glass grid w-full gap-0.5 p-1 sm:w-auto sm:self-start ${GRID_COLS[pestanas.length] ?? 'grid-flow-col'}`}
      >
        {pestanas.map(({ id, label: texto, Icon, contador }, index) => {
          const isActive = id === activa
          return (
            <button
              key={id}
              ref={(node) => {
                tabsRef.current[index] = node
              }}
              type="button"
              role="tab"
              id={tabId(id)}
              aria-selected={isActive}
              aria-controls={isActive ? panelId : undefined}
              tabIndex={isActive ? 0 : -1}
              onClick={() => elegir(index)}
              className={`${tabBase} ${isActive ? tabActive : tabIdle}`}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={isActive ? iconActive : undefined} />
              <span className="inline-flex items-center gap-1.5">
                {texto}
                {contador != null && (
                  <>
                    <span className="sr-only">, </span>
                    <span className={`${contadorBase} ${contador > 0 ? contadorConValor : contadorVacio}`}>
                      {contador}
                    </span>
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(activa)}
        tabIndex={0}
        className="rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)"
      >
        {children}
      </div>
    </div>
  )
}
