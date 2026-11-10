/*
 * Tipos de las postulaciones del panel (M-13: Postulaciones), en JSDoc. Salen de src/postulaciones del back
 * (PostulacionAdminEntity y FilterPostulacionesDto). Los campos van tal cual los manda el back, en snake_case.
 * `creado_en` y `actualizado_en` son ISO con hora real
 */

/**
 * Estado de una postulación (enum EstadoPostulacion del back). Nace NUEVO
 * @typedef {'NUEVO' | 'EN_REVISION' | 'CONTACTADO' | 'DESCARTADO'} EstadoPostulacion
 */

/**
 * Una postulación de GET /postulaciones (bandeja) y GET /postulaciones/:id (ficha), con su vacante anidada
 * @typedef {object} Postulacion
 * @property {number} id
 * @property {number} vacante_id
 * @property {string} nombre
 * @property {string} apellido
 * @property {string} email
 * @property {string} telefono
 * @property {string | null} mensaje
 * @property {string} cv_url
 * @property {string} cv_nombre_original
 * @property {EstadoPostulacion} estado
 * @property {string} creado_en
 * @property {string} actualizado_en
 * @property {{ id: number, titulo: string, activa: boolean }} vacante
 */

/**
 * Filtros de la bandeja. null o '' es "Todas" / "Todos": ese parámetro no viaja
 * @typedef {object} FiltrosPostulaciones
 * @property {number | null} vacanteId
 * @property {EstadoPostulacion | ''} estado
 */

export {}
