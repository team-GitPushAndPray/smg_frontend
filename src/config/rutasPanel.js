import { Settings, Shield, Truck, Users } from 'lucide-react'

/*
 * Única fuente de verdad del panel de gestión: el sidebar, las tarjetas de Inicio y las rutas protegidas
 * se arman recorriendo RUTAS_PANEL, filtrado según los módulos del rol del usuario.
 */

// Códigos de módulo: son el contrato con el back (llegan en MAYÚSCULAS). Si cambian, se tocan solo acá
export const MODULOS = Object.freeze({
  MAQUINAS: 'MAQUINAS',
  CONFIGURACION: 'CONFIGURACION',
  VENDEDORES: 'VENDEDORES',
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

// Pantallas del módulo Máquinas: las usan el router y los enlaces entre ellas. El inventario es la sección de RUTAS_PANEL
export const RUTAS_MAQUINAS = Object.freeze({
  inventario: '/admin/maquinas',
  nuevo: '/admin/maquinas/nuevo',
  detalle: (id) => `/admin/maquinas/${id}`,
  editar: (id) => `/admin/maquinas/${id}/editar`,
})

// Ícono del encabezado de cada grupo del sidebar
export const ICONOS_GRUPO = {
  Configuración: Settings,
}
