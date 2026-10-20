import { useCallback, useEffect, useState } from 'react'
import { listarModulos, listarRoles } from '../services/rolesService'

/*
 * Roles (filas de la matriz) y módulos (columnas), pedidos juntos.
 * `status` es 'loading', 'success' o 'error'. `retry` vuelve a pedir todo mostrando la carga;
 * `refresh` lo pide en segundo plano, sin vaciar la matriz (si falla, se conservan los datos que había).
 */
export function useRoles() {
  const [state, setState] = useState({ status: 'loading', roles: [], modulos: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    Promise.all([listarRoles({ signal }), listarModulos({ signal })])
      .then(([roles, modulos]) => {
        if (!signal.aborted) setState({ status: 'success', roles, modulos })
      })
      .catch(() => {
        if (signal.aborted) return
        setState((current) => (current.status === 'success' ? current : { status: 'error', roles: [], modulos: [] }))
      })

    return () => controller.abort()
  }, [attempt])

  const retry = () => {
    setState({ status: 'loading', roles: [], modulos: [] })
    setAttempt((value) => value + 1)
  }

  const refresh = () => setAttempt((value) => value + 1)

  // Mezcla `cambios` en un rol: los módulos al cambiar una celda (o al revertirla) y lo que devuelve el back al editarlo
  const actualizarRol = useCallback((id, cambios) => {
    setState((current) => ({
      ...current,
      roles: current.roles.map((rol) => (rol.id === id ? { ...rol, ...cambios } : rol)),
    }))
  }, [])

  return { ...state, retry, refresh, actualizarRol }
}
