import { apiFetch } from './api'

/**
 * Vacantes públicas (sin sesión): el back solo devuelve las activas, cada una con
 * { id, titulo, descripcion, requisitos }. Sin vacantes activas responde un array vacío.
 */
export async function getVacantesPublicas({ signal } = {}) {
  const vacantes = await apiFetch('/vacantes/publicas', { auth: false, signal })
  return Array.isArray(vacantes) ? vacantes : []
}
