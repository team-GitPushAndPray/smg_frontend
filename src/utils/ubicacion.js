/*
 * Ubicación de un alquiler: interpretar lo que se pega desde Google Maps o WhatsApp y validarlo antes de mandarlo.
 * El back recibe latitud y longitud como números (-90 a 90 y -180 a 180) y una referencia obligatoria de hasta 255
 * caracteres. Al leerlas del back se pasan por `aCoordenada`: si llegan como texto (un Decimal serializado), se
 * convierten a número
 */

export const MAX_REFERENCIA = 255

// Lo que hay que hacer cuando el link no trae coordenadas (los cortos, maps.app.goo.gl, nunca las traen)
export const AYUDA_SIN_COORDENADAS = 'Abrí el link, mantené apretado el punto en el mapa y copiá las coordenadas.'

const ERROR_FORMATO =
  'No se pudieron leer las coordenadas. Pegalas como -38.951234, -68.059876 o pegá el link completo de Google Maps.'
const ERROR_LATITUD = 'La latitud tiene que estar entre -90 y 90.'
const ERROR_LONGITUD = 'La longitud tiene que estar entre -180 y 180.'
const ERROR_SIN_COORDENADAS = 'Pegá las coordenadas de la obra.'
const ERROR_SIN_REFERENCIA = 'Ingresá una referencia para llegar a la obra.'
const ERROR_REFERENCIA_LARGA = `La referencia puede tener hasta ${MAX_REFERENCIA} caracteres.`

const NUMERO = String.raw`[+-]?\d+(?:\.\d+)?`

// "-38.951234, -68.059876", "-38.951234,-68.059876" o "-38.951234 -68.059876"
const PAR = new RegExp(String.raw`^(${NUMERO})\s*(?:,\s*|\s+)(${NUMERO})$`)

// Dentro de un link, en orden de precisión: el punto buscado (?q=, ?query=, ?ll=), el pin de un lugar (!3d…!4d…)
// y, por último, el centro del mapa (@lat,lng), que es lo que aparece en la barra al mover el mapa
const PATRONES_LINK = [
  new RegExp(String.raw`[?&](?:q|query|ll|destination)=(?:loc:)?\s*(${NUMERO})\s*,\s*(${NUMERO})`),
  new RegExp(String.raw`!3d(${NUMERO})!4d(${NUMERO})`),
  new RegExp(String.raw`@(${NUMERO}),(${NUMERO})`),
]

const ES_LINK = /https?:\/\/|\bgoo\.gl\b|\bgoogle\.[a-z.]+\/maps\b|\bmaps\.google\./i

/** Número con 6 decimales (unos 10 cm), sin el -0 */
function redondear(valor) {
  return Number(valor.toFixed(6)) || 0
}

/**
 * Coordenada como número, venga como número o como texto (un Decimal del back llega como "-38.951234"). null si falta
 * o no es un número
 * @param {number | string | null | undefined} valor
 * @returns {number | null}
 */
export function aCoordenada(valor) {
  if (valor == null || valor === '') return null
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

function decodificar(texto) {
  // En los query strings el + es un espacio y la coma suele venir como %2C
  const conEspacios = texto.replace(/\+/g, ' ')
  try {
    return decodeURIComponent(conEspacios)
  } catch {
    return conEspacios
  }
}

function conRango(lat, lng) {
  const latitud = Number(lat)
  const longitud = Number(lng)
  if (latitud < -90 || latitud > 90) return { estado: 'error', mensaje: ERROR_LATITUD }
  if (longitud < -180 || longitud > 180) return { estado: 'error', mensaje: ERROR_LONGITUD }
  return { estado: 'ok', latitud: redondear(latitud), longitud: redondear(longitud) }
}

/**
 * @typedef {{ estado: 'vacio' }
 *   | { estado: 'ok', latitud: number, longitud: number }
 *   | { estado: 'sin-coordenadas' }
 *   | { estado: 'error', mensaje: string }} CoordenadasInterpretadas
 */

/**
 * Saca latitud y longitud de lo que se pegó: el par de números (con coma, con coma y espacio o solo con espacio) o un
 * link largo de Google Maps (?q=lat,lng, !3d…!4d… o @lat,lng). Un link sin coordenadas, como los cortos de
 * maps.app.goo.gl, da 'sin-coordenadas' para mostrar la ayuda en vez de un error. Valida los rangos y redondea a
 * 6 decimales
 * @param {string} texto
 * @returns {CoordenadasInterpretadas}
 */
export function interpretarCoordenadas(texto) {
  // Algunas páginas copian el signo menos como "−" (U+2212) o como guion largo
  const limpio = (texto ?? '').trim().replace(/[−‒–—]/g, '-')
  if (!limpio) return { estado: 'vacio' }

  if (ES_LINK.test(limpio)) {
    const link = decodificar(limpio)
    for (const patron of PATRONES_LINK) {
      const partes = patron.exec(link)
      if (partes) return conRango(partes[1], partes[2])
    }
    return { estado: 'sin-coordenadas' }
  }

  // Coordenadas copiadas entre paréntesis: "(-38.951234, -68.059876)"
  const partes = PAR.exec(limpio.replace(/^\((.*)\)$/, '$1').trim())
  return partes ? conRango(partes[1], partes[2]) : { estado: 'error', mensaje: ERROR_FORMATO }
}

/**
 * Texto con el que arranca el input a partir de una ubicación ya guardada ("-38.951234, -68.059876"), o vacío
 * @param {{ latitud?: number | string | null, longitud?: number | string | null } | null | undefined} ubicacion
 */
export function textoCoordenadas(ubicacion) {
  const latitud = aCoordenada(ubicacion?.latitud)
  const longitud = aCoordenada(ubicacion?.longitud)
  return latitud == null || longitud == null ? '' : `${latitud}, ${longitud}`
}

/**
 * Errores de la ubicación que entrega UbicacionInput, por campo, para bloquear el envío del formulario. Vacío si está
 * completa
 * @param {{ latitud: number | null, longitud: number | null, ubicacion_referencia: string }} ubicacion
 * @returns {{ coordenadas?: string, ubicacion_referencia?: string }}
 */
export function validarUbicacion(ubicacion) {
  const errores = {}
  if (!Number.isFinite(ubicacion?.latitud) || !Number.isFinite(ubicacion?.longitud)) {
    errores.coordenadas = ERROR_SIN_COORDENADAS
  }
  const referencia = (ubicacion?.ubicacion_referencia ?? '').trim()
  if (!referencia) errores.ubicacion_referencia = ERROR_SIN_REFERENCIA
  else if (referencia.length > MAX_REFERENCIA) errores.ubicacion_referencia = ERROR_REFERENCIA_LARGA
  return errores
}
