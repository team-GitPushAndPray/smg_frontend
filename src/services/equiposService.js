import { apiFetch } from './api'

/*
 * Equipos del panel (módulo máquinas): a diferencia del catálogo, llegan todos, sin importar estado ni actividad.
 * No existe DELETE. Errores: 400 si el body o los filtros no pasan la validación; 404 si el equipo no existe;
 * 409 si choca con otro equipo. Para mostrarlos se usa getErrorEquipo() (utils/equipos.js).
 */

// Query string con los filtros que tienen valor: los vacíos no viajan, para no filtrar por "" o null
function toQuery(filtros = {}) {
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') params.set(clave, valor)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

/*
 * Listado paginado, ordenado por código interno (lo define el back). `filtros`, todos opcionales:
 * { search, tipo, estado, categoriaId, activo, page, limit }. Devuelve { equipos, meta: { total, page, limit } }
 */
export async function listarEquipos(filtros, { signal } = {}) {
  const respuesta = await apiFetch(`/equipos${toQuery(filtros)}`, { signal })
  return {
    equipos: Array.isArray(respuesta?.data) ? respuesta.data : [],
    meta: { total: respuesta?.meta?.total ?? 0, page: respuesta?.meta?.page ?? 1, limit: respuesta?.meta?.limit ?? 0 },
  }
}

export function obtenerEquipo(id, { signal } = {}) {
  return apiFetch(`/equipos/${id}`, { signal })
}

export function crearEquipo(datos) {
  return apiFetch('/equipos', { method: 'POST', body: datos })
}

// `cambios`: solo los campos a modificar
export function editarEquipo(id, cambios) {
  return apiFetch(`/equipos/${id}`, { method: 'PATCH', body: cambios })
}
