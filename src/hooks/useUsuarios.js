import { useCallback, useEffect, useState } from 'react'
import { listarRoles, listarUsuarios } from '../services/usuariosService'

/*
 * Usuarios del panel y roles disponibles, pedidos juntos: los roles hacen falta para el select
 * y para reconocer al superAdmin (su rol viene con `esSistema: true`).
 * `status` es 'loading', 'success' o 'error'. `retry` vuelve a pedir todo mostrando la carga;
 * `refresh` lo pide en segundo plano, sin vaciar la tabla (si falla, se conservan los datos que había).
 */
export function useUsuarios() {
  const [state, setState] = useState({ status: 'loading', usuarios: [], roles: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    Promise.all([listarUsuarios({ signal }), listarRoles({ signal })])
      .then(([usuarios, roles]) => {
        if (!signal.aborted) setState({ status: 'success', usuarios, roles })
      })
      .catch(() => {
        if (signal.aborted) return
        setState((current) => (current.status === 'success' ? current : { status: 'error', usuarios: [], roles: [] }))
      })

    return () => controller.abort()
  }, [attempt])

  const retry = () => {
    setState({ status: 'loading', usuarios: [], roles: [] })
    setAttempt((value) => value + 1)
  }

  const refresh = () => setAttempt((value) => value + 1)

  // Reemplaza un usuario con lo que devolvió el back después de editarlo o cambiarle el estado
  const reemplazarUsuario = useCallback((usuario) => {
    setState((current) => ({
      ...current,
      usuarios: current.usuarios.map((item) => (item.id === usuario.id ? usuario : item)),
    }))
  }, [])

  return { ...state, retry, refresh, reemplazarUsuario }
}
