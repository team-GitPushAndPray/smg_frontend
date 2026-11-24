import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** @import { ReactNode } from 'react' */

// Separación entre el disparador y el globo, y margen mínimo con el borde de la pantalla
const GAP = 8
// Tiempo para pasar el mouse del disparador al globo sin que se cierre
const CIERRE_HOVER_MS = 150

/*
 * Debajo del disparador, alineado a su borde derecho o izquierdo según `alinear`; si no entra abajo, se abre hacia
 * arriba. El ancho útil es el del documento, sin la barra de scroll
 */
function getPosition(button, globo, alinear) {
  const rect = button.getBoundingClientRect()
  const { width, height } = globo.getBoundingClientRect()
  const viewportWidth = document.documentElement.clientWidth
  const deseado = alinear === 'izquierda' ? rect.left : rect.right - width
  const left = Math.max(GAP, Math.min(deseado, viewportWidth - width - GAP))
  const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - GAP
  return { left, top: fitsBelow ? rect.bottom + GAP : Math.max(GAP, rect.top - GAP - height) }
}

/**
 * Disparador (un badge) con un globo de detalle: aparece al pasar el mouse, y al tocarlo o hacerle clic queda fijo
 * hasta tocar afuera, Escape o hacer scroll. Va en un portal a <body> con posición fija: las tablas tienen scroll
 * horizontal y recortarían un globo desplegado adentro. `children` recibe si el globo está abierto, para que el badge
 * pueda marcarlo
 * @param {{
 *   titulo: string,
 *   texto: string,
 *   ariaLabel: string,
 *   alinear?: 'derecha' | 'izquierda',
 *   className?: string,
 *   children: (abierto: boolean) => ReactNode,
 * }} props
 */
export default function GloboDetalle({ titulo, texto, ariaLabel, alinear = 'derecha', className = '', children }) {
  // null: cerrado; 'hover': abierto por el mouse (se cierra al salir); 'fijo': abierto con clic o toque
  const [modo, setModo] = useState(/** @type {null | 'hover' | 'fijo'} */ (null))
  const buttonRef = useRef(null)
  const globoRef = useRef(null)
  const timerRef = useRef(0)
  const globoId = useId()
  const isOpen = modo !== null

  const cancelarCierre = () => window.clearTimeout(timerRef.current)
  const cerrar = useCallback(() => {
    window.clearTimeout(timerRef.current)
    setModo(null)
  }, [])

  // Con el mouse, solo el hover (el toque también dispara pointerenter, y ahí manda el clic)
  const onPointerEnter = (event) => {
    if (event.pointerType !== 'mouse') return
    cancelarCierre()
    setModo((actual) => actual ?? 'hover')
  }
  const onPointerLeave = (event) => {
    if (event.pointerType !== 'mouse') return
    cancelarCierre()
    timerRef.current = window.setTimeout(() => setModo((actual) => (actual === 'hover' ? null : actual)), CIERRE_HOVER_MS)
  }

  // Un clic fija el globo que abrió el hover; otro, lo cierra
  const onClick = () => {
    cancelarCierre()
    setModo((actual) => (actual === 'fijo' ? null : 'fijo'))
  }

  useLayoutEffect(() => {
    if (!isOpen) return
    const globo = globoRef.current
    const { top, left } = getPosition(buttonRef.current, globo, alinear)
    globo.style.top = `${top}px`
    globo.style.left = `${left}px`
  }, [isOpen, alinear])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      cerrar()
      buttonRef.current?.focus()
    }
    const onPointerDown = (event) => {
      if (!globoRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) cerrar()
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', cerrar, true)
    window.addEventListener('resize', cerrar)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', cerrar, true)
      window.removeEventListener('resize', cerrar)
    }
  }, [isOpen, cerrar])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  return (
    <>
      {/* El botón ocupa 44px de alto para el dedo; el badge visible es lo de adentro */}
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        aria-expanded={isOpen}
        aria-controls={isOpen ? globoId : undefined}
        aria-label={ariaLabel}
        className={`interactive group -my-2 inline-flex min-h-11 items-center rounded-full ${className}`}
      >
        {children(isOpen)}
      </button>

      {/* z-30: sobre el contenido del panel y debajo de la topbar (z-40), los modales (z-50) y los avisos (z-60) */}
      {isOpen &&
        createPortal(
          <div
            ref={globoRef}
            id={globoId}
            role="status"
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            className="glass-strong fixed z-30 flex w-72 max-w-[calc(100vw-1rem)] flex-col gap-1 px-4 py-3 text-left"
          >
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-300">{titulo}</p>
            <p className="text-sm text-pretty break-words text-black dark:text-white">{texto}</p>
          </div>,
          document.body,
        )}
    </>
  )
}
