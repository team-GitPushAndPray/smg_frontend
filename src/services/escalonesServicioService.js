import { apiFetch } from './api'

/** @import { EscalonServicioDetalle } from '../types/avisos' */

/*
 * Tipos de service (250, 500 y 1000 hs) de la pestaña Servicios de Máquinas: ver exige el módulo MAQUINAS; editar la
 * descripción, además, poder editarlo. Los tipos son fijos: no hay alta ni baja, y el back nunca cambia horas ni nombre
 */

/**
 * Los tres tipos de service, ordenados por horas de menor a mayor (los ordena el back)
 * @returns {Promise<EscalonServicioDetalle[]>}
 */
export async function listarEscalonesServicio({ signal } = {}) {
  const respuesta = await apiFetch('/escalones-servicio', { signal })
  return Array.isArray(respuesta) ? respuesta : []
}

/**
 * Cambia la descripción de un tipo de service. Viaja solo `descripcion`: el back la recorta, la exige y admite hasta
 * 500 caracteres. Devuelve el tipo actualizado.
 * Errores: 400 descripción vacía o muy larga; 404 el tipo no existe
 * @param {number} id
 * @param {string} descripcion
 * @returns {Promise<EscalonServicioDetalle>}
 */
export function actualizarDescripcionEscalon(id, descripcion) {
  return apiFetch(`/escalones-servicio/${id}`, { method: 'PATCH', body: { descripcion } })
}
