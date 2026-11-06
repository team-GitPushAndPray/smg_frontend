import { useState } from 'react'
import UbicacionInput from '../../components/admin/UbicacionInput'
import { validarUbicacion } from '../../utils/ubicacion'

const UBICACION_VACIA = { latitud: null, longitud: null, ubicacion_referencia: '' }

/*
 * /admin/alquileres/nuevo (requiere editar Alquileres): alta de un alquiler. Provisorio hasta su issue: por ahora solo
 * monta UbicacionInput aislado (sin endpoint) y muestra lo que le entregaría al formulario, para probarlo
 */
export default function RentalFormPage() {
  const [ubicacion, setUbicacion] = useState(UBICACION_VACIA)
  const [mostrarErrores, setMostrarErrores] = useState(false)
  const [resultado, setResultado] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()
    setMostrarErrores(true)
    const completa = Object.keys(validarUbicacion(ubicacion)).length === 0
    setResultado(completa ? 'La ubicación está completa.' : 'Faltan datos de la ubicación.')
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Nuevo alquiler</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Cliente, equipos, fechas y ubicación de la obra. Por ahora solo está la ubicación, para probarla.
        </p>
      </header>

      <form onSubmit={onSubmit} noValidate className="glass flex max-w-2xl flex-col gap-6 p-5 sm:p-7">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Ubicación de la obra</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Donde se entregan los equipos. Pegá lo que te pasaron por WhatsApp o lo que copiaste de Google Maps.
          </p>
        </div>

        <UbicacionInput value={ubicacion} onChange={setUbicacion} mostrarErrores={mostrarErrores} />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Lo que recibe el formulario</p>
          <pre className="overflow-x-auto rounded-control bg-black/5 px-3.5 py-3 font-mono text-sm text-neutral-800 dark:bg-white/10 dark:text-neutral-200">
            {JSON.stringify(ubicacion, null, 2)}
          </pre>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className="text-sm text-neutral-700 dark:text-neutral-300">
            {resultado}
          </p>
          <button type="submit" className="btn-primary">
            Validar ubicación
          </button>
        </div>
      </form>
    </section>
  )
}
