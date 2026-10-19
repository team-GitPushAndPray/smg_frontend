import { apiFetch } from './api'

/*
 * ABM de usuarios del panel (módulo configuración). No existe DELETE: la baja es siempre `activo = false`.
 * Errores: 409 si el email ya está registrado; 400 si el body es inválido o el usuario intenta darse de baja a sí mismo.
 */

// Cada usuario llega con su rol como { id, nombre }
export async function listarUsuarios({ signal } = {}) {
  const usuarios = await apiFetch('/usuarios', { signal })
  return Array.isArray(usuarios) ? usuarios : []
}

// `datos`: { nombre, apellido, email, telefono?, password, rolId }
export function crearUsuario(datos) {
  return apiFetch('/usuarios', { method: 'POST', body: datos })
}

// `cambios`: solo los campos a modificar ({ nombre?, apellido?, email?, telefono?, rolId? }). `telefono: null` lo borra
export function editarUsuario(id, cambios) {
  return apiFetch(`/usuarios/${id}`, { method: 'PATCH', body: cambios })
}

export function cambiarEstado(id, activo) {
  return apiFetch(`/usuarios/${id}/estado`, { method: 'PATCH', body: { activo } })
}

// Roles con { id, nombre, descripcion, activo, esSistema, modulos }. `esSistema` marca al superAdmin
export async function listarRoles({ signal } = {}) {
  const roles = await apiFetch('/roles', { signal })
  return Array.isArray(roles) ? roles : []
}
