import { API_URL } from '../config/env'

/**
 * Cliente HTTP base para el backend. Los services de cada módulo
 * (ej: maquinasService) se construyen sobre esta función.
 */
export async function apiFetch(path, { headers, body, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.message ?? `Error ${response.status} en ${path}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
