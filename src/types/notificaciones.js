/*
 * Tipos de las notificaciones de avisos (M-14), en JSDoc. Salen de src/notificaciones (smg_backend): reglas de a quién
 * se le avisa y por qué canal, el envío de prueba y el registro de envíos. Los campos van tal cual los manda el back,
 * en snake_case. Ver y listar exige el módulo AVISOS; crear, editar y probar, además, poder editarlo (403)
 */

/** @import { TipoAviso } from './avisos' */

/**
 * Canales que acepta el back. WhatsApp se muestra en el front como "No disponible", pero no viaja nunca
 * @typedef {'TELEGRAM' | 'EMAIL'} CanalNotificacion
 */

/** @typedef {'PROXIMO' | 'VENCIDO'} EtapaNotificacion */

/** @typedef {'ENVIADO' | 'ERROR'} EstadoEnvio */

/**
 * Una regla de GET /notificaciones/reglas: los avisos de `tipo_aviso` le llegan a `destino` por `canal`. Cada regla es
 * de un solo tipo. `destino` es un chat_id (entero, puede ser negativo) en Telegram o una dirección de correo en Email.
 * Las inactivas no reciben avisos
 * @typedef {object} ReglaNotificacion
 * @property {number} id
 * @property {TipoAviso} tipo_aviso
 * @property {CanalNotificacion} canal
 * @property {string} destino
 * @property {string} etiqueta "Grupo Taller", hasta 60 caracteres
 * @property {boolean} activo
 * @property {string} creado_en ISO
 */

/**
 * Body de POST /notificaciones/reglas. `activo` es opcional: sin él, la regla nace activa
 * @typedef {object} ReglaNotificacionDatos
 * @property {TipoAviso} tipo_aviso
 * @property {CanalNotificacion} canal
 * @property {string} destino
 * @property {string} etiqueta
 * @property {boolean} [activo]
 */

/**
 * Body de PATCH /notificaciones/reglas/:id: solo los campos que cambian
 * @typedef {Partial<ReglaNotificacionDatos>} ReglaNotificacionEdicion
 */

/**
 * Respuesta de POST /notificaciones/prueba cuando el mensaje salió. Si no salió, el back responde 400 con el detalle
 * del canal en `message` (por ejemplo, "Bad Request: chat not found" de Telegram o "Canal no configurado")
 * @typedef {object} PruebaNotificacion
 * @property {true} ok
 * @property {CanalNotificacion} canal
 * @property {string} destino
 * @property {string} mensaje
 */

/**
 * Un envío de GET /notificaciones/registro: cada mensaje que salió (o intentó salir) por una regla.
 * `regla_etiqueta` es null si la regla ya no existe; `error_detalle`, null si se envió bien
 * @typedef {object} RegistroNotificacion
 * @property {number} id
 * @property {string} enviado_en ISO
 * @property {EtapaNotificacion} etapa
 * @property {CanalNotificacion} canal
 * @property {string} destino
 * @property {string} mensaje
 * @property {EstadoEnvio} estado
 * @property {string | null} error_detalle
 * @property {{ tipo: TipoAviso }} aviso
 * @property {{ codigo: string, nombre: string }} maquina
 * @property {string | null} regla_etiqueta
 */

/**
 * Filtros de GET /notificaciones/registro, todos opcionales. `page` arranca en 1; `limit`, hasta 100 (20 por defecto)
 * @typedef {object} FiltrosRegistroNotificaciones
 * @property {EstadoEnvio} [estado]
 * @property {CanalNotificacion} [canal]
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * Una página del registro, del envío más nuevo al más viejo
 * @typedef {object} RegistroNotificacionesPagina
 * @property {RegistroNotificacion[]} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 */

export {}
