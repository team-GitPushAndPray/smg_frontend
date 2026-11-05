import { useId, useRef } from 'react'
import { PESTANAS_HISTORIAL } from '../../utils/historial'

// Radio interno = radio de la pista (rounded-card) menos su padding (p-1)
const tabBase =
  'interactive flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[calc(var(--radius-card)-0.25rem)] px-1 text-xs font-medium whitespace-nowrap sm:min-h-11 sm:flex-row sm:gap-2 sm:px-5 sm:text-sm'
const tabIdle = 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
const tabActive = 'bg-(--segment-active-bg) text-black shadow-(--segment-active-shadow) dark:text-white'
// El ícono de la pestaña activa lleva el acento: brand-700 / brand-400 pasan AA sobre el vidrio
const iconActive = 'text-brand-700 dark:text-brand-400'

/*
 * Pestañas del historial: control segmentado sobre vidrio, con el patrón de tabs de WAI-ARIA (las flechas, Inicio y
 * Fin cambian de pestaña; Tab pasa al contenido). `activa` es el id de la pestaña y `onCambiar` recibe el nuevo.
 * En celular el ícono va arriba del texto, así las tres entran en una línea a 360px sin cortarse.
 * Solo se monta el contenido de la activa: cada pestaña pide sus datos recién cuando se abre
 */
export default function HistorialTabs({ activa, onCambiar, children }) {
  const baseId = useId()
  const tabsRef = useRef([])
  const tabId = (id) => `${baseId}-tab-${id}`
  const panelId = `${baseId}-panel`

  const elegir = (index) => {
    const pestana = PESTANAS_HISTORIAL[index]
    tabsRef.current[index]?.focus()
    if (pestana.id !== activa) onCambiar(pestana.id)
  }

  const onKeyDown = (event) => {
    const actual = PESTANAS_HISTORIAL.findIndex(({ id }) => id === activa)
    const ultima = PESTANAS_HISTORIAL.length - 1
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
        aria-label="Historial del equipo"
        onKeyDown={onKeyDown}
        className="glass grid w-full grid-cols-3 gap-0.5 p-1 sm:w-auto sm:self-start"
      >
        {PESTANAS_HISTORIAL.map(({ id, label, Icon }, index) => {
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
              {label}
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
