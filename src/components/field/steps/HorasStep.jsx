import { ChevronRight, CircleAlert, Gauge } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useChecklist } from '../../../hooks/useChecklist'
import { formatUltimaCargaHoras, SALTO_HORAS_A_CONFIRMAR, validarHoras } from '../../../utils/checklists'
import { formatHoras } from '../../../utils/equipos'
import FieldDialog from '../FieldDialog'
import FieldScreen from '../FieldScreen'
import MainAction from '../MainAction'

/*
 * Paso de horas del motor (solo máquinas): las horas del equipo son el dato que se vende, así que el paso cuida el
 * error de tipeo. Menos que las actuales no deja avanzar; un salto de más de SALTO_HORAS_A_CONFIRMAR pregunta
 * antes de seguir, sin bloquear. Lo escrito va a los datos del asistente y, con ellos, al borrador
 */
export default function HorasStep({ header }) {
  const { equipo, datos, actualizarDatos, avanzar } = useChecklist()
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const corregirRef = useRef(null)
  // Un valor que vuelve del borrador ya está escrito del todo: su error se muestra de entrada
  const [salioDelInput, setSalioDelInput] = useState(() => datos.horas.trim() !== '')

  const actuales = equipo.horasMotorActual
  const ultimaCarga = formatUltimaCargaHoras(equipo)
  const validacion = validarHoras(datos.horas, actuales)

  // "215" camino a "2150" todavía no es un error: el de menor se muestra con los dígitos completos o al salir del input
  const digitosActuales = String(Math.trunc(actuales ?? 0)).length
  const mostrarMenor =
    validacion.estado === 'menor' && (datos.horas.trim().length >= digitosActuales || salioDelInput)

  let error = null
  if (validacion.estado === 'no-entero') error = 'Escribí solo números, sin puntos ni comas.'
  else if (mostrarMenor) error = `No puede ser menor a ${formatHoras(actuales)}`

  const siguiente = () => {
    if (validacion.estado !== 'ok') return
    if (validacion.salto <= SALTO_HORAS_A_CONFIRMAR) {
      avanzar()
      return
    }
    // El foco arranca en "Corregir", la opción segura
    dialogRef.current.showModal()
    corregirRef.current.focus()
  }

  const confirmar = () => {
    dialogRef.current.close()
    avanzar()
  }

  // Vuelve al input con lo escrito seleccionado, para reescribirlo de una
  const corregir = () => {
    dialogRef.current.close()
    inputRef.current.focus()
    inputRef.current.select()
  }

  const accion =
    validacion.estado === 'ok' ? (
      <MainAction label="Siguiente" icon={ChevronRight} onClick={siguiente} />
    ) : (
      <MainAction label={validacion.estado === 'vacio' ? 'Escribí las horas' : 'Revisá las horas'} disabled />
    )

  return (
    <FieldScreen header={header} footer={accion}>
      <section aria-label="Referencia" className="campo-card flex items-center gap-3 p-4 text-neutral-700">
        <Gauge size={22} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        {ultimaCarga ? (
          <p>
            Última carga: <span className="font-semibold text-black">{ultimaCarga}</span>
          </p>
        ) : (
          <p>Todavía no tiene horas cargadas.</p>
        )}
      </section>

      {/* Con el "Ir" del teclado también se avanza */}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          siguiente()
        }}
        className="flex flex-col gap-3"
      >
        <h1 className="text-2xl font-semibold text-balance">
          <label htmlFor={inputId}>¿Cuántas horas marca el horómetro?</label>
        </h1>
        <div className="relative">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            enterKeyHint="next"
            maxLength={7}
            autoFocus
            value={datos.horas}
            onChange={(event) => actualizarDatos({ horas: event.target.value })}
            onBlur={() => setSalioDelInput(true)}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className="campo-input pr-16 text-3xl font-semibold tabular-nums"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xl font-medium text-neutral-600"
          >
            hs
          </span>
        </div>
        <p id={errorId} aria-live="polite" className="flex items-start gap-2 font-medium text-brand-700">
          {error && (
            <>
              <CircleAlert size={22} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0" />
              {error}
            </>
          )}
        </p>
      </form>

      <FieldDialog
        ref={dialogRef}
        title={`Son ${formatHoras(validacion.salto ?? 0)} hs más que la última carga. ¿Está bien?`}
        description={`Escribiste ${formatHoras(validacion.horas ?? 0)} hs y la última carga fue de ${formatHoras(actuales ?? 0)} hs.`}
        onCancel={(event) => {
          event.preventDefault()
          corregir()
        }}
      >
        <button type="button" className="campo-btn-primary" onClick={confirmar}>
          Sí, es correcto
        </button>
        <button ref={corregirRef} type="button" className="campo-btn-secondary" onClick={corregir}>
          Corregir
        </button>
      </FieldDialog>
    </FieldScreen>
  )
}
