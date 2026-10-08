import { useEffect } from 'react'
import { useLocation } from 'react-router'

/*
 * Lleva con scroll suave a la sección del ancla (#servicios, #contacto...).
 * El router no lo hace solo; se dispara también al tocar dos veces el mismo link.
 */
export function useHashScroll() {
  const { hash, key } = useLocation()

  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (!target) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [hash, key])
}
