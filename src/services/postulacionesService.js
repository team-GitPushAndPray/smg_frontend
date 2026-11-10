import { apiFetch, toQuery } from './api'

/** @import { EstadoPostulacion, FiltrosPostulaciones, Postulacion } from '../types/postulaciones' */

/*
 * Envía una postulación a una vacante (ruta pública, sin sesión), en multipart: los datos ya validados y con trim,
 * el CV en el campo `cv` y el honeypot `website` tal como quedó en el formulario (vacío salvo que lo complete un bot:
 * en ese caso el back responde 201 y la descarta). El back guarda la postulación con estado NUEVO.
 * Un 400 avisa datos o archivo inválidos o una vacante que ya no está activa, y un 413 un CV de más de 4 MB (error.status)
 */
export async function enviarPostulacion({ vacanteId, datos, website, cv }) {
  const body = new FormData()
  body.append('vacante_id', String(vacanteId))
  body.append('nombre', datos.nombre)
  body.append('apellido', datos.apellido)
  body.append('email', datos.email)
  body.append('telefono', datos.telefono)
  // Vacío o con solo espacios, el back lo toma como no enviado
  body.append('mensaje', datos.mensaje)
  body.append('website', website)
  body.append('cv', cv)

  await apiFetch('/postulaciones', { method: 'POST', auth: false, body })
}

/*
 * Bandeja del panel (módulo POSTULACIONES, solo ver). Los filtros son opcionales y se combinan; "Todas" / "Todos"
 * (null o '') no viajan. Un filtro inválido responde 400
 */

/**
 * Postulaciones recibidas, ya ordenadas por el back de la más nueva a la más vieja (no se reordena)
 * @param {FiltrosPostulaciones} filtros
 * @returns {Promise<Postulacion[]>}
 */
export async function listarPostulaciones({ vacanteId, estado }, { signal } = {}) {
  const postulaciones = await apiFetch(`/postulaciones${toQuery({ vacante_id: vacanteId, estado })}`, { signal })
  return Array.isArray(postulaciones) ? postulaciones : []
}

/*
 * Ficha del postulante (módulo POSTULACIONES). Ver exige el módulo; cambiar el estado, además, poder editarlo (403).
 * Un id inexistente responde 404 y uno que no es un número, 400
 */

/**
 * Una postulación con su vacante, el link al CV (cv_url) y el nombre original del archivo
 * @param {number | string} id
 * @returns {Promise<Postulacion>}
 */
export function obtenerPostulacion(id, { signal } = {}) {
  return apiFetch(`/postulaciones/${id}`, { signal })
}

/**
 * Cambia el estado de una postulación (a cualquier otro, sin un orden obligado) y devuelve el registro actualizado.
 * 400 si el estado no es válido
 * @param {number} id
 * @param {EstadoPostulacion} estado
 * @returns {Promise<Postulacion>}
 */
export function cambiarEstadoPostulacion(id, estado) {
  return apiFetch(`/postulaciones/${id}/estado`, { method: 'PATCH', body: { estado } })
}
