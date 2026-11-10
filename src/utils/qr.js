/*
 * QR de un equipo: lleva a /c/<qr_token>, el checklist de campo. El mismo link se graba en las etiquetas NFC
 */
export function getUrlChecklist(qrToken) {
  return `${window.location.origin}/c/${qrToken}`
}

// Nivel de corrección: M aguanta una etiqueta algo sucia o rayada sin agrandar demasiado el QR
export const NIVEL_QR = 'M'

/*
 * Etiqueta para imprimir: cuadrada para que entre justa en 5 × 5 cm, con 1800 px de lado (unos 900 dpi a ese tamaño,
 * así también queda nítida si se imprime más grande). Va en negro puro sobre blanco, el máximo contraste para la
 * cámara y para impresoras en blanco y negro; el borde gris claro es la guía de corte
 */
const LADO = 1800
export const LADO_QR = 1140
const MARGEN_QR = 150
const ANCHO_TEXTO = LADO - 2 * MARGEN_QR
const COLOR_TEXTO = '#000000'
const COLOR_FONDO = '#ffffff'
const COLOR_CORTE = '#d4d4d8'

// Fuente en px que hace entrar el texto en el ancho (un código interno largo se achica en vez de cortarse)
function ajustarFuente(ctx, texto, { peso, tamano, familia }) {
  let actual = tamano
  ctx.font = `${peso} ${actual}px ${familia}`
  while (actual > 24 && ctx.measureText(texto).width > ANCHO_TEXTO) {
    actual -= 4
    ctx.font = `${peso} ${actual}px ${familia}`
  }
}

/*
 * Dibuja la etiqueta completa: el QR (el canvas de QRCodeCanvas, de LADO_QR px y sin margen), el código interno
 * grande y la indicación. Usa la misma fuente que la página
 */
export function dibujarEtiqueta(qrCanvas, codigoInterno) {
  const canvas = document.createElement('canvas')
  canvas.width = LADO
  canvas.height = LADO
  const ctx = canvas.getContext('2d')
  const familia = getComputedStyle(document.body).fontFamily

  ctx.fillStyle = COLOR_FONDO
  ctx.fillRect(0, 0, LADO, LADO)
  ctx.strokeStyle = COLOR_CORTE
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.roundRect(3, 3, LADO - 6, LADO - 6, 72)
  ctx.stroke()

  // El canvas del QR viene escalado por el devicePixelRatio: se lleva a LADO_QR sin suavizar los módulos
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(qrCanvas, (LADO - LADO_QR) / 2, MARGEN_QR, LADO_QR, LADO_QR)

  ctx.fillStyle = COLOR_TEXTO
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ajustarFuente(ctx, codigoInterno, { peso: 700, tamano: 170, familia })
  ctx.fillText(codigoInterno, LADO / 2, MARGEN_QR + LADO_QR + 150)

  const indicacion = 'Escaneá para hacer el checklist'
  ajustarFuente(ctx, indicacion, { peso: 500, tamano: 72, familia })
  ctx.fillText(indicacion, LADO / 2, MARGEN_QR + LADO_QR + 300)

  return canvas
}

// Descarga la etiqueta como PNG ("qr-EXC-001.png"). Rechaza si el navegador no pudo generar la imagen
export function descargarEtiqueta(qrCanvas, codigoInterno) {
  const canvas = dibujarEtiqueta(qrCanvas, codigoInterno)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo generar el PNG'))
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-${codigoInterno.replace(/[^\w-]+/g, '_')}.png`
      link.click()
      // Se libera después: revocarla en el mismo momento corta la descarga en algunos navegadores
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      resolve()
    }, 'image/png')
  })
}
