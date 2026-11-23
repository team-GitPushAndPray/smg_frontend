import { apiFetch, toQuery } from './api'

/**
 * @import {
 *   CanalNotificacion,
 *   FiltrosRegistroNotificaciones,
 *   PruebaNotificacion,
 *   ReglaNotificacion,
 *   ReglaNotificacionDatos,
 *   ReglaNotificacionEdicion,
 *   RegistroNotificacionesPagina,
 * } from '../types/notificaciones'
 */

/*
 * Notificaciones de avisos (M-14): a quién le llega cada tipo de aviso y por qué canal. Ver las reglas y el registro
 * exige el módulo AVISOS; crear, editar y enviar una prueba, además, poder editarlo (403).
 * No hay DELETE: una regla se apaga con actualizarRegla(id, { activo: false }).
 * Errores: 400 si el body no pasa la validación (destino que no corresponde al canal, etiqueta vacía o de más de 60
 * caracteres); 404 si la regla no existe
 */

/**
 * Todas las reglas, activas e inactivas, en el orden del back (por tipo de aviso y después por etiqueta)
 * @returns {Promise<ReglaNotificacion[]>}
 */
export async function listarReglas({ signal } = {}) {
  const reglas = await apiFetch('/notificaciones/reglas', { signal })
  return Array.isArray(reglas) ? reglas : []
}

/**
 * Alta de una regla, de un solo tipo de aviso. Para que un destino reciba los dos tipos se crean dos reglas
 * @param {ReglaNotificacionDatos} datos
 * @returns {Promise<ReglaNotificacion>}
 */
export function crearRegla(datos) {
  return apiFetch('/notificaciones/reglas', { method: 'POST', body: datos })
}

/**
 * Edición y activación / desactivación. `cambios`: solo los campos a modificar. El back valida el destino contra el
 * canal final (el nuevo, o el que ya tenía la regla)
 * @param {number} id
 * @param {ReglaNotificacionEdicion} cambios
 * @returns {Promise<ReglaNotificacion>}
 */
export function actualizarRegla(id, cambios) {
  return apiFetch(`/notificaciones/reglas/${id}`, { method: 'PATCH', body: cambios })
}

/**
 * Manda un mensaje de prueba a un destino. Si el canal lo rechaza (chat inexistente, bot sin acceso al grupo, canal
 * sin configurar en el back), responde 400 con el detalle en `message`, que llega como `error.message`
 * @param {{ canal: CanalNotificacion, destino: string }} datos
 * @returns {Promise<PruebaNotificacion>}
 */
export function enviarPrueba(datos) {
  return apiFetch('/notificaciones/prueba', { method: 'POST', body: datos })
}

/**
 * Una página del registro de envíos, del más nuevo al más viejo. Sin filtros trae la primera página de 20
 * @param {FiltrosRegistroNotificaciones} [filtros]
 * @returns {Promise<RegistroNotificacionesPagina>}
 */
export async function listarRegistro(filtros = {}, { signal } = {}) {
  const respuesta = await apiFetch(`/notificaciones/registro${toQuery(filtros)}`, { signal })
  return {
    data: Array.isArray(respuesta?.data) ? respuesta.data : [],
    total: Number.isFinite(respuesta?.total) ? respuesta.total : 0,
    page: respuesta?.page ?? filtros.page ?? 1,
    limit: respuesta?.limit ?? filtros.limit ?? 20,
  }
}
