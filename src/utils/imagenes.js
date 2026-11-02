function cargarImagen(url) {
  const imagen = new Image()
  imagen.src = url
  return imagen.decode().then(() => imagen)
}

function canvasAJpeg(canvas, calidad) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))), 'image/jpeg', calidad)
  })
}

/*
 * Achica una imagen en el navegador antes de subirla: el lado mayor queda en `ladoMayor` px (sin agrandar las chicas)
 * y se pasa a JPEG con la primera de `calidades` que quede por debajo de `pesoObjetivo` bytes (si ninguna llega, la
 * última). El navegador ya la gira según la orientación de la cámara (EXIF) al dibujarla. Devuelve un File JPEG
 */
export async function comprimirImagen(archivo, { ladoMayor, calidades, pesoObjetivo, nombre }) {
  const url = URL.createObjectURL(archivo)
  try {
    const imagen = await cargarImagen(url)
    const escala = Math.min(1, ladoMayor / Math.max(imagen.naturalWidth, imagen.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(imagen.naturalWidth * escala)
    canvas.height = Math.round(imagen.naturalHeight * escala)

    // JPEG no tiene transparencia: lo transparente (un PNG) queda blanco y no negro
    const contexto = canvas.getContext('2d')
    contexto.fillStyle = '#fff'
    contexto.fillRect(0, 0, canvas.width, canvas.height)
    contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height)

    let blob
    for (const calidad of calidades) {
      blob = await canvasAJpeg(canvas, calidad)
      if (blob.size <= pesoObjetivo) break
    }
    return new File([blob], nombre, { type: 'image/jpeg', lastModified: Date.now() })
  } finally {
    URL.revokeObjectURL(url)
  }
}
