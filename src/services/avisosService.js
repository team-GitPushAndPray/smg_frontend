import { adaptarAviso } from '../utils/avisos'
import { apiFetch, toQuery } from './api'

/** @import { Aviso, FiltrosAvisos, ResumenAvisos } from '../types/avisos' */

/*
 * Avisos de service y de certificación (M-12): ver exige el módulo AVISOS (403 sin él). Los genera el back (cron
 * diario); el front solo los lista y, con edición en el módulo, los marca como atendidos
 */

/**
 * Avisos que cumplen los filtros, en el orden del back: pendientes primero y, dentro de cada estado, el más urgente
 * arriba (vencidos y después los más cercanos). El front no los reordena. Cada uno pasa por adaptarAviso: el back hoy
 * los manda planos, no con la forma anidada del contrato
 * @param {FiltrosAvisos} [filtros]
 * @returns {Promise<Aviso[]>}
 */
export async function listarAvisos(filtros = {}, { signal } = {}) {
  const respuesta = await apiFetch(`/avisos${toQuery(filtros)}`, { signal })
  return Array.isArray(respuesta) ? respuesta.map(adaptarAviso) : []
}

/**
 * Cuántos avisos hay pendientes y cuántos de ellos ya vencieron, para la campanita. Un número que no vino queda en 0
 * @returns {Promise<ResumenAvisos>}
 */
export async function obtenerResumenAvisos({ signal } = {}) {
  const respuesta = await apiFetch('/avisos/resumen', { signal })
  const contar = (valor) => (Number.isFinite(valor) && valor > 0 ? valor : 0)
  return { pendientes: contar(respuesta?.pendientes), vencidos: contar(respuesta?.vencidos) }
}

/**
 * Marca un aviso PENDIENTE como atendido con una nota (obligatoria; el back la recorta y admite hasta 500
 * caracteres). Requiere edición en Avisos. Si es un service, el back cierra además los services pendientes de la misma
 * máquina con un hito menor (con la nota "Cerrado por el service de X hs"); la respuesta trae solo el aviso atendido.
 * Errores: 400 nota vacía o muy larga; 404 el aviso no existe; 409 ya estaba atendido (otro usuario se adelantó)
 * @param {number} id
 * @param {string} nota
 * @returns {Promise<Aviso>}
 */
export async function atenderAviso(id, nota) {
  const respuesta = await apiFetch(`/avisos/${id}/atender`, { method: 'PATCH', body: { nota } })
  return adaptarAviso(respuesta)
}
