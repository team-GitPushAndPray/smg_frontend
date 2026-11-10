import { Bell, BriefcaseBusiness, KeyRound, Settings, Shield, Truck, Users } from 'lucide-react'

/*
 * Única fuente de verdad del panel de gestión: el sidebar, las tarjetas de Inicio y las rutas protegidas
 * se arman recorriendo RUTAS_PANEL, filtrado según los módulos del rol del usuario.
 */

// Códigos de módulo: son el contrato con el back (llegan en MAYÚSCULAS). Si cambian, se tocan solo acá
export const MODULOS = Object.freeze({
  MAQUINAS: 'MAQUINAS',
  CONFIGURACION: 'CONFIGURACION',
  VENDEDORES: 'VENDEDORES',
  ALQUILERES: 'ALQUILERES',
  AVISOS: 'AVISOS',
  POSTULACIONES: 'POSTULACIONES',
})

// Pantallas del módulo Avisos: el centro de avisos es la sección de RUTAS_PANEL y el destino de "Ver todos" de la campanita
export const RUTAS_AVISOS = Object.freeze({
  centro: '/admin/avisos',
})

// Los ítems con `grupo` se muestran juntos en un desplegable del sidebar. `descripcion` es el texto de su tarjeta en Inicio
export const RUTAS_PANEL = [
  {
    path: '/admin/maquinas',
    modulo: MODULOS.MAQUINAS,
    label: 'Máquinas',
    descripcion: 'Alta, edición y estado de la maquinaria.',
    icon: Truck,
  },
  // Un solo ítem para todo el módulo: Alquileres y Clientes son pestañas dentro de él (RUTAS_ALQUILERES)
  {
    path: '/admin/alquileres',
    modulo: MODULOS.ALQUILERES,
    label: 'Alquileres',
    descripcion: 'Alquileres en curso, vencimientos y clientes.',
    icon: KeyRound,
  },
  // Centro de avisos: services y certificaciones, en pestañas Pendientes / Atendidos (?tab=)
  {
    path: RUTAS_AVISOS.centro,
    modulo: MODULOS.AVISOS,
    label: 'Avisos',
    descripcion: 'Services y certificaciones por vencer, vencidos y atendidos.',
    icon: Bell,
  },
  // Búsquedas laborales: pestañas Bandeja (postulaciones recibidas) y Vacantes (?tab=)
  {
    path: '/admin/postulaciones',
    modulo: MODULOS.POSTULACIONES,
    label: 'Postulaciones',
    descripcion: 'Vacantes publicadas en el portal y postulaciones recibidas.',
    icon: BriefcaseBusiness,
  },
  {
    path: '/admin/configuracion/usuarios',
    modulo: MODULOS.CONFIGURACION,
    label: 'Usuarios',
    descripcion: 'Empleados con acceso al panel de gestión.',
    icon: Users,
    grupo: 'Configuración',
  },
  {
    path: '/admin/configuracion/roles',
    modulo: MODULOS.CONFIGURACION,
    label: 'Roles y permisos',
    descripcion: 'Qué módulos puede usar cada rol.',
    icon: Shield,
    grupo: 'Configuración',
  },
]

/*
 * Pantallas del módulo Máquinas: las usan el router, las pestañas y los enlaces entre ellas. El inventario es la
 * sección de RUTAS_PANEL; `servicios` es su otra pestaña (los tres tipos de service con su descripción)
 */
export const RUTAS_MAQUINAS = Object.freeze({
  inventario: '/admin/maquinas',
  servicios: '/admin/maquinas/servicios',
  nuevo: '/admin/maquinas/nuevo',
  detalle: (id) => `/admin/maquinas/${id}`,
  editar: (id) => `/admin/maquinas/${id}/editar`,
  historial: (id) => `/admin/maquinas/${id}/historial`,
  checklist: (id, checklistId) => `/admin/maquinas/${id}/historial/checklists/${checklistId}`,
})

/*
 * Pantallas del módulo Alquileres: las usan el router, las pestañas y los enlaces entre ellas. El listado es la sección
 * de RUTAS_PANEL. `tipo` del checklist: 'ENTREGA' o 'DEVOLUCION' (TIPOS_CHECKLIST_ALQUILER, utils/alquileres.js)
 */
export const RUTAS_ALQUILERES = Object.freeze({
  listado: '/admin/alquileres',
  nuevo: '/admin/alquileres/nuevo',
  detalle: (id) => `/admin/alquileres/${id}`,
  checklist: (id, equipoId, tipo) => `/admin/alquileres/${id}/equipos/${equipoId}/checklist?tipo=${tipo}`,
  clientes: '/admin/alquileres/clientes',
  cliente: (id) => `/admin/alquileres/clientes/${id}`,
})

// Ícono del encabezado de cada grupo del sidebar
export const ICONOS_GRUPO = {
  Configuración: Settings,
}
