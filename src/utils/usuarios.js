/*
 * Único lugar donde se adapta el formato de los módulos del usuario.
 * Hoy el back los manda como strings ("maquinas"); más adelante llegarán como { codigo, puedeEditar }.
 * El resto del front siempre trabaja con objetos: cuando cambie el back, no hay que tocar nada más.
 */
export function normalizarModulos(modulos) {
  if (!Array.isArray(modulos)) return []
  return modulos.map((modulo) => (typeof modulo === 'string' ? { codigo: modulo, puedeEditar: true } : modulo))
}

// Nombre visible de cada rol del back
const roles = {
  superAdmin: 'Super administrador',
}

// Si el back suma un rol que el front todavía no conoce, se muestra tal cual llega
export function getRolLabel(rol) {
  if (!rol?.nombre) return ''
  return roles[rol.nombre] ?? rol.nombre
}

export function getNombreCompleto(usuario) {
  return [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ')
}
