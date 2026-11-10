import { apiFetch, toQuery } from './api'

/** @import { Cliente, ClienteAlta, ClienteDetalle, ClienteEdicion, FiltrosClientes } from '../types/alquileres' */

/*
 * Clientes del módulo Alquileres (M-08): ver exige el módulo ALQUILERES; alta y edición, además, poder editarlo (403).
 * No hay DELETE: un cliente se desactiva con editarCliente(id, { activo: false }) y se reactiva con { activo: true }.
 * Errores: 400 si el body o los filtros no pasan la validación; 404 si el cliente no existe; 409 si el CUIT ya es de
 * otro cliente
 */

/**
 * Todos los clientes que cumplen los filtros, ordenados por razón social (sin paginar)
 * @param {FiltrosClientes} [filtros]
 * @returns {Promise<Cliente[]>}
 */
export async function listarClientes(filtros, { signal } = {}) {
  const respuesta = await apiFetch(`/clientes${toQuery(filtros)}`, { signal })
  return Array.isArray(respuesta) ? respuesta : []
}

/**
 * @param {number | string} id
 * @returns {Promise<ClienteDetalle>}
 */
export function obtenerCliente(id, { signal } = {}) {
  return apiFetch(`/clientes/${id}`, { signal })
}

/**
 * Alta: el cliente nace activo
 * @param {ClienteAlta} datos
 * @returns {Promise<Cliente>}
 */
export function crearCliente(datos) {
  return apiFetch('/clientes', { method: 'POST', body: datos })
}

/**
 * Edición, desactivación y reactivación. `cambios`: solo los campos a modificar
 * @param {number | string} id
 * @param {ClienteEdicion} cambios
 * @returns {Promise<Cliente>}
 */
export function editarCliente(id, cambios) {
  return apiFetch(`/clientes/${id}`, { method: 'PATCH', body: cambios })
}
