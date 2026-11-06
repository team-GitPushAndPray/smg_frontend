/*
 * Tipos del módulo Alquileres (M-08), en JSDoc: el proyecto es JavaScript, así que no se compilan, pero VS Code los
 * usa para autocompletar y avisar. Se importan con `@import` o `import('../types/alquileres').Tipo`.
 *
 * Salen de los DTOs y services del back (smg_backend, rama staging: src/clientes y src/alquileres). Los campos van
 * tal cual los manda el back, en snake_case (a diferencia de Máquinas, cuyo back los pasa a camelCase).
 *
 * Fechas: las de calendario (fecha_inicio, fecha_fin_prevista) se mandan como 'aaaa-mm-dd', pero el back las devuelve
 * como ISO a medianoche UTC ('2026-11-06T00:00:00.000Z'). Para mostrarlas hay que tomar los primeros 10 caracteres:
 * pasarlas por `new Date()` las corre un día para atrás en Argentina (UTC-3).
 * Los timestamps (creado_en, actualizado_en, fecha de un checklist) son ISO con hora real.
 */

// ── Enums ────────────────────────────────────────────────────────────────────

/** @typedef {'PENDIENTE' | 'ACTIVO' | 'FINALIZADO' | 'ANULADO'} EstadoAlquiler */

/** @typedef {'ENTREGA' | 'DEVOLUCION'} TipoChecklistAlquiler */

/** @typedef {'MAQUINA' | 'ADITAMENTO'} TipoEquipoAlquiler */

/** @typedef {'NORMAL' | 'ANORMAL' | 'NO_APLICA'} EstadoItemChecklist */

// ── Clientes ─────────────────────────────────────────────────────────────────

/**
 * Cliente tal cual lo devuelven GET /clientes (lista, sin paginar, por razón social), POST y PATCH /clientes/:id.
 * No se borra: se desactiva con PATCH { activo: false }.
 * @typedef {object} Cliente
 * @property {number} id
 * @property {string} razon_social
 * @property {string | null} cuit Único entre clientes (409 si se repite)
 * @property {string | null} contacto_nombre
 * @property {string | null} telefono
 * @property {string | null} email
 * @property {string | null} direccion
 * @property {string | null} localidad
 * @property {string | null} observaciones
 * @property {boolean} activo
 * @property {string} creado_en ISO
 * @property {string} actualizado_en ISO
 */

/**
 * GET /clientes/:id: el cliente con la cantidad de alquileres que tiene (de cualquier estado)
 * @typedef {Cliente & { _count: { alquileres: number } }} ClienteDetalle
 */

/**
 * Filtros de GET /clientes. `q` busca en la razón social, sin distinguir mayúsculas
 * @typedef {object} FiltrosClientes
 * @property {string} [q]
 * @property {boolean} [activo]
 */

/**
 * Body de POST /clientes. Solo la razón social es obligatoria; el back recorta espacios y descarta los textos vacíos.
 * Hoy el DTO del alta no acepta contacto_nombre, localidad ni observaciones (400 si viajan)
 * @typedef {object} ClienteAlta
 * @property {string} razon_social Máx. 150
 * @property {string} [cuit] Máx. 20
 * @property {string} [email] Formato de email, máx. 150
 * @property {string} [telefono] Máx. 50
 * @property {string} [direccion] Máx. 255
 */

/**
 * Body de PATCH /clientes/:id: solo los campos a cambiar. `activo` desactiva o reactiva al cliente
 * @typedef {Partial<ClienteAlta> & { activo?: boolean }} ClienteEdicion
 */

// ── Alquileres ───────────────────────────────────────────────────────────────

/**
 * Equipo de un alquiler en el listado
 * @typedef {object} AlquilerListadoEquipo
 * @property {number} id Id del equipo
 * @property {string} codigo_interno
 * @property {string | null} categoria Nombre de la categoría
 */

/**
 * Fila de GET /alquileres (lista, sin paginar). Orden: por fecha_fin_prevista ascendente con `por_vencer`; si no, del
 * más nuevo al más viejo. `entregados` y `devueltos` cuentan los equipos con checklist de entrega / devolución
 * @typedef {object} AlquilerListado
 * @property {number} id
 * @property {EstadoAlquiler} estado
 * @property {string} fecha_inicio
 * @property {string} fecha_fin_prevista
 * @property {number} latitud
 * @property {number} longitud
 * @property {string} ubicacion_referencia
 * @property {{ id: number, razon_social: string }} cliente
 * @property {AlquilerListadoEquipo[]} equipos
 * @property {number} entregados
 * @property {number} devueltos
 */

/**
 * Filtros de GET /alquileres. `estado` admite varios (viajan separados por coma). `por_vencer` trae solo ACTIVOS que
 * vencen en 7 días o menos, incluidos los ya vencidos, e ignora `estado`
 * @typedef {object} FiltrosAlquileres
 * @property {EstadoAlquiler | EstadoAlquiler[]} [estado]
 * @property {number} [cliente_id]
 * @property {number} [equipo_id]
 * @property {boolean} [por_vencer]
 */

/**
 * Checklist de entrega o devolución ya hecho, en el detalle. El responsable es el usuario que lo cargó
 * @typedef {object} ChecklistAlquilerResumen
 * @property {number} checklist_id
 * @property {string} fecha ISO
 * @property {string} responsable_nombre
 * @property {string} responsable_apellido
 * @property {number | null} horas_motor null en aditamentos
 */

/**
 * Equipo de un alquiler en el detalle, con sus checklists (null mientras no se hicieron)
 * @typedef {object} AlquilerEquipo
 * @property {number} id Id del equipo
 * @property {string} codigo_interno
 * @property {string | null} categoria Nombre de la categoría
 * @property {string | null} marca
 * @property {TipoEquipoAlquiler} tipo
 * @property {ChecklistAlquilerResumen | null} entrega
 * @property {ChecklistAlquilerResumen | null} devolucion
 */

/**
 * GET /alquileres/:id
 * @typedef {object} AlquilerDetalle
 * @property {number} id
 * @property {EstadoAlquiler} estado
 * @property {string} fecha_inicio
 * @property {string} fecha_fin_prevista
 * @property {number} latitud
 * @property {number} longitud
 * @property {string} ubicacion_referencia
 * @property {string | null} contacto_obra_nombre
 * @property {string | null} contacto_obra_telefono
 * @property {string | null} observaciones
 * @property {string | null} motivo_anulacion Solo en ANULADO
 * @property {string} creado_en ISO
 * @property {string} actualizado_en ISO
 * @property {Cliente} cliente Completo
 * @property {{ nombre: string, apellido: string }} creado_por
 * @property {AlquilerEquipo[]} equipos
 */

/**
 * Lo que devuelven POST /alquileres, PATCH /alquileres/:id, POST /alquileres/:id/anular y el POST de un checklist:
 * la fila del alquiler con el cliente resumido y los vínculos con sus equipos (cada uno con el equipo completo, tal
 * cual la tabla). No tiene la forma del detalle: para mostrar el alquiler actualizado se vuelve a pedir el detalle
 * @typedef {object} Alquiler
 * @property {number} id
 * @property {number} cliente_id
 * @property {number} usuario_id Quien lo dio de alta
 * @property {EstadoAlquiler} estado
 * @property {string} fecha_inicio
 * @property {string} fecha_fin_prevista
 * @property {number} latitud
 * @property {number} longitud
 * @property {string} ubicacion_referencia
 * @property {string | null} contacto_obra_nombre
 * @property {string | null} contacto_obra_telefono
 * @property {string | null} observaciones
 * @property {string | null} motivo_anulacion
 * @property {string} creado_en ISO
 * @property {string} actualizado_en ISO
 * @property {{ id: number, razon_social: string }} cliente
 * @property {Array<{ id: number, alquiler_id: number, equipo_id: number, checklist_entrega_id: number | null, checklist_devolucion_id: number | null, equipo: object }>} equipos
 */

/**
 * Body de POST /alquileres. El cliente tiene que estar activo y los equipos activos y disponibles (si no, 409). Crea el
 * alquiler en PENDIENTE y pasa los equipos a "alquilado"
 * @typedef {object} AlquilerAlta
 * @property {number} cliente_id
 * @property {number[]} equipo_ids Al menos uno, sin repetidos
 * @property {string} fecha_inicio 'aaaa-mm-dd'
 * @property {string} fecha_fin_prevista 'aaaa-mm-dd', igual o posterior al inicio
 * @property {number} latitud -90 a 90
 * @property {number} longitud -180 a 180
 * @property {string} ubicacion_referencia Obligatoria, máx. 255
 * @property {string | null} [contacto_obra_nombre] Máx. 100
 * @property {string | null} [contacto_obra_telefono] Máx. 50
 * @property {string | null} [observaciones]
 */

/**
 * Body de PATCH /alquileres/:id (prórroga y ubicación), solo en PENDIENTE o ACTIVO (si no, 409). Solo los campos a
 * cambiar; latitud y longitud viajan juntas. Cualquier otro campo da 400
 * @typedef {object} AlquilerEdicion
 * @property {string} [fecha_fin_prevista] 'aaaa-mm-dd', igual o posterior al inicio
 * @property {number} [latitud]
 * @property {number} [longitud]
 * @property {string} [ubicacion_referencia]
 * @property {string | null} [contacto_obra_nombre]
 * @property {string | null} [contacto_obra_telefono]
 */

// ── Checklist de entrega / devolución ────────────────────────────────────────

/**
 * GET /alquileres/:id/equipos/:equipoId/checklist?tipo=: plantilla que corresponde (máquina o aditamento) y contexto.
 * 404 si el equipo no es del alquiler; 409 si ya tiene ese checklist, si se pide devolución sin entrega o si el
 * alquiler no admite entregas. Los `items[].id` son los `plantilla_item_id` de las respuestas
 * @typedef {object} FormularioChecklistAlquiler
 * @property {{ id: number, nombre: string, tipo: string, items: Array<{ id: number, nombre: string, orden: number }> }} plantilla
 * @property {{ id: number, cliente_razon_social: string, fecha_inicio: string, fecha_fin_prevista: string, ubicacion_referencia: string }} alquiler
 * @property {{ id: number, codigo_interno: string, categoria: string | null, tipo: TipoEquipoAlquiler, horas_motor_actual: number | null }} equipo
 */

/**
 * `datos` del POST del checklist (viaja como JSON dentro del multipart). El responsable no se manda: el back usa el
 * usuario de la sesión
 * @typedef {object} DatosChecklistAlquiler
 * @property {number | null} [horas_motor] Solo máquinas; entero, no menor a las actuales
 * @property {string | null} [observaciones] Máx. 1000
 * @property {Array<{ plantilla_item_id: number, estado: EstadoItemChecklist }>} respuestas
 */

export {}
