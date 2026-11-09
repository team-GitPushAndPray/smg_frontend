/*
 * Tipos del módulo Avisos (M-12: mantenimiento preventivo y certificaciones), en JSDoc. Salen del contrato de la issue
 * madre del back y de src/avisos (smg_backend). Los campos van tal cual los manda el back, en snake_case.
 *
 * Fechas: `vence_el` es de calendario ('aaaa-mm-dd'; se lee de los primeros 10 caracteres, sin pasarla por new Date(),
 * que la corre un día en Argentina). `atendido_en` y `creado_en` son ISO con hora real.
 * `horas_restantes` y `dias_restantes` los calcula el back al responder: negativo = vencido
 */

/** @typedef {'SERVICIO' | 'CERTIFICACION'} TipoAviso */

/** @typedef {'PENDIENTE' | 'ATENDIDO'} EstadoAviso */

/**
 * Los tres tipos de service (250, 500 y 1000 hs)
 * @typedef {object} EscalonServicio
 * @property {number} id
 * @property {number} horas_intervalo
 * @property {string} nombre "Service 250 hs"
 */

/**
 * Un aviso de GET /avisos ya pasado por adaptarAviso (utils/avisos.js): el back hoy lo manda plano y con `marca` y
 * `modelo` en vez de `nombre`; el adaptador lo deja con esta forma, la del contrato, y `nombre` como "Bobcat 1QA1".
 * Si es SERVICIO viene `servicio` y `certificacion` en null; si es CERTIFICACION, al revés.
 * `atendido_por` en null en un ATENDIDO es un cierre automático (por ejemplo, el service de un hito mayor)
 * @typedef {object} Aviso
 * @property {number} id
 * @property {TipoAviso} tipo
 * @property {EstadoAviso} estado
 * @property {{ id: number, codigo_interno: string, nombre: string, horas_motor_actual: number | null }} maquina
 * @property {{ hito_horas: number, escalon: EscalonServicio, horas_restantes: number } | null} servicio
 * @property {{ vence_el: string, dias_restantes: number } | null} certificacion
 * @property {string | null} nota_atencion
 * @property {{ id: number, nombre: string } | null} atendido_por
 * @property {string | null} atendido_en ISO
 * @property {string} creado_en ISO
 */

/**
 * Filtros de GET /avisos, los dos opcionales
 * @typedef {object} FiltrosAvisos
 * @property {EstadoAviso} [estado]
 * @property {TipoAviso} [tipo]
 */

/**
 * GET /avisos/resumen, para la campanita. `vencidos` es una parte de `pendientes` (los que ya pasaron su hito o su
 * fecha; 0 cuenta como vencido), no un número aparte
 * @typedef {object} ResumenAvisos
 * @property {number} pendientes
 * @property {number} vencidos
 */

export {}
