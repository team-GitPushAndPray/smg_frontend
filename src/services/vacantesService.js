import { apiFetch } from './api'

/** @import { ResumenVacante, Vacante, VacanteDatos, VacanteEdicion } from '../types/vacantes' */

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

/*
 * Resumen de la vacante para gerencia (top 3, comparación y recomendación, generados por IA). Ver exige el módulo
 * POSTULACIONES; generar, además, poder editarlo (403). Errores: 404 si la vacante no existe
 */

/**
 * Último resumen guardado de la vacante, o null si todavía no se generó ninguno
 * @param {number} vacanteId
 * @returns {Promise<ResumenVacante | null>}
 */
export async function getResumenVacante(vacanteId, { signal } = {}) {
  const resumen = await apiFetch(`/vacantes/${vacanteId}/resumen-ia`, { signal })
  return resumen ?? null
}

/**
 * Genera (o regenera) el resumen con los análisis completados de la vacante y lo devuelve ya guardado. Puede tardar
 * unos segundos. Errores: 400 si la vacante no tiene postulaciones analizadas (con el motivo en `message`); 429 si se
 * alcanzó el límite de consultas de la IA; 502, 503 o 504 si la IA falló, no está configurada o tardó demasiado
 * @param {number} vacanteId
 * @returns {Promise<ResumenVacante>}
 */
export function generarResumenVacante(vacanteId) {
  return apiFetch(`/vacantes/${vacanteId}/resumen-ia`, { method: 'POST' })
}
