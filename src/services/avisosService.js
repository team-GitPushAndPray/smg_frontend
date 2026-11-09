import { adaptarAviso } from '../utils/avisos'
import { apiFetch, toQuery } from './api'

/** @import { Aviso, FiltrosAvisos } from '../types/avisos' */

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
