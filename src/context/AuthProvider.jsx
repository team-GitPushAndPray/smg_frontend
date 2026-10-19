import { useCallback, useEffect, useState } from 'react'
import { getToken, removeToken, saveToken, setUnauthorizedHandler } from '../services/api'
import { getMe, postLogin } from '../services/authService'
import { AuthContext } from './AuthContext'

// Páginas del panel de gestión (sin contar el login)
function isInPanel() {
  const { pathname } = window.location
  return /^\/admin(\/|$)/.test(pathname) && !pathname.startsWith('/admin/login')
}

/*
 * Sesión del panel de gestión. El token se guarda en localStorage y, al abrir la app,
 * se restaura la sesión pidiendo /auth/me; mientras tanto `cargando` es true.
 * `onSessionEnd` lleva al login: se llama al cerrar sesión y cuando la sesión vence estando en el panel.
 */
export default function AuthProvider({ onSessionEnd, children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(() => Boolean(getToken()))

  const endSession = useCallback(
    (redirect) => {
      removeToken()
      setUsuario(null)
      if (redirect) onSessionEnd?.()
    },
    [onSessionEnd],
  )

  // 401 en una ruta privada: token vencido, inválido o usuario dado de baja.
  // Si pasa en el portal público (un token viejo al entrar a la home) solo se limpia, sin mandar al login
  useEffect(() => {
    setUnauthorizedHandler(() => endSession(isInPanel()))
    return () => setUnauthorizedHandler(null)
  }, [endSession])

  // Restaura la sesión al abrir la app. Si no hay conexión se conserva el token para el próximo intento
  useEffect(() => {
    if (!getToken()) return
    const controller = new AbortController()

    getMe({ signal: controller.signal })
      .then((user) => {
        if (!controller.signal.aborted) setUsuario(user)
      })
      .catch(() => {
        // El 401 ya lo resolvió el handler de arriba
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false)
      })

    return () => controller.abort()
  }, [])

  const login = useCallback(async (email, password) => {
    const token = await postLogin(email, password)
    saveToken(token)
    try {
      setUsuario(await getMe())
    } catch (error) {
      removeToken()
      throw error
    }
  }, [])

  const logout = useCallback(() => endSession(true), [endSession])

  // Si el token ya no está guardado (se borró a mano o se cerró la sesión en otra pestaña), la sesión termina.
  // El panel lo verifica en cada cambio de sección
  const verificarSesion = useCallback(() => {
    if (usuario && !getToken()) endSession(true)
  }, [usuario, endSession])

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, verificarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}
