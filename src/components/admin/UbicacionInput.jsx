import { ClipboardPaste, ExternalLink, Info, MapPin } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { linkMaps } from '../../utils/alquileres'
import {
  AYUDA_SIN_COORDENADAS,
  interpretarCoordenadas,
  MAX_REFERENCIA,
  textoCoordenadas,
  validarUbicacion,
} from '../../utils/ubicacion'
import { Field } from './FormField'

const AYUDA_INICIAL = 'Copialas de Google Maps o de WhatsApp. También sirve el link completo de Maps.'

// El botón Pegar solo aparece si el navegador deja leer el portapapeles (en celular, además, se puede pegar a mano)
const puedeLeerPortapapeles = typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.readText)

/**
 * Ubicación de un alquiler, para el alta y para "cambiar ubicación". Un solo campo donde se pegan las coordenadas o
 * un link de Google Maps (ver interpretarCoordenadas) y una referencia obligatoria para llegar a la obra.
 *
 * Entrega `{ latitud, longitud, ubicacion_referencia }` en cada cambio: latitud y longitud son números con 6 decimales,
 * o null mientras no se pueda interpretar lo pegado; la referencia va tal cual se escribió (recortarla al armar el
 * body). Para bloquear el envío, el formulario usa validarUbicacion(value) y pasa `mostrarErrores` después del primer
 * intento, así se marcan también los campos vacíos.
 *
 * Lo mal pegado se marca apenas se pega o al salir del campo, no mientras se tipea. El texto del input arranca con la
 * ubicación de `value` (acepta las coordenadas como texto, como las manda el back); para volver a cargarlo, cambiar
 * la `key` del componente
 * @param {{
 *   value: { latitud: number | string | null, longitud: number | string | null, ubicacion_referencia: string },
 *   onChange: (ubicacion: { latitud: number | null, longitud: number | null, ubicacion_referencia: string }) => void,
 *   mostrarErrores?: boolean,
 *   disabled?: boolean,
 * }} props
 */
export default function UbicacionInput({ value, onChange, mostrarErrores = false, disabled = false }) {
  const { showToast } = useToast()
  const id = useId()
  const inputRef = useRef(null)
  const pegando = useRef(false)
  const [texto, setTexto] = useState(() => textoCoordenadas(value))
  // Si lo pegado no se entiende se avisa enseguida; si se está tipeando, recién al salir del campo
  const [marcarFormato, setMarcarFormato] = useState(false)

  const interpretado = interpretarCoordenadas(texto)
  const referencia = value?.ubicacion_referencia ?? ''
  const errores = mostrarErrores
    ? validarUbicacion({ ...coordenadasDe(interpretado), ubicacion_referencia: referencia })
    : {}

  let errorCoordenadas = null
  if (interpretado.estado === 'error' && (marcarFormato || mostrarErrores)) errorCoordenadas = interpretado.mensaje
  else if (interpretado.estado === 'vacio') errorCoordenadas = errores.coordenadas ?? null

  const cambiarTexto = (nuevo, { marcar }) => {
    setTexto(nuevo)
    setMarcarFormato(marcar)
    onChange({ ...coordenadasDe(interpretarCoordenadas(nuevo)), ubicacion_referencia: referencia })
  }

  const onChangeTexto = (event) => {
    cambiarTexto(event.target.value, { marcar: pegando.current })
    pegando.current = false
  }

  const pegarDelPortapapeles = async () => {
    try {
      const pegado = await navigator.clipboard.readText()
      cambiarTexto(pegado.trim(), { marcar: true })
    } catch {
      // Sin permiso o con el portapapeles vacío: queda pegar a mano
      showToast('No se pudo leer el portapapeles. Mantené apretado el campo y elegí Pegar.', { tipo: 'info' })
      inputRef.current?.focus()
    }
  }

  const onChangeReferencia = (event) => {
    onChange({ ...coordenadasDe(interpretado), ubicacion_referencia: event.target.value })
  }

  const errorId = `${id}-error`
  const estadoId = `${id}-estado`
  const describedBy = errorCoordenadas ? errorId : estadoId
  const urlMaps = interpretado.estado === 'ok' ? linkMaps(interpretado.latitud, interpretado.longitud) : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          Coordenadas
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            name="coordenadas"
            type="text"
            value={texto}
            onChange={onChangeTexto}
            onPaste={() => {
              pegando.current = true
            }}
            onBlur={() => setMarcarFormato(true)}
            disabled={disabled}
            placeholder="Pegá las coordenadas"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-invalid={Boolean(errorCoordenadas) || (mostrarErrores && interpretado.estado === 'sin-coordenadas')}
            aria-describedby={describedBy}
            className={`field pl-3.5 ${puedeLeerPortapapeles ? 'pr-12' : 'pr-3.5'}`}
          />
          {puedeLeerPortapapeles && (
            <button
              type="button"
              onClick={pegarDelPortapapeles}
              disabled={disabled}
              aria-label="Pegar del portapapeles"
              title="Pegar del portapapeles"
              className="interactive absolute inset-y-0 right-0 grid w-11 place-items-center rounded-control text-neutral-600 hover:text-brand-700 dark:text-neutral-400 dark:hover:text-brand-300"
            >
              <ClipboardPaste size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>

        {errorCoordenadas ? (
          <p id={errorId} role="alert" className="text-sm text-brand-700 dark:text-brand-400">
            {errorCoordenadas}
          </p>
        ) : (
          <div id={estadoId} aria-live="polite">
            <EstadoCoordenadas interpretado={interpretado} urlMaps={urlMaps} />
          </div>
        )}
      </div>

      <Field name="ubicacion_referencia" label="Referencia" error={errores.ubicacion_referencia}>
        {(props) => (
          <textarea
            {...props}
            value={referencia}
            onChange={onChangeReferencia}
            disabled={disabled}
            rows={2}
            maxLength={MAX_REFERENCIA}
            placeholder="Ej.: Loma Campana, locación 12, entrar por ruta 7 km 30"
            className="field resize-y px-3.5 py-2.5"
          />
        )}
      </Field>
    </div>
  )
}

function coordenadasDe(interpretado) {
  return interpretado.estado === 'ok'
    ? { latitud: interpretado.latitud, longitud: interpretado.longitud }
    : { latitud: null, longitud: null }
}

// Debajo del campo: la ayuda inicial, qué hacer con un link sin coordenadas o las coordenadas leídas con el link a Maps
function EstadoCoordenadas({ interpretado, urlMaps }) {
  if (interpretado.estado === 'sin-coordenadas') {
    return (
      <p className="flex items-start gap-2 rounded-control bg-black/5 px-3.5 py-3 text-sm text-neutral-800 dark:bg-white/10 dark:text-neutral-200">
        <Info size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
        <span>
          Ese link no trae las coordenadas. <strong className="font-medium">{AYUDA_SIN_COORDENADAS}</strong>
        </span>
      </p>
    )
  }

  if (interpretado.estado === 'ok') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="flex items-center gap-1.5 text-sm text-neutral-700 tabular-nums dark:text-neutral-300">
          <MapPin
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="shrink-0 text-brand-700 dark:text-brand-400"
          />
          Lat {interpretado.latitud} · Lng {interpretado.longitud}
        </p>
        {urlMaps && (
          <a href={urlMaps} target="_blank" rel="noopener noreferrer" className="btn-tonal text-sm">
            Verificar en Maps
            <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        )}
      </div>
    )
  }

  return <p className="text-sm text-neutral-600 dark:text-neutral-400">{AYUDA_INICIAL}</p>
}
