import { ChevronLeft, ChevronRight, ImageOff, LoaderCircle, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getUrlFoto, TRANSFORMACION_FOTO } from '../../utils/historial'

// Distancia mínima (en px) de un deslizamiento horizontal para pasar de foto en el celular
const SWIPE_MIN = 50

// Controles sobre la foto: blancos sobre un círculo oscuro, de 48px, para que se vean y se toquen sobre cualquier foto
const controlClass =
  'interactive grid size-12 shrink-0 place-items-center rounded-full bg-(--visor-control-bg) text-white hover:bg-(--visor-control-bg-hover)'

/*
 * Visor de las fotos de un checklist a pantalla completa, sobre un fondo casi negro (igual en claro y oscuro, para
 * que la foto no compita con nada). Abre en la foto `inicial` y recorre todas con las flechas de la pantalla, las del
 * teclado o deslizando en el celular; al llegar a la última sigue por la primera. Se cierra con la X o con Escape.
 * Igual que el Modal del panel: foco atrapado adentro, scroll de la página bloqueado y, al cerrar, el foco vuelve
 * a la miniatura que lo abrió. Precarga la anterior y la siguiente para que pasar de foto sea inmediato
 */
export default function VisorFotos({ fotos, inicial = 0, onClose }) {
  const total = fotos.length
  const [index, setIndex] = useState(() => Math.min(Math.max(inicial, 0), total - 1))
  // Estado de carga de cada foto ampliada, por su URL: 'ok' o 'error' (sin entrada, todavía cargando)
  const [estados, setEstados] = useState({})
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const touchX = useRef(null)
  const openerRef = useRef(document.activeElement)

  const foto = fotos[index]
  const src = getUrlFoto(foto.url, TRANSFORMACION_FOTO.ampliada)
  const estado = estados[src] ?? 'loading'
  const variasFotos = total > 1

  const anterior = useCallback(() => setIndex((actual) => (actual - 1 + total) % total), [total])
  const siguiente = useCallback(() => setIndex((actual) => (actual + 1) % total), [total])

  // Foco inicial en la X, scroll de la página bloqueado y foco de vuelta a la miniatura al cerrar
  useEffect(() => {
    closeRef.current?.focus()
    const opener = openerRef.current
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [])

  // Escape cierra, las flechas cambian de foto y Tab recorre solo los controles del visor
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowLeft' && variasFotos) {
        event.preventDefault()
        anterior()
      } else if (event.key === 'ArrowRight' && variasFotos) {
        event.preventDefault()
        siguiente()
      } else if (event.key === 'Tab') {
        const focusables = [...dialogRef.current.querySelectorAll('button, a[href]')]
        const first = focusables[0]
        const last = focusables.at(-1)
        const isInside = dialogRef.current.contains(document.activeElement)
        if (event.shiftKey && (document.activeElement === first || !isInside)) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && (document.activeElement === last || !isInside)) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, anterior, siguiente, variasFotos])

  // La anterior y la siguiente se piden de antemano: al pasar ya están en la caché del navegador
  useEffect(() => {
    if (!variasFotos) return
    for (const vecina of [fotos[(index + 1) % total], fotos[(index - 1 + total) % total]]) {
      new Image().src = getUrlFoto(vecina.url, TRANSFORMACION_FOTO.ampliada)
    }
  }, [fotos, index, total, variasFotos])

  const marcar = (valor) => setEstados((actuales) => ({ ...actuales, [src]: valor }))

  const onTouchStart = (event) => {
    touchX.current = event.touches.length === 1 ? event.touches[0].clientX : null
  }

  const onTouchEnd = (event) => {
    if (touchX.current === null || !variasFotos) return
    const distancia = event.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (distancia > SWIPE_MIN) anterior()
    else if (distancia < -SWIPE_MIN) siguiente()
  }

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fotos del checklist"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-(--visor-bg) text-white"
    >
      <header className="flex items-center justify-between gap-4 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-6 sm:pt-5">
        <p aria-live="polite" className="pl-2 text-sm font-medium tabular-nums">
          Foto {index + 1} de {total}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar" title="Cerrar" className={controlClass}>
          <X size={22} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-20 sm:pb-8">
        {estado === 'loading' && (
          <LoaderCircle size={32} strokeWidth={1.75} aria-hidden="true" className="absolute animate-spin text-neutral-400" />
        )}

        {estado === 'error' ? (
          <div role="alert" className="flex max-w-xs flex-col items-center gap-3 text-center">
            <ImageOff size={32} strokeWidth={1.5} aria-hidden="true" className="text-neutral-400" />
            <p className="text-neutral-200">No pudimos cargar esta foto.</p>
            <a
              href={foto.url}
              target="_blank"
              rel="noreferrer"
              className="interactive rounded-sm font-medium text-white underline underline-offset-4"
            >
              Abrir la original
            </a>
          </div>
        ) : (
          <img
            key={src}
            src={src}
            alt={`Foto ${index + 1} de ${total} del checklist`}
            onLoad={() => marcar('ok')}
            onError={() => marcar('error')}
            className={`max-h-[calc(100svh-6.5rem)] max-w-full rounded-control object-contain select-none sm:max-h-[calc(100svh-8rem)] ${estado === 'ok' ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {variasFotos && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Foto anterior"
              title="Anterior"
              className={`${controlClass} absolute top-1/2 left-2 -translate-y-1/2 sm:left-5`}
            >
              <ChevronLeft size={26} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={siguiente}
              aria-label="Foto siguiente"
              title="Siguiente"
              className={`${controlClass} absolute top-1/2 right-2 -translate-y-1/2 sm:right-5`}
            >
              <ChevronRight size={26} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
