import { Settings, Shield, Truck, Users } from 'lucide-react'

/*
 * Única fuente de verdad del panel de gestión: el sidebar se arma recorriendo RUTAS_PANEL
 * (y más adelante se filtra según los módulos del rol).
 */

// Códigos de módulo: son el contrato con el back. Si cambian (por ejemplo a MAYÚSCULAS), se tocan solo acá
export const MODULOS = Object.freeze({
  MAQUINAS: 'maquinas',
  CONFIGURACION: 'configuracion',
})

// Los ítems con `grupo` se muestran juntos en un desplegable del sidebar
export const RUTAS_PANEL = [
  { path: '/admin/maquinas', modulo: MODULOS.MAQUINAS, label: 'Máquinas', icon: Truck },
  {
    path: '/admin/configuracion/usuarios',
    modulo: MODULOS.CONFIGURACION,
    label: 'Usuarios',
    icon: Users,
    grupo: 'Configuración',
  },
  {
    path: '/admin/configuracion/roles',
    modulo: MODULOS.CONFIGURACION,
    label: 'Roles y permisos',
    icon: Shield,
    grupo: 'Configuración',
  },
]

// Ícono del encabezado de cada grupo del sidebar
export const ICONOS_GRUPO = {
  Configuración: Settings,
}
