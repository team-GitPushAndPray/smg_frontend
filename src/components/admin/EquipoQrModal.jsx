import { Download, Info, Link2 } from 'lucide-react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { useRef } from 'react'
import { useToast } from '../../hooks/useToast'
import { getNombreEquipo } from '../../utils/equipos'
import { descargarEtiqueta, getUrlChecklist, LADO_QR, NIVEL_QR } from '../../utils/qr'
import Modal from './Modal'

const textMuted = 'text-neutral-600 dark:text-neutral-400'

/*
 * QR de un equipo para pegar en la cabina: abre su checklist de campo (/c/<qr_token>). Muestra la etiqueta tal como
 * se imprime (siempre en blanco, también en modo oscuro, porque es la vista previa del papel), con "Descargar PNG"
 * para imprimirla y "Copiar link" para grabar la misma URL en una etiqueta NFC. Es de solo lectura: la ven todos
 * los que entran al módulo, con o sin edición.
 * El PNG sale de un QRCodeCanvas oculto de alta resolución; en pantalla va el SVG, nítido a cualquier tamaño
 */
export default function EquipoQrModal({ equipo, onClose }) {
  const { showToast } = useToast()
  const qrCanvasRef = useRef(null)
  const url = getUrlChecklist(equipo.qr_token)

  const descargar = async () => {
    try {
      await descargarEtiqueta(qrCanvasRef.current, equipo.codigoInterno)
    } catch {
      showToast('No pudimos generar la imagen. Probá de nuevo.')
    }
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copiado.', { tipo: 'exito' })
    } catch {
      // Sin permiso o sin la API (fuera de https): el link está a la vista para copiarlo a mano
      showToast('No pudimos copiar el link. Seleccionalo y copialo a mano.')
    }
  }

  return (
    <Modal
      title="QR del equipo"
      description={`${equipo.codigoInterno} · ${getNombreEquipo(equipo)}`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-5">
        <figure className="mx-auto flex w-full max-w-72 flex-col items-center gap-3 rounded-card border border-neutral-200 bg-white px-6 pt-6 pb-5 text-center text-black dark:border-transparent">
          <QRCodeSVG
            value={url}
            level={NIVEL_QR}
            marginSize={0}
            title={`QR del checklist de ${equipo.codigoInterno}`}
            className="aspect-square h-auto w-full"
          />
          <figcaption className="flex flex-col gap-1">
            <span className="text-3xl font-bold tracking-tight break-all tabular-nums">{equipo.codigoInterno}</span>
            <span className="text-sm font-medium">Escaneá para hacer el checklist</span>
          </figcaption>
        </figure>

        <QRCodeCanvas
          ref={qrCanvasRef}
          value={url}
          level={NIVEL_QR}
          marginSize={0}
          size={LADO_QR}
          aria-hidden="true"
          className="hidden"
        />

        <div className="flex flex-col gap-0.5 rounded-control bg-black/5 px-4 py-3.5 dark:bg-white/5">
          <p className={`text-sm ${textMuted}`}>Link del QR</p>
          <p className="text-sm font-medium break-all text-black select-all dark:text-white">{url}</p>
        </div>

        <p className={`flex items-start gap-2.5 text-sm text-pretty ${textMuted}`}>
          <Info size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          Imprimí el PNG a 5 × 5 cm y pegalo en un lugar visible de la cabina.
        </p>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button type="button" onClick={copiar} className="btn-tonal">
            <Link2 size={18} strokeWidth={1.75} aria-hidden="true" />
            Copiar link
          </button>
          <button type="button" onClick={descargar} className="btn-primary">
            <Download size={18} strokeWidth={1.75} aria-hidden="true" />
            Descargar PNG
          </button>
        </div>
      </div>
    </Modal>
  )
}
