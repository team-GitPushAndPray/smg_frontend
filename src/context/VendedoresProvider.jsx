import { useEffect, useState } from 'react'
import { getVendedores } from '../services/vendedoresService'
import { VendedoresContext } from './VendedoresContext'

/*
 * Carga el equipo comercial una sola vez para todo el portal público:
 * la sección de la home muestra las tarjetas y el navbar decide si muestra su ancla.
 * `status` es 'loading', 'success' o 'error'; `retry` vuelve a pedirlos.
 */
export default function VendedoresProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', vendedores: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getVendedores({ signal: controller.signal })
      .then((vendedores) => {
        if (!controller.signal.aborted) setState({ status: 'success', vendedores })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error', vendedores: [] })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = () => {
    setState({ status: 'loading', vendedores: [] })
    setAttempt((value) => value + 1)
  }

  // Sin vendedores activos la sección no se muestra (ni su ancla); mientras carga o si falla, sí
  const hasEquipo = state.status !== 'success' || state.vendedores.length > 0

  return (
    <VendedoresContext.Provider value={{ ...state, hasEquipo, retry }}>{children}</VendedoresContext.Provider>
  )
}
