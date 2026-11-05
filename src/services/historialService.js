import { adaptarChecklistHistorial } from '../utils/historial'
import { apiFetch, toQuery } from './api'

/*
 * Historial de un equipo (M-07): solo lectura, todo cuelga de /equipos/:id/historial/... y exige ver Máquinas.
 * El equipo puede estar dado de baja: su historial se conserva. 404 si el equipo no existe; 400 si un filtro no
 * pasa la validación (una fecha que no existe, "desde" posterior a "hasta")
 */

/*
 * Checklists del equipo, del más nuevo al más viejo (lo ordena el back). `filtros`, todos opcionales:
 * { desde, hasta (YYYY-MM-DD), tipo, responsable, q, page, limit }. `responsable` es "contiene" sin distinguir
 * mayúsculas en nombre o apellido; `q` busca en las observaciones generales y en las de cada ítem.
 * Devuelve { checklists, meta: { total, page, limit } }
 */
export async function listarChecklistsEquipo(equipoId, filtros, { signal } = {}) {
  const respuesta = await apiFetch(`/equipos/${equipoId}/historial/checklists${toQuery(filtros)}`, { signal })
  return {
    checklists: Array.isArray(respuesta?.data) ? respuesta.data.map(adaptarChecklistHistorial) : [],
    meta: { total: respuesta?.meta?.total ?? 0, page: respuesta?.meta?.page ?? 1, limit: respuesta?.meta?.limit ?? 0 },
  }
}
