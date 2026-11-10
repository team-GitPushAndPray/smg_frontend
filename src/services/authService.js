import { normalizarModulos } from '../utils/usuarios'
import { apiFetch } from './api'

/*
 * Inicio de sesión: devuelve el token de acceso.
 * Va sin token y su 401 no cierra la sesión: el back responde 401 tanto para un mail inexistente
 * como para una contraseña incorrecta o un usuario inactivo, y eso se muestra en el formulario.
 */
export async function postLogin(email, password) {
  const { accessToken } = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  return accessToken
}

// Usuario de la sesión actual, con los módulos ya normalizados. 401 si el token venció o el usuario fue dado de baja
export async function getMe({ signal } = {}) {
  const usuario = await apiFetch('/auth/me', { signal })
  return { ...usuario, modulos: normalizarModulos(usuario?.modulos) }
}

// Cambio de la contraseña propia. 204 sin body; 400 si la actual no es correcta o el body no pasa la validación
export async function cambiarPassword(passwordActual, passwordNueva) {
  await apiFetch('/auth/password', {
    method: 'PATCH',
    body: { passwordActual, passwordNueva },
  })
}
