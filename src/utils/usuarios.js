/*
 * Único lugar donde se adapta el formato de los módulos (del usuario y de cada rol).
 * El back los manda como { codigo, puedeEditar } y pasan tal cual; un string suelto ("MAQUINAS"),
 * el formato anterior, se toma como acceso con edición. El resto del front siempre trabaja con objetos.
 */
export function normalizarModulos(modulos) {
  if (!Array.isArray(modulos)) return []
  return modulos.map((modulo) => (typeof modulo === 'string' ? { codigo: modulo, puedeEditar: true } : modulo))
}

// Nombre visible de cada rol del back
const roles = {
  superAdmin: 'Super administrador',
}

// Si el back suma un rol que el front todavía no conoce, se muestra como llega, con mayúscula inicial ("taller" → "Taller")
export function getRolLabel(rol) {
  if (!rol?.nombre) return ''
  return roles[rol.nombre] ?? rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)
}

export function getNombreCompleto(usuario) {
  return [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ')
}

const fechaHora = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// Último acceso legible en hora local ("19/10/2026, 18:15") o "Nunca" si el usuario todavía no entró
export function formatUltimoAcceso(fecha) {
  if (!fecha) return 'Nunca'
  const date = new Date(fecha)
  return Number.isNaN(date.getTime()) ? 'Nunca' : fechaHora.format(date)
}

// Largo mínimo de una contraseña, al crear un usuario y al cambiar la propia (el back acepta 6; el front pide más)
export const MIN_PASSWORD = 8

/*
 * Aviso para un error que no se muestra en el formulario. Devuelve null en los que ya se avisaron solos:
 * 401 cierra la sesión y 403 muestra su propio aviso (los dos los resuelve apiFetch)
 */
export function getErrorGenerico(error) {
  if (error.status === 401 || error.status === 403) return null
  if (error.status === 0) return `${error.message}. Revisá tu conexión e intentá de nuevo.`
  return 'Algo salió mal. Intentá de nuevo en unos minutos.'
}
