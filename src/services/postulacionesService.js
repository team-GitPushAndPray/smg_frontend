import { apiFetch } from './api'

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
