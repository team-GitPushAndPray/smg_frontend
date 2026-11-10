// Nombre visible de cada valor del enum CargoVendedor del back
const cargos = {
  LOGISTICA: 'Logística',
  VENTAS: 'Ventas',
  ALQUILERES: 'Alquileres',
  REPUESTOS: 'Repuestos',
}

// Si el back suma un cargo que el front todavía no conoce, se muestra capitalizado ("POSVENTA" = "Posventa")
export function getCargoLabel(cargo) {
  if (!cargo) return ''
  return cargos[cargo] ?? cargo.charAt(0) + cargo.slice(1).toLowerCase()
}

// Iniciales del nombre y del apellido, para el avatar cuando no hay foto
export function getIniciales(nombre) {
  const palabras = String(nombre ?? '').trim().split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return ''
  const primera = palabras[0][0]
  const ultima = palabras.length > 1 ? palabras.at(-1)[0] : ''
  return `${primera}${ultima}`.toUpperCase()
}

/*
 * Enlace de WhatsApp a partir de un teléfono escrito a mano (contacto del admin, teléfono de un postulante).
 * Normalización simple: solo los dígitos y sin los 0 del principio ("0299…", "0054…"); a un número local
 * ("2996225551") se le agrega 54 (Argentina) + 9 (celular), y uno que ya empieza con 54 se usa tal cual.
 * Es un mejor esfuerzo: un número escrito con el 15 queda mal armado. Sin dígitos devuelve null.
 */
export function getWhatsappUrl(contacto, mensaje) {
  let numero = String(contacto ?? '').replace(/\D/g, '').replace(/^0+/, '')
  if (!numero) return null
  if (!numero.startsWith('54')) numero = `549${numero}`

  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''
  return `https://wa.me/${numero}${texto}`
}
