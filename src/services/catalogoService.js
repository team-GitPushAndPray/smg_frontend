import { apiFetch } from './api'

/**
 * Catálogo público: el back solo devuelve equipos disponibles y activos,
 * con su categoría y el detalle de máquina o aditamento.
 */
export async function getCatalogo({ signal } = {}) {
  const equipos = await apiFetch('/catalogo', { signal })
  return Array.isArray(equipos) ? equipos : []
}

/*
 * Detalle de un equipo del catálogo, con el mismo formato que cada ítem del listado.
 * Si no existe o no está disponible, el back responde 404 (error.status).
 */
export function getEquipo(id, { signal } = {}) {
  return apiFetch(`/catalogo/id=${id}`, { signal })
}
