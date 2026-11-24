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
 * @property {AnalisisPostulacion | null} analisis Análisis del CV con IA; null si la postulación no tiene registro
 * @property {number | null} [posicion] Solo con orden por afinidad: puesto en el ranking (1, 2, 3…), o null si todavía
 *   no tiene puntaje (sin analizar o con error). Esas van al final
 */

/**
 * Estado del análisis del CV con IA (enum EstadoAnalisis del back). Nace PENDIENTE
 * @typedef {'PENDIENTE' | 'COMPLETADO' | 'ERROR'} EstadoAnalisis
 */

/**
 * Análisis del CV con IA de una postulación (AnalisisAdminView del back). `puntaje` (0 a 100) solo viene en COMPLETADO;
 * `error_detalle`, en ERROR. `desactualizado` es true si los requisitos de la vacante cambiaron después del análisis
 * @typedef {object} AnalisisPostulacion
 * @property {EstadoAnalisis} estado
 * @property {number | null} puntaje
 * @property {string | null} resumen_experiencia
 * @property {string | null} justificacion
 * @property {string | null} error_detalle
 * @property {string | null} modelo
 * @property {string | null} analizado_en
 * @property {boolean} desactualizado
 */

/**
 * Orden de la bandeja (query `orden` del back). 'afinidad' es el ranking por puntaje y exige una vacante elegida
 * @typedef {'recientes' | 'afinidad'} OrdenPostulaciones
 */

/**
 * Filtros de la bandeja. null o '' es "Todas" / "Todos": ese parámetro no viaja
 * @typedef {object} FiltrosPostulaciones
 * @property {number | null} vacanteId
 * @property {EstadoPostulacion | ''} estado
 * @property {OrdenPostulaciones} orden 'afinidad' solo con una vacante elegida; si no, siempre 'recientes'
 */

export {}
