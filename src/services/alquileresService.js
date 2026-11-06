import { apiFetch, toQuery } from './api'
import { listarEquipos } from './equiposService'

/**
 * @import {
 *   Alquiler, AlquilerAlta, AlquilerDetalle, AlquilerEdicion, AlquilerListado, DatosChecklistAlquiler,
 *   FiltrosAlquileres, FormularioChecklistAlquiler, TipoChecklistAlquiler,
 * } from '../types/alquileres'
 */

/*
 * Alquileres (M-08): ver exige el módulo ALQUILERES; alta, prórroga, ubicación, anulación y checklists, además, poder
 * editarlo (403). Un alquiler nunca se borra. Errores: 400 si el body o los filtros no pasan la validación; 404 si el
 * alquiler (o el equipo dentro de él) no existe; 409 si el estado no admite la operación o algún equipo dejó de estar
 * disponible (el message dice cuál)
 */

/**
 * Alquileres que cumplen los filtros (sin paginar). Sin filtros, todos, del más nuevo al más viejo
 * @param {FiltrosAlquileres} [filtros]
 * @returns {Promise<AlquilerListado[]>}
 */
export async function listarAlquileres(filtros = {}, { signal } = {}) {
  const { estado, ...resto } = filtros
  const query = toQuery({ ...resto, estado: Array.isArray(estado) ? estado.join(',') : estado })
  const respuesta = await apiFetch(`/alquileres${query}`, { signal })
  return Array.isArray(respuesta) ? respuesta : []
}

/**
 * @param {number | string} id
 * @returns {Promise<AlquilerDetalle>}
 */
export function obtenerAlquiler(id, { signal } = {}) {
  return apiFetch(`/alquileres/${id}`, { signal })
}

/**
 * Alta: el alquiler nace PENDIENTE y sus equipos pasan a "alquilado", todo o nada
 * @param {AlquilerAlta} datos
 * @returns {Promise<Alquiler>}
 */
export function crearAlquiler(datos) {
  return apiFetch('/alquileres', { method: 'POST', body: datos })
}

/**
 * Prórroga (fecha_fin_prevista) y cambio de ubicación o contacto de obra, solo en PENDIENTE o ACTIVO
 * @param {number | string} id
 * @param {AlquilerEdicion} cambios Solo los campos a modificar
 * @returns {Promise<Alquiler>}
 */
export function editarAlquiler(id, cambios) {
  return apiFetch(`/alquileres/${id}`, { method: 'PATCH', body: cambios })
}

/**
 * Anula un alquiler PENDIENTE sin entregas y libera sus equipos (vuelven a "disponible"). `motivo` obligatorio, máx. 500
 * @param {number | string} id
 * @param {string} motivo
 * @returns {Promise<Alquiler>}
 */
export function anularAlquiler(id, motivo) {
  return apiFetch(`/alquileres/${id}/anular`, { method: 'POST', body: { motivo } })
}

/**
 * Formulario del checklist de entrega o devolución de un equipo del alquiler: plantilla (según máquina o aditamento) y
 * contexto. Ver FormularioChecklistAlquiler para los 404 y 409
 * @param {number | string} id
 * @param {number | string} equipoId
 * @param {TipoChecklistAlquiler} tipo
 * @returns {Promise<FormularioChecklistAlquiler>}
 */
export function obtenerFormularioChecklistAlquiler(id, equipoId, tipo, { signal } = {}) {
  return apiFetch(`/alquileres/${id}/equipos/${equipoId}/checklist${toQuery({ tipo })}`, { signal })
}

/**
 * Envía el checklist de entrega o devolución: multipart con `tipo`, `datos` (JSON) y hasta 4 fotos en `fotos`.
 * La primera entrega pasa el alquiler a ACTIVO; la devolución libera el equipo y la última lo pasa a FINALIZADO
 * @param {number | string} id
 * @param {number | string} equipoId
 * @param {{ tipo: TipoChecklistAlquiler, datos: DatosChecklistAlquiler, fotos?: Blob[] }} checklist
 * @returns {Promise<Alquiler>}
 */
export function enviarChecklistAlquiler(id, equipoId, { tipo, datos, fotos = [] }) {
  const body = new FormData()
  body.append('tipo', tipo)
  body.append('datos', JSON.stringify(datos))
  fotos.forEach((foto) => body.append('fotos', foto))
  return apiFetch(`/alquileres/${id}/equipos/${equipoId}/checklist`, { method: 'POST', body })
}

/**
 * Equipos que se pueden alquilar (activos y disponibles), para el alta y el contador de disponibles. Usa el listado
 * del inventario (paginado): `filtros` acepta { search, tipo, categoriaId, page, limit }. Devuelve { equipos, meta }
 * @param {object} [filtros]
 */
export function listarEquiposDisponibles(filtros = {}, opciones = {}) {
  return listarEquipos({ ...filtros, estado: 'disponible', activo: true }, opciones)
}
