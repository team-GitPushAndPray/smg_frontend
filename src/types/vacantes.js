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

export {}
