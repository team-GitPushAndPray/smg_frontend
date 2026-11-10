import { apiFetch } from './api'

/** @import { Vacante, VacanteDatos, VacanteEdicion } from '../types/vacantes' */

/**
 * Vacantes públicas (sin sesión): el back solo devuelve las activas, cada una con
 * { id, titulo, descripcion, requisitos }. Sin vacantes activas responde un array vacío.
 */
export async function getVacantesPublicas({ signal } = {}) {
  const vacantes = await apiFetch('/vacantes/publicas', { auth: false, signal })
  return Array.isArray(vacantes) ? vacantes : []
}

/*
 * Vacantes del panel (módulo POSTULACIONES): ver exige el módulo; el alta y la edición, además, poder editarlo (403).
 * No hay DELETE: una vacante se desactiva con editarVacante(id, { activa: false }) y se activa con { activa: true }.
 * Errores: 400 si el body no pasa la validación (con `message` como lista); 404 si la vacante no existe
 */

/**
 * Todas las vacantes, activas e inactivas, ya ordenadas por el back (primero las activas, después las más nuevas)
 * @returns {Promise<Vacante[]>}
 */
export async function listarVacantes({ signal } = {}) {
  const vacantes = await apiFetch('/vacantes', { signal })
  return Array.isArray(vacantes) ? vacantes : []
}

/**
 * Alta: la vacante nace activa y se publica en "Trabajá con nosotros"
 * @param {VacanteDatos} datos
 * @returns {Promise<Vacante>}
 */
export function crearVacante(datos) {
  return apiFetch('/vacantes', { method: 'POST', body: datos })
}

/**
 * Edición, desactivación y activación. `cambios`: solo los campos a modificar
 * @param {number} id
 * @param {VacanteEdicion} cambios
 * @returns {Promise<Vacante>}
 */
export function editarVacante(id, cambios) {
  return apiFetch(`/vacantes/${id}`, { method: 'PATCH', body: cambios })
}
