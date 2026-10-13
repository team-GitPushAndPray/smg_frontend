import { apiFetch } from './api'

/**
 * Catálogo público: el back solo devuelve equipos disponibles y activos,
 * con su categoría y el detalle de máquina o aditamento.
 */
export async function getCatalogo({ signal } = {}) {
  const equipos = await apiFetch('/catalogo', { signal })
  return Array.isArray(equipos) ? equipos : []
}
