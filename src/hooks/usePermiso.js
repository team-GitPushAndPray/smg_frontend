import { useAuth } from './useAuth'

/*
 * Nivel de acceso del usuario sobre un módulo, leído de los módulos de /auth/me ({ codigo, puedeEditar }).
 * `codigo` sale siempre de MODULOS (config/rutasPanel.js). El superAdmin recibe todos los módulos con edición
 */
export function usePermiso(codigo) {
  const { tieneModulo, puedeEditar } = useAuth()
  return { puedeVer: tieneModulo(codigo), puedeEditar: puedeEditar(codigo) }
}
