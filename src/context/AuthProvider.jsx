import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import { getToken, removeToken, saveToken, setForbiddenHandler, setUnauthorizedHandler } from '../services/api'
import { getMe, postLogin } from '../services/authService'
import { AuthContext } from './AuthContext'

const FORBIDDEN_MESSAGE = 'No tenés permisos para realizar esta acción'

/*
 * Sesión del panel de gestión. El token se guarda en localStorage y, al abrir la app,
 * se restaura la sesión pidiendo /auth/me; mientras tanto `cargando` es true.
 * Al terminar la sesión no se navega desde acá: <RutaPrivada> lleva al login si se estaba en el panel.
 * `cerroSesion` distingue el "Cerrar sesión" del usuario de una sesión vencida: solo en el segundo caso
 * se vuelve a la sección de origen después del login.
 */
export default function AuthProvider({ children }) {
  const { showToast } = useToast()
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(() => Boolean(getToken()))
  const [cerroSesion, setCerroSesion] = useState(false)

  const endSession = useCallback(() => {
    removeToken()
    setUsuario(null)
  }, [])

  // 401 en una ruta privada: token vencido, inválido o usuario dado de baja.
  // 403: el rol no permite esa acción; la sesión sigue abierta y solo se avisa
  useEffect(() => {
    setUnauthorizedHandler(endSession)
    setForbiddenHandler(() => showToast(FORBIDDEN_MESSAGE))
    return () => {
      setUnauthorizedHandler(null)
      setForbiddenHandler(null)
    }
  }, [endSession, showToast])

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
      setCerroSesion(false)
    } catch (error) {
      removeToken()
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    setCerroSesion(true)
    endSession()
  }, [endSession])

  // Si el token ya no está guardado (se borró a mano o se cerró la sesión en otra pestaña), la sesión termina.
  // <RutaPrivada> lo verifica en cada cambio de sección
  const verificarSesion = useCallback(() => {
    if (usuario && !getToken()) endSession()
  }, [usuario, endSession])

  // Permisos por módulo: usar siempre los códigos de MODULOS (config/rutasPanel.js)
  const tieneModulo = useCallback(
    (codigo) => Boolean(usuario?.modulos.some((modulo) => modulo.codigo === codigo)),
    [usuario],
  )

  const puedeEditar = useCallback(
    (codigo) => Boolean(usuario?.modulos.some((modulo) => modulo.codigo === codigo && modulo.puedeEditar === true)),
    [usuario],
  )

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, cerroSesion, login, logout, verificarSesion, tieneModulo, puedeEditar }}
    >
      {children}
    </AuthContext.Provider>
  )
}
