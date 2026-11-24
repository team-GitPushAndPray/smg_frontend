import { Inbox, ListChecks } from 'lucide-react'
import { formatFechaChecklist } from './historial'
import { getErrorGenerico } from './usuarios'

/** @import { Vacante, VacanteDatos, VacanteEdicion } from '../types/vacantes' */

// Pestañas del módulo Postulaciones. El id es el valor de la URL (?tab=vacantes); la primera es la de por defecto
export const PESTANAS_POSTULACIONES = Object.freeze([
  { id: 'bandeja', label: 'Bandeja', Icon: Inbox },
  { id: 'vacantes', label: 'Vacantes', Icon: ListChecks },
])

// Largos máximos del back: se usan en el maxLength de cada campo y en la validación
export const LIMITES_VACANTE = Object.freeze({
  titulo: 150,
  descripcion: 2000,
  requisitos: 3000,
})

/** @type {VacanteDatos} */
export const VACANTE_VACIA = { titulo: '', descripcion: '', requisitos: '' }

/**
 * Datos que viajan al back, con trim: un campo con solo espacios cuenta como vacío
 * @param {VacanteDatos} values
 * @returns {VacanteDatos}
 */
export function getDatosVacante(values) {
  return {
    titulo: values.titulo.trim(),
    descripcion: values.descripcion.trim(),
    requisitos: values.requisitos.trim(),
  }
}

const MENSAJES = {
  titulo: { vacio: 'Ingresá el título de la vacante.', nombre: 'El título' },
  descripcion: { vacio: 'Ingresá una descripción del puesto.', nombre: 'La descripción' },
  requisitos: { vacio: 'Ingresá los requisitos del puesto.', nombre: 'El texto de requisitos' },
}

/**
 * Errores por campo, en el orden del formulario (el foco va al primero). Los tres son obligatorios.
 * `datos` ya viene con trim (getDatosVacante)
 * @param {VacanteDatos} datos
 * @returns {Partial<Record<keyof VacanteDatos, string>>}
 */
export function validarVacante(datos) {
  const errors = {}
  for (const campo of /** @type {(keyof VacanteDatos)[]} */ (Object.keys(LIMITES_VACANTE))) {
    const { vacio, nombre } = MENSAJES[campo]
    if (!datos[campo]) errors[campo] = vacio
    else if (datos[campo].length > LIMITES_VACANTE[campo]) {
      errors[campo] = `${nombre} puede tener hasta ${LIMITES_VACANTE[campo]} caracteres.`
    }
  }
  return errors
}

/**
 * Body del PATCH al editar: solo los campos que cambiaron (vacío si no cambió nada)
 * @param {VacanteDatos} datos
 * @param {Vacante} vacante
 * @returns {VacanteEdicion}
 */
export function getCambiosVacante(datos, vacante) {
  return Object.fromEntries(Object.entries(datos).filter(([campo, valor]) => valor !== vacante[campo]))
}

// Día de alta de la vacante ("06/11/2026"), en la hora del navegador. "—" si la fecha no sirve
export function formatFechaVacante(iso) {
  return formatFechaChecklist(iso)?.fecha ?? '—'
}

export const VACANTE_INEXISTENTE = 'Esta vacante ya no existe. Actualizamos el listado.'

/*
 * Mensaje simple para un error al guardar o al activar / desactivar, o null si no hay que mostrar nada (401 y 403 ya
 * los avisa apiFetch). Nest manda `message` como lista si falló la validación del DTO y como texto si lo lanzó el
 * servicio: ninguno de los dos se muestra tal cual, para no exponer texto técnico
 */
export function getErrorVacante(error) {
  if (error.status === 404) return VACANTE_INEXISTENTE
  if (error.status === 400) return 'Revisá los datos de la vacante e intentá de nuevo.'
  return getErrorGenerico(error)
}

/*
 * Mensaje para un "Generar resumen" que falló, o null si ya lo avisó apiFetch (401 cierra la sesión y 403 muestra su
 * propio aviso).
 * - 400 (la vacante no tiene postulaciones analizadas) y 429 (límite de consultas de la IA): el mensaje del back, que ya
 *   está escrito para el usuario.
 * - 502, 503 y 504: la IA falló, no está configurada o tardó demasiado. apiFetch los trata como "No se pudo conectar
 *   con el servidor", que acá confundiría: el back respondió, la que no lo hizo fue la IA.
 * - 404: la vacante ya no existe.
 */
export function getErrorResumenVacante(error) {
  const mensajeBack = error.data?.message
  if ((error.status === 400 || error.status === 429) && typeof mensajeBack === 'string') return mensajeBack
  if ([502, 503, 504].includes(error.status)) return 'La IA no pudo generar el resumen. Intentá de nuevo en unos minutos.'
  if (error.status === 404) return 'Esta vacante ya no existe. Recargá la página.'
  const generico = getErrorGenerico(error)
  return generico && `No pudimos generar el resumen. ${generico}`
}

// Puesto en el top del resumen: "1.º", "2.º", "3.º"
export function formatPosicionResumen(posicion) {
  return `${posicion}.º`
}

// "basado en 15 postulaciones analizadas" / "basado en 1 postulación analizada"
export function formatBaseResumen(cantidad) {
  return cantidad === 1
    ? 'basado en 1 postulación analizada'
    : `basado en ${cantidad} postulaciones analizadas`
}

/*
 * Si la card del resumen de la vacante quedó colapsada. Se recuerda en localStorage (una sola para todas las vacantes):
 * quien la cierra para ver la tabla no la vuelve a encontrar abierta al cambiar de vacante. Todo con try/catch: sin
 * acceso a localStorage arranca abierta y no se recuerda
 */
const CLAVE_RESUMEN_COLAPSADO = 'bandeja:resumen-colapsado'

export function leerResumenColapsado() {
  try {
    return localStorage.getItem(CLAVE_RESUMEN_COLAPSADO) === '1'
  } catch {
    return false
  }
}

export function guardarResumenColapsado(colapsado) {
  try {
    if (colapsado) localStorage.setItem(CLAVE_RESUMEN_COLAPSADO, '1')
    else localStorage.removeItem(CLAVE_RESUMEN_COLAPSADO)
  } catch {
    // Sin acceso a localStorage: el estado dura hasta recargar la página
  }
}
