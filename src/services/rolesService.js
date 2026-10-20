import { normalizarModulos } from '../utils/usuarios'
import { apiFetch } from './api'

/*
 * Roles del panel y sus permisos por módulo (módulo configuración). No existe DELETE: la baja es `activo = false`.
 * Errores: 409 si el nombre ya existe (POST/PATCH). En el PUT de módulos, 400 por códigos duplicados,
 * rol de sistema o body inválido, y 400 o 404 por un módulo inexistente.
 */

// Roles con { id, nombre, descripcion, activo, esSistema, modulos }. `esSistema` marca al superAdmin,
// que llega con `modulos: []` aunque tiene acceso a todo
export async function listarRoles({ signal } = {}) {
  const roles = await apiFetch('/roles', { signal })
  return Array.isArray(roles) ? roles.map((rol) => ({ ...rol, modulos: normalizarModulos(rol.modulos) })) : []
}

// Módulos del sistema como { id, codigo, nombre }: son las columnas de la matriz de permisos
export async function listarModulos({ signal } = {}) {
  const modulos = await apiFetch('/modulos', { signal })
  return Array.isArray(modulos) ? modulos : []
}

// `datos`: { nombre, descripcion? }
export function crearRol(datos) {
  return apiFetch('/roles', { method: 'POST', body: datos })
}

// `cambios`: solo los campos a modificar ({ nombre?, descripcion?, activo? }). `descripcion: null` la borra
export function editarRol(id, cambios) {
  return apiFetch(`/roles/${id}`, { method: 'PATCH', body: cambios })
}

// Reemplaza la lista completa de módulos del rol: los que no vienen en `modulos` quedan sin acceso
export function guardarModulosRol(id, modulos) {
  return apiFetch(`/roles/${id}/modulos`, { method: 'PUT', body: { modulos } })
}
