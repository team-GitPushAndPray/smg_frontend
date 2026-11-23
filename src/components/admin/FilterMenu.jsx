import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Separación entre la pastilla y el menú, y margen mínimo con el borde de la pantalla
const GAP = 8

const itemBase = 'interactive flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm'
const itemIdle =
  'text-neutral-700 hover:bg-black/5 hover:text-black focus-visible:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:bg-white/10'

// Color del ícono de cada opción según su tono (el mismo que su badge en la tabla); sin tono, gris
const TONOS = Object.freeze({
  ok: 'text-ok-700 dark:text-ok-300',
  error: 'text-brand-700 dark:text-brand-400',
})
const tonoNeutro = 'text-neutral-500 dark:text-neutral-400'

/*
 * Debajo de la pastilla, alineado a su borde izquierdo y corrido si no entra en la pantalla; si no entra abajo, se
 * abre hacia arriba. El ancho útil es el del documento, sin la barra de scroll
 */
function getPosition(button, menu) {
  const rect = button.getBoundingClientRect()
  const { width, height } = menu.getBoundingClientRect()
  const viewportWidth = document.documentElement.clientWidth
  const left = Math.max(GAP, Math.min(rect.left, viewportWidth - width - GAP))
  const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - GAP
  return { left, top: fitsBelow ? rect.bottom + GAP : Math.max(GAP, rect.top - GAP - height) }
}

/**
 * Filtro de una sola elección como pastilla con menú desplegable. Sin filtro (la primera opción) la pastilla dice solo
 * el nombre del filtro ("Estado"); con uno aplicado muestra la opción elegida con su ícono, teñida del acento, para que
 * se note que la lista está filtrada. El nombre accesible dice siempre las dos cosas ("Estado: Error").
 * El menú tiene un título y las opciones con su ícono; la elegida, con un tilde. Se maneja con el teclado (flechas,
 * Inicio, Fin, Escape) y se cierra al elegir, con un clic afuera, Tab o cualquier scroll.
 * Va en un portal a <body> con posición fija, para que nunca se salga de la pantalla en celular.
 * `opciones` es un objeto { valor: { label, Icon, tono } } en el orden del menú; la primera es "sin filtro"
 * @param {{
 *   titulo: string,
 *   opciones: Record<string, { label: string, Icon: import('react').ElementType, tono: 'ok' | 'error' | null }>,
 *   valor: string,
 *   onCambiar: (valor: string) => void,
 * }} props
 */
export default function FilterMenu({ titulo, opciones, valor, onCambiar }) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const menuId = useId()
  const tituloId = useId()

  const entradas = Object.entries(opciones)
  const porDefecto = entradas[0][0]
  const isActive = valor !== porDefecto
  const elegida = opciones[valor] ?? opciones[porDefecto]
  const { Icon: IconElegida } = elegida

  // Se ubica antes de pintar (así no aparece un instante en otro lugar) y el foco va a la opción elegida
  useLayoutEffect(() => {
    if (!isOpen) return
    const menu = menuRef.current
    const { top, left } = getPosition(buttonRef.current, menu)
    menu.style.top = `${top}px`
    menu.style.left = `${left}px`
    ;(menu.querySelector('[aria-checked="true"]') ?? menu.querySelector('[role="menuitemradio"]'))?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const close = () => setIsOpen(false)
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  const cerrarYVolver = () => {
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  const elegir = (clave) => {
    cerrarYVolver()
    if (clave !== valor) onCambiar(clave)
  }

  // Flechas para recorrer las opciones (dando la vuelta), Inicio y Fin, Escape y Tab para cerrar
  const onMenuKeyDown = (event) => {
    const items = [...menuRef.current.querySelectorAll('[role="menuitemradio"]')]
    const actual = items.indexOf(document.activeElement)
    const mover = { ArrowDown: actual + 1, ArrowUp: actual - 1, Home: 0, End: items.length - 1 }
    if (event.key in mover) {
      event.preventDefault()
      items[(mover[event.key] + items.length) % items.length]?.focus()
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault()
      cerrarYVolver()
    }
  }

  // Flecha abajo o arriba sobre la pastilla también abre el menú
  const onButtonKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    setIsOpen(true)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`${titulo}: ${elegida.label}`}
        className={isActive ? 'pill-active pr-3 pl-3' : 'pill pr-3 pl-4'}
      >
        {isActive && <IconElegida size={16} strokeWidth={2} aria-hidden="true" className="shrink-0" />}
        <span>{isActive ? elegida.label : titulo}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 opacity-70 transition-transform duration-200 ease-glass motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* z-30: sobre el contenido del panel y debajo de la topbar (z-40), los modales (z-50) y los avisos (z-60) */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={tituloId}
            onKeyDown={onMenuKeyDown}
            className="glass-strong fixed z-30 flex w-60 max-w-[calc(100vw-1rem)] animate-dialog-in flex-col p-1.5 motion-reduce:animate-none"
          >
            <p
              id={tituloId}
              className="px-3 pt-2 pb-1.5 text-xs font-medium tracking-wide text-neutral-600 uppercase dark:text-neutral-400"
            >
              {titulo}
            </p>
            {entradas.map(([clave, { label, Icon, tono }], index) => {
              const isChecked = clave === valor
              return (
                <div key={clave} role="none" className="contents">
                  {/* Una línea separa "sin filtro" de las opciones */}
                  {index === 1 && <div role="separator" className="mx-3 my-1 h-px bg-black/5 dark:bg-white/10" />}
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isChecked}
                    onClick={() => elegir(clave)}
                    className={`${itemBase} ${itemIdle} ${isChecked ? 'font-semibold text-black dark:text-white' : 'font-medium'}`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className={`shrink-0 ${TONOS[tono] ?? tonoNeutro}`}
                    />
                    <span className="flex-1">{label}</span>
                    {isChecked && (
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        aria-hidden="true"
                        className="shrink-0 text-brand-600 dark:text-brand-400"
                      />
                    )}
                  </button>
                </div>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
