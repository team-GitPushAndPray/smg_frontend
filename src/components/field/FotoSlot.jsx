import { Camera, CircleAlert, LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { COMPRESION_FOTO } from '../../utils/checklists'
import { comprimirImagen } from '../../utils/imagenes'

// Miniatura de la foto cargada. La URL temporal se crea y se libera con la foto, para no dejar memoria ocupada
function Miniatura({ foto }) {
  const imagenRef = useRef(null)

  useEffect(() => {
    const url = URL.createObjectURL(foto)
    imagenRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [foto])

  return (
    <img
      ref={imagenRef}
      alt="Foto del equipo"
      className="aspect-4/3 w-full rounded-card border border-neutral-300 bg-neutral-200 object-cover"
    />
  )
}

/*
 * Un lugar para una foto del checklist. Vacío es un área grande que abre directo la cámara trasera; la foto se
 * comprime al elegirla (mientras tanto dice "Procesando…") y se entrega ya liviana con `onFoto`. Cargado muestra
 * la miniatura con una ✕ para borrarla y "Sacar otra", que la reemplaza. `perdida` avisa que la foto de un
 * borrador retomado no se guardó
 */
export default function FotoSlot({ foto, nombre, perdida, onFoto, onQuitar }) {
  const inputRef = useRef(null)
  const sacarRef = useRef(null)
  const enfocarAlVaciar = useRef(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(false)

  // Al borrarla con la ✕, el foco pasa a "Sacar foto" en vez de perderse con el botón que desaparece
  useEffect(() => {
    if (foto || !enfocarAlVaciar.current) return
    enfocarAlVaciar.current = false
    sacarRef.current?.focus()
  }, [foto])

  const abrirCamara = () => inputRef.current.click()

  const elegirArchivo = async (event) => {
    const archivo = event.target.files?.[0]
    // Vaciarlo deja volver a elegir la misma foto si la anterior falló
    event.target.value = ''
    if (!archivo) return

    setProcesando(true)
    setError(false)
    try {
      onFoto(await comprimirImagen(archivo, { ...COMPRESION_FOTO, nombre }))
    } catch {
      setError(true)
    } finally {
      setProcesando(false)
    }
  }

  const quitar = () => {
    enfocarAlVaciar.current = true
    onQuitar()
  }

  return (
    <div className="flex flex-col gap-3">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={elegirArchivo} />

      <div aria-live="polite" className="empty:hidden">
        {error && (
          <p className="flex items-start gap-2 font-medium text-brand-700">
            <CircleAlert size={22} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0" />
            No se pudo usar la foto. Probá sacarla de nuevo.
          </p>
        )}
        {perdida && !foto && !procesando && !error && (
          <p className="campo-card flex items-start gap-3 border-brand-200 bg-brand-50 p-4 text-pretty">
            <TriangleAlert size={22} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700" />
            Volvé a sacar la foto: no queda guardada si se cierra la página.
          </p>
        )}
      </div>

      {foto && !procesando ? (
        <>
          <div className="relative">
            <Miniatura foto={foto} />
            <button
              type="button"
              onClick={quitar}
              aria-label="Borrar la foto"
              className="interactive absolute top-2 right-2 grid size-12 place-items-center rounded-full border border-neutral-300 bg-white text-black shadow-md hover:border-brand-700"
            >
              <X size={24} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="campo-btn-secondary" onClick={abrirCamara}>
            <Camera size={22} strokeWidth={2} aria-hidden="true" />
            Sacar otra
          </button>
        </>
      ) : (
        <button
          ref={sacarRef}
          type="button"
          className="campo-foto"
          onClick={abrirCamara}
          disabled={procesando}
          aria-busy={procesando}
        >
          {procesando ? (
            <>
              <LoaderCircle
                size={40}
                strokeWidth={1.75}
                aria-hidden="true"
                className="animate-spin text-neutral-700 motion-reduce:animate-none"
              />
              <span className="text-lg font-semibold">Procesando…</span>
            </>
          ) : (
            <>
              <span className="grid size-16 place-items-center rounded-full bg-brand-700 text-white">
                <Camera size={32} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="text-xl font-semibold">Sacar foto</span>
              <span className="text-neutral-700">Foto del equipo (obligatoria)</span>
            </>
          )}
        </button>
      )}

    </div>
  )
}
