import { API_URL } from '../config/env'

// Clave del token de sesión en localStorage
const TOKEN_KEY = 'token'

const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor'

// Estados con los que Vercel o un proxy avisan que el back no responde: se tratan igual que un error de red
const SERVER_DOWN_STATUS = new Set([502, 503, 504])

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sin acceso a localStorage: la sesión dura hasta recargar la página
  }
}

export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Sin acceso a localStorage no hay token guardado que borrar
  }
}

// Lo registra AuthProvider para cerrar la sesión cuando una ruta privada responde 401
let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

// Lo registra AuthProvider para avisar (sin cerrar la sesión) cuando el rol no permite la acción: 403
let onForbidden = null

export function setForbiddenHandler(handler) {
  onForbidden = handler
}

function createError(message, status, data = null) {
  const error = new Error(message)
  error.status = status
  error.data = data
  return error
}

/**
 * Cliente HTTP base para el backend. Los services de cada módulo
 * (ej: maquinasService) se construyen sobre esta función.
 * Si hay token guardado, viaja en el header Authorization. Con `auth: false` la request
 * no lleva token y un 401 no cierra la sesión (el propio login: su 401 es "credenciales inválidas").
 * Un 403 (el rol no tiene permiso) muestra un aviso y la sesión sigue abierta.
 * Los errores llevan `status` (0 si no se pudo conectar) y `data` con el cuerpo de la respuesta.
 */
export async function apiFetch(path, { headers, body, auth = true, ...options } = {}) {
  const token = auth ? getToken() : null

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    // Una request cancelada (AbortController) no es un error de conexión
    if (error.name === 'AbortError') throw error
    throw createError(NETWORK_ERROR_MESSAGE, 0)
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized?.()
    if (response.status === 403 && auth) onForbidden?.()

    const message = SERVER_DOWN_STATUS.has(response.status)
      ? NETWORK_ERROR_MESSAGE
      : (data?.message ?? `Error ${response.status} en ${path}`)
    throw createError(message, response.status, data)
  }

  return data
}
