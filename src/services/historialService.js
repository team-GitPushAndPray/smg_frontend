import {
  adaptarChecklistHistorial,
  adaptarDetalleChecklist,
  CHECKLISTS_POR_PEDIDO_EXPORTACION,
} from '../utils/historial'
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

/*
 * Todos los checklists del equipo que cumplen los filtros (sin página), para exportarlos a PDF. Recorre las páginas
 * de a 100 (el máximo del back) hasta juntar el total que informa la primera; si una página vuelve vacía (se borró
 * algo en el medio, aunque hoy no se borra nada) corta ahí. Solo GET: no se sube nada al back
 */
export async function listarTodosLosChecklistsEquipo(equipoId, filtros, { signal } = {}) {
  const limit = CHECKLISTS_POR_PEDIDO_EXPORTACION
  const todos = []
  let total = Infinity
  for (let page = 1; todos.length < total; page += 1) {
    const { checklists, meta } = await listarChecklistsEquipo(equipoId, { ...filtros, page, limit }, { signal })
    if (page === 1) total = meta.total
    if (checklists.length === 0) break
    todos.push(...checklists)
  }
  return todos
}

/*
 * Detalle de un checklist del equipo: cabecera, respuestas en el orden de la plantilla (con la observación de cada
 * ítem) y fotos. 404 si el checklist no existe o es de otro equipo
 */
export async function obtenerChecklistEquipo(equipoId, checklistId, { signal } = {}) {
  const respuesta = await apiFetch(`/equipos/${equipoId}/historial/checklists/${checklistId}`, { signal })
  return adaptarDetalleChecklist(respuesta)
}
