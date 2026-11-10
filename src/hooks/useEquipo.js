import { useEffect, useState } from 'react'

/*
 * Carga un equipo por su id (el de la URL) con la función del service que corresponda: getEquipo (catálogo público)
 * u obtenerEquipo (panel). Tiene que ser la función importada del service, no una creada en el render.
 * `status` es 'loading', 'success', 'not-found' (404: no existe o, en el catálogo, ya no está disponible) o 'error';
 * `retry` vuelve a pedirlo. `reload` lo vuelve a pedir sin pasar por 'loading' (después de modificarlo): mientras
 * tanto se sigue viendo el que estaba y, si falla, se lo conserva.
 * El resultado se guarda junto al id que lo pidió: al cambiar de equipo se ve 'loading' sin mostrar el anterior.
 */
export function useEquipo(id, cargarEquipo) {
  const isValidId = /^\d+$/.test(id ?? '')
  const [result, setResult] = useState({ id: null, status: 'loading', equipo: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isValidId) return
    const controller = new AbortController()

    cargarEquipo(id, { signal: controller.signal })
      .then((equipo) => {
        if (!controller.signal.aborted) setResult({ id, status: 'success', equipo })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        const status = error.status === 404 ? 'not-found' : 'error'
        setResult((actual) => (actual.id === id && actual.status === 'success' ? actual : { id, status, equipo: null }))
      })

    return () => controller.abort()
  }, [id, isValidId, attempt, cargarEquipo])

  const retry = () => {
    setResult({ id: null, status: 'loading', equipo: null })
    setAttempt((value) => value + 1)
  }

  const reload = () => setAttempt((value) => value + 1)

  // Un id que no es un número no se le pide al back: no puede existir
  if (!isValidId) return { status: 'not-found', equipo: null, retry, reload }
  if (result.id !== id) return { status: 'loading', equipo: null, retry, reload }
  return { status: result.status, equipo: result.equipo, retry, reload }
}
