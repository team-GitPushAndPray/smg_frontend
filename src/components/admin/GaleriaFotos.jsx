import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { getUrlFoto, TRANSFORMACION_FOTO } from '../../utils/historial'
import VisorFotos from './VisorFotos'

/*
 * Galería de las fotos de un checklist: miniaturas cuadradas pedidas ya achicadas a Cloudinary (w_300) y, al hacer
 * clic, el visor a pantalla completa en esa foto. Las miniaturas cargan a medida que se ven (loading="lazy").
 * Si una miniatura no carga, queda el lugar con un ícono y se puede abrir igual: el visor ofrece la original
 */
export default function GaleriaFotos({ fotos }) {
  const [abierta, setAbierta] = useState(null)
  const [fallidas, setFallidas] = useState(() => new Set())
  const total = fotos.length

  const marcarFallida = (id) => setFallidas((actuales) => new Set(actuales).add(id))

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {fotos.map((foto, index) => (
          <li key={foto.id ?? foto.url}>
            <button
              type="button"
              onClick={() => setAbierta(index)}
              aria-label={`Ampliar la foto ${index + 1} de ${total}`}
              className="interactive group grid aspect-square w-full place-items-center overflow-hidden rounded-control bg-black/5 text-neutral-500 hover:shadow-(--glass-shadow) dark:bg-white/10 dark:text-neutral-400"
            >
              {fallidas.has(foto.id ?? foto.url) ? (
                <ImageOff size={24} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <img
                  src={getUrlFoto(foto.url, TRANSFORMACION_FOTO.miniatura)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => marcarFallida(foto.id ?? foto.url)}
                  className="ease-glass size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </button>
          </li>
        ))}
      </ul>

      {abierta !== null && <VisorFotos fotos={fotos} inicial={abierta} onClose={() => setAbierta(null)} />}
    </>
  )
}
