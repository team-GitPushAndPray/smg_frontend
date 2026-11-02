import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'

/*
 * Hace que el botón Atrás del celular retroceda un paso del asistente en vez de sacar al usuario de la página.
 * Mientras se está pasado el primer paso, el historial tiene una entrada propia (misma URL, con
 * `state.checklistPaso`): el Atrás del celular la saca, eso se detecta y se retrocede un paso; si todavía
 * quedan pasos atrás, se vuelve a poner. Devuelve `atras`, para el botón "Atrás" de la pantalla, que hace lo mismo
 */
export function useAtrasDelFlujo(paso, primerPaso, retroceder) {
  const location = useLocation()
  const navigate = useNavigate()
  const tieneEntrada = location.state?.checklistPaso === true
  const teniaEntrada = useRef(tieneEntrada)

  useEffect(() => {
    const salioDeLaEntrada = teniaEntrada.current && !tieneEntrada
    teniaEntrada.current = tieneEntrada

    // Al retroceder cambia el paso y el efecto vuelve a correr: ahí se repone la entrada si hace falta
    if (salioDeLaEntrada) {
      retroceder()
      return
    }
    if (paso !== primerPaso && !tieneEntrada) {
      const { pathname, search, hash } = location
      navigate({ pathname, search, hash }, { state: { checklistPaso: true } })
    }
  }, [tieneEntrada, paso, primerPaso, retroceder, location, navigate])

  return () => (tieneEntrada ? navigate(-1) : retroceder())
}
