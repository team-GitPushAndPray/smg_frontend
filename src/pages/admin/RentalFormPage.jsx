import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import AlquilerForm from '../../components/admin/AlquilerForm'
import { MODULOS, RUTAS_ALQUILERES } from '../../config/rutasPanel'
import { usePermiso } from '../../hooks/usePermiso'

/*
 * /admin/alquileres/nuevo (requiere editar Alquileres): alta de un alquiler en un solo formulario (AlquilerForm).
 * Los equipos salen de GET /equipos, que exige el módulo Máquinas: sin él, el formulario lo explica en vez de pedirlos
 */
export default function RentalFormPage() {
  const { puedeVer: puedeVerMaquinas } = usePermiso(MODULOS.MAQUINAS)

  return (
    <article className="flex max-w-4xl flex-col gap-4">
      <Link
        to={RUTAS_ALQUILERES.listado}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver a alquileres
      </Link>

      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">Nuevo alquiler</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Cliente, equipos, fechas y obra. El alquiler queda pendiente hasta que se entregue el primer equipo.
          </p>
        </header>

        <AlquilerForm puedeVerEquipos={puedeVerMaquinas} />
      </div>
    </article>
  )
}
