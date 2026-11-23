import { CircleAlert } from 'lucide-react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Separación entre el badge y el globo, y margen mínimo con el borde de la pantalla
const GAP = 8
// Tiempo para pasar el mouse del badge al globo sin que se cierre
const CIERRE_HOVER_MS = 150

/*
 * Debajo del badge, alineado a su borde derecho (el Estado va a la derecha de la fila y de la tarjeta); si no entra
 * abajo, se abre hacia arriba. El ancho útil es el del documento, sin la barra de scroll
 */
function getPosition(button, globo) {
  const rect = button.getBoundingClientRect()
  const { width, height } = globo.getBoundingClientRect()
  const viewportWidth = document.documentElement.clientWidth
  const left = Math.max(GAP, Math.min(rect.right - width, viewportWidth - width - GAP))
  const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - GAP
  return { left, top: fitsBelow ? rect.bottom + GAP : Math.max(GAP, rect.top - GAP - height) }
}

/**
 * Badge "Error" de un envío fallido. El detalle del error (lo que respondió Telegram o el servidor de correo) aparece
 * en un globo al pasar el mouse, y al tocarlo o hacerle clic queda fijo hasta tocar afuera, Escape o hacer scroll.
 * Va en un portal a <body> con posición fija: la tabla tiene scroll horizontal y recortaría un globo desplegado adentro
 * @param {{ detalle: string | null, className?: string }} props
 */
export default function ErrorEnvioBadge({ detalle, className = '' }) {
  // null: cerrado; 'hover': abierto por el mouse (se cierra al salir); 'fijo': abierto con clic o toque
  const [modo, setModo] = useState(/** @type {null | 'hover' | 'fijo'} */ (null))
  const buttonRef = useRef(null)
  const globoRef = useRef(null)
  const timerRef = useRef(0)
  const globoId = useId()
  const isOpen = modo !== null
  const texto = detalle?.trim() || 'El canal no informó el motivo.'

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
    const { top, left } = getPosition(buttonRef.current, globo)
    globo.style.top = `${top}px`
    globo.style.left = `${left}px`
  }, [isOpen])

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
      {/* El botón ocupa 44px de alto para el dedo; el badge visible es la pastilla de adentro */}
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        aria-expanded={isOpen}
        aria-controls={isOpen ? globoId : undefined}
        aria-label="Error: ver el detalle"
        className={`interactive group -my-2 inline-flex min-h-11 items-center rounded-full ${className}`}
      >
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white transition-colors duration-200 ease-glass group-hover:bg-brand-700 ${isOpen ? 'bg-brand-700' : ''}`}
        >
          <CircleAlert size={14} strokeWidth={2.25} aria-hidden="true" />
          Error
        </span>
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
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-300">
              Detalle del error
            </p>
            <p className="text-sm text-pretty break-words text-black dark:text-white">{texto}</p>
          </div>,
          document.body,
        )}
    </>
  )
}
