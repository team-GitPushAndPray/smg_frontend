import { ChevronRight, CircleAlert, TriangleAlert } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useChecklist } from '../../../hooks/useChecklist'
import {
  getAyudaObservaciones,
  getItemsAnormales,
  LARGO_NOMBRE,
  MAX_OBSERVACIONES,
  textoAvisoAnormales,
  validarNombre,
} from '../../../utils/checklists'
import FieldScreen from '../FieldScreen'
import MainAction from '../MainAction'
import ProvisionalNote from './ProvisionalNote'

/*
 * Nombre o apellido del responsable: con mayúscula automática y el teclado de nombres. "Muy corto" se muestra al
 * salir del input (o de entrada, si vuelve del borrador), para no marcar error con la primera letra
 */
function NombreInput({ ref, label, autoComplete, enterKeyHint, onEnter, value, onChange }) {
  const inputId = useId()
  const errorId = useId()
  const [salioDelInput, setSalioDelInput] = useState(() => value.trim() !== '')
  const validacion = validarNombre(value)

  let error = null
  if (validacion === 'corto' && salioDelInput) error = `Escribí al menos ${LARGO_NOMBRE.min} letras.`
  else if (validacion === 'largo') error = `Escribí hasta ${LARGO_NOMBRE.max} letras.`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-lg font-medium">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        type="text"
        autoCapitalize="words"
        autoComplete={autoComplete}
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint={enterKeyHint}
        maxLength={LARGO_NOMBRE.max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setSalioDelInput(true)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          event.preventDefault()
          onEnter(event.currentTarget)
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className="campo-input text-lg"
      />
      <p id={errorId} aria-live="polite" className="flex items-start gap-2 font-medium text-brand-700">
        {error && (
          <>
            <CircleAlert size={22} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0" />
            {error}
          </>
        )}
      </p>
    </div>
  )
}

// Qué falta del responsable, para el botón principal deshabilitado
function textoFaltaResponsable(nombreOk, apellidoOk) {
  if (!nombreOk && !apellidoOk) return 'Completá tu nombre y apellido'
  return nombreOk ? 'Completá tu apellido' : 'Completá tu nombre'
}

/*
 * Último paso: observaciones (opcionales), fotos y quién hizo la revisión. Si hay ítems Anormales y las observaciones
 * están vacías, un aviso pide contar qué les pasa, sin frenar. Sin nombre y apellido no se avanza.
 * Todo va a los datos del asistente y, con ellos, al borrador
 */
export default function CierreStep({ header }) {
  const { opcion, datos, actualizarDatos } = useChecklist()
  const observacionesId = useId()
  const ayudaId = useId()
  const contadorId = useId()
  const responsableId = useId()
  const apellidoRef = useRef(null)

  const anormales = getItemsAnormales(opcion?.items ?? [], datos.respuestas)
  const mostrarAviso = anormales.length > 0 && datos.observaciones.trim() === ''
  const nombreOk = validarNombre(datos.nombre) === 'ok'
  const apellidoOk = validarNombre(datos.apellido) === 'ok'

  // Provisorio: la revisión y el envío llegan en su issue; las fotos (F-27) también van a ser obligatorias
  const accion =
    nombreOk && apellidoOk ? (
      <MainAction label="Revisar y enviar" icon={ChevronRight} />
    ) : (
      <MainAction label={textoFaltaResponsable(nombreOk, apellidoOk)} disabled />
    )

  return (
    <FieldScreen header={header} footer={accion}>
      <h1 className="text-2xl font-semibold text-balance">Terminá y enviá</h1>

      <section className="flex flex-col gap-2">
        <label htmlFor={observacionesId} className="text-lg font-medium">
          Observaciones <span className="font-normal text-neutral-700">(opcional)</span>
        </label>
        <p id={ayudaId} className="text-pretty text-neutral-700">
          {getAyudaObservaciones(opcion?.tipo)}
        </p>
        <textarea
          id={observacionesId}
          rows={5}
          maxLength={MAX_OBSERVACIONES}
          value={datos.observaciones}
          onChange={(event) => actualizarDatos({ observaciones: event.target.value })}
          aria-describedby={`${ayudaId} ${contadorId}`}
          className="campo-input block resize-y py-3"
        />
        <p id={contadorId} className="self-end text-neutral-700 tabular-nums">
          {datos.observaciones.length}/{MAX_OBSERVACIONES}
        </p>

        {mostrarAviso && (
          <p role="status" className="campo-card flex items-start gap-3 border-brand-200 bg-brand-50 p-4 text-pretty">
            <TriangleAlert size={22} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700" />
            {textoAvisoAnormales(anormales)}
          </p>
        )}
      </section>

      <section aria-label="Fotos">
        <ProvisionalNote>Acá vas a sumar las fotos.</ProvisionalNote>
      </section>

      <section aria-labelledby={responsableId} className="flex flex-col gap-3">
        <h2 id={responsableId} className="text-xl font-semibold text-balance">
          ¿Quién hizo la revisión?
        </h2>
        {/* "Siguiente" del teclado pasa al apellido; en el apellido, lo cierra */}
        <NombreInput
          label="Nombre"
          autoComplete="given-name"
          enterKeyHint="next"
          onEnter={() => apellidoRef.current?.focus()}
          value={datos.nombre}
          onChange={(nombre) => actualizarDatos({ nombre })}
        />
        <NombreInput
          ref={apellidoRef}
          label="Apellido"
          autoComplete="family-name"
          enterKeyHint="done"
          onEnter={(input) => input.blur()}
          value={datos.apellido}
          onChange={(apellido) => actualizarDatos({ apellido })}
        />
      </section>
    </FieldScreen>
  )
}
