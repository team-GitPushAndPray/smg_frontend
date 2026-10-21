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

// `filtros`: objeto con los parámetros del listado (por ejemplo { estado, categoriaId }), todos opcionales
export async function listarEquipos(filtros, { signal } = {}) {
  const equipos = await apiFetch(`/equipos${toQuery(filtros)}`, { signal })
  return Array.isArray(equipos) ? equipos : []
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
