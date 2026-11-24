/*
 * Tipos de las vacantes (M-13: Postulaciones), en JSDoc. Salen de src/vacantes del back (VacantePrivadaEntity y los
 * DTO de alta y edición). Los campos van tal cual los manda el back, en snake_case.
 * `creado_en` y `actualizado_en` son ISO con hora real
 */

/**
 * Una vacante de GET /vacantes (panel): activas e inactivas, con el conteo de postulaciones recibidas
 * @typedef {object} Vacante
 * @property {number} id
 * @property {string} titulo
 * @property {string} descripcion
 * @property {string} requisitos
 * @property {boolean} activa
 * @property {number} cantidad_postulaciones
 * @property {string} creado_en
 * @property {string} actualizado_en
 */

/**
 * Datos del formulario de alta y edición, ya con trim. POST /vacantes los recibe todos (la vacante nace activa)
 * @typedef {object} VacanteDatos
 * @property {string} titulo
 * @property {string} descripcion
 * @property {string} requisitos
 */

/**
 * Body de PATCH /vacantes/:id: solo los campos que cambian. Activar o desactivar manda únicamente `activa`
 * @typedef {Partial<VacanteDatos> & { activa?: boolean }} VacanteEdicion
 */

/**
 * Un candidato del top del resumen con IA (TopCandidatoResumenView del back). `nombre` y `puntaje` son los actuales de
 * la postulación (no los del momento en que se generó); `puntaje` es null si hoy no tiene un análisis con puntaje
 * @typedef {object} TopCandidatoResumen
 * @property {number} posicion 1, 2 o 3
 * @property {number} postulacion_id
 * @property {string} nombre
 * @property {number | null} puntaje
 * @property {string} motivo
 */

/**
 * Resumen de una vacante para gerencia (ResumenVacanteEntity del back), de GET y POST /vacantes/:id/resumen-ia.
 * `generado_en` es ISO con hora real. `desactualizado` es true si después de generarlo hubo análisis nuevos en la
 * vacante o cambiaron sus requisitos
 * @typedef {object} ResumenVacante
 * @property {number} vacante_id
 * @property {TopCandidatoResumen[]} top
 * @property {string} comparacion
 * @property {string} recomendacion
 * @property {number} cantidad_analizadas
 * @property {string} modelo
 * @property {string} generado_en
 * @property {boolean} desactualizado
 */

export {}
