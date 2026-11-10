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
