import { apiFetch } from './api'

/*
 * Equipos del panel (módulo máquinas): a diferencia del catálogo, llegan todos, sin importar estado ni actividad.
 * El DELETE no borra: da de baja. Errores: 400 si el body o los filtros no pasan la validación; 404 si el equipo
 * no existe; 409 si choca con otro equipo o si está dado de baja (no admite cambios).
 * Para mostrarlos se usa getErrorEquipo() (utils/equipos.js).
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

// Horas de motor de una máquina: un entero que no puede ser menor a las actuales (si no, 400). Devuelve el equipo
export function actualizarHoras(id, horas) {
  return apiFetch(`/equipos/${id}/horas`, { method: 'PATCH', body: { horasMotorActual: horas } })
}

// `estado`: una de las claves de ESTADOS_EQUIPO (utils/equipos.js). Devuelve el equipo
export function cambiarEstado(id, estado) {
  return apiFetch(`/equipos/${id}/estado`, { method: 'PATCH', body: { estado } })
}

// Baja lógica: el equipo se conserva con su historial, pero sale del inventario y del catálogo. Responde 204
export function darDeBaja(id) {
  return apiFetch(`/equipos/${id}`, { method: 'DELETE' })
}
