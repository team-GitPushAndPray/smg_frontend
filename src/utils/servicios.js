import { formatHoras } from './equipos'
import { getErrorGenerico } from './usuarios'

/*
 * Tipos de service de la pestaña Servicios de Máquinas (GET /escalones-servicio)
 */

// Largo máximo de la descripción, como el back
export const MAX_DESCRIPCION_SERVICIO = 500

export const SIN_DESCRIPCION = 'Sin descripción'

export const ERROR_SIN_DESCRIPCION = 'Escribí qué incluye este service.'

export const ERROR_SERVICIO_INEXISTENTE = 'Este tipo de service ya no existe. Actualizamos la lista.'

// Cada cuántas horas de motor toca el service ("Cada 1.000 hs de motor")
export function formatIntervaloServicio(horasIntervalo) {
  return `Cada ${formatHoras(horasIntervalo)} hs de motor`
}

/**
 * Mensaje para un error al guardar la descripción. 400: lo que dice la validación del back (va en el campo).
 * 404: la lista quedó desactualizada. null en 401 y 403, que ya avisó apiFetch
 * @param {{ status?: number, message?: string, data?: any }} error
 * @returns {string | null}
 */
export function getErrorDescripcionServicio(error) {
  if (error.status === 400) {
    const mensajes = error.data?.message
    return Array.isArray(mensajes) ? mensajes.join('. ') : error.message
  }
  if (error.status === 404) return ERROR_SERVICIO_INEXISTENTE
  return getErrorGenerico(error)
}
