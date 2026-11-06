import { ArrowLeft, CloudOff, KeyRound, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import AlquilerDetail, { AlquilerDetailSkeleton } from '../../components/admin/AlquilerDetail'
import PanelMessage from '../../components/admin/PanelMessage'
import { MODULOS, RUTAS_ALQUILERES } from '../../config/rutasPanel'
import { useAlquiler } from '../../hooks/useAlquiler'
import { usePermiso } from '../../hooks/usePermiso'

/*
 * /admin/alquileres/:id: todo un alquiler en una pantalla (GET /alquileres/:id): datos, cliente y, equipo por equipo,
 * qué ya se entregó, qué ya volvió y qué falta. Con edición en Alquileres y el alquiler en curso, cada equipo tiene
 * "Completar entrega" o "Completar devolución", que llevan a su checklist; sin edición se ve todo, de solo lectura.
 * Si se llega desde el alta, el detalle viene en el state de la navegación y se muestra sin esperar
 */
export default function RentalDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { puedeEditar } = usePermiso(MODULOS.ALQUILERES)
  const { status, alquiler, retry } = useAlquiler(id, location.state?.alquiler ?? null)

  // Fecha contra la que se calcula el vencimiento: la de cuando se abrió la pantalla
  const [hoy] = useState(() => new Date())

  // Desde el listado se llega con la página scrolleada: cada alquiler se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando alquiler…
        </p>
        <AlquilerDetailSkeleton />
      </div>
    )
  } else if (status === 'not-found') {
    content = (
      <PanelMessage
        titleAs="h1"
        icon={KeyRound}
        title="Alquiler no encontrado"
        description="El alquiler que buscás no existe. Revisá el enlace o buscalo en el listado."
      >
        <Link to={RUTAS_ALQUILERES.listado} className="btn-tonal">
          Volver a alquileres
        </Link>
      </PanelMessage>
    )
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        titleAs="h1"
        icon={CloudOff}
        title="No pudimos cargar el alquiler"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else {
    // Prorrogar, Cambiar ubicación y Anular (sub-issue 9) van en `acciones`, en el encabezado del detalle
    content = <AlquilerDetail alquiler={alquiler} puedeEditar={puedeEditar} hoy={hoy} />
  }

  return (
    <article className="flex flex-col gap-4">
      <Link
        to={RUTAS_ALQUILERES.listado}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver a alquileres
      </Link>

      {content}
    </article>
  )
}
