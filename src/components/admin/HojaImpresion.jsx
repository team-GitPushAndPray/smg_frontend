import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Si una foto tarda más que esto, se imprime igual: el diálogo no puede quedar esperando para siempre
const ESPERA_MAXIMA_IMAGENES = 15000

// Se resuelve cuando todas las imágenes de la hoja terminaron de cargar o fallaron (una rota no frena la impresión)
function esperarImagenes(contenedor) {
  const pendientes = [...contenedor.querySelectorAll('img')]
    .filter((img) => !img.complete)
    .map(
      (img) =>
        new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true })
          img.addEventListener('error', resolve, { once: true })
        }),
    )
  const tope = new Promise((resolve) => setTimeout(resolve, ESPERA_MAXIMA_IMAGENES))
  return Promise.race([Promise.all(pendientes), tope])
}

const siguienteCuadro = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

/*
 * Hoja para imprimir o guardar como PDF con el diálogo del navegador: se arma en un portal directo en <body> (en
 * pantalla no se ve; al imprimir oculta todo lo demás, ver .hoja-impresion en index.css), espera a que carguen sus
 * fotos y abre el diálogo. El PDF se genera en el navegador y se guarda en la computadora: no se sube nada al back.
 * Mientras se imprime, el título de la pestaña pasa a `titulo`, que el navegador propone como nombre del archivo.
 * Al cerrar el diálogo (afterprint) vuelve el título y llama a `onTerminar`, que desmonta la hoja
 */
export default function HojaImpresion({ titulo, onTerminar, children }) {
  const hojaRef = useRef(null)
  const onTerminarRef = useRef(onTerminar)

  useEffect(() => {
    onTerminarRef.current = onTerminar
  })

  useEffect(() => {
    let cancelado = false
    const tituloAnterior = document.title

    const terminar = () => {
      document.title = tituloAnterior
      onTerminarRef.current()
    }

    const imprimir = async () => {
      await esperarImagenes(hojaRef.current)
      await document.fonts?.ready
      await siguienteCuadro()
      // En desarrollo, StrictMode monta dos veces: solo imprime la que quedó montada
      if (cancelado) return
      document.title = titulo
      window.addEventListener('afterprint', terminar, { once: true })
      window.print()
    }

    imprimir()

    return () => {
      cancelado = true
      window.removeEventListener('afterprint', terminar)
      document.title = tituloAnterior
    }
  }, [titulo])

  return createPortal(
    <div ref={hojaRef} className="hoja-impresion impresion-hoja">
      {children}
    </div>,
    document.body,
  )
}
