import { ArrowLeft, ClipboardCheck, CloudOff, PackageX, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import HistorialHeader, { HistorialSkeleton } from '../../components/admin/HistorialHeader'
import HistorialTabs from '../../components/admin/HistorialTabs'
import PanelMessage from '../../components/admin/PanelMessage'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'
import { useEquipo } from '../../hooks/useEquipo'
import { obtenerEquipo } from '../../services/equiposService'
import { getPestanaHistorial, PARAM_PESTANA } from '../../utils/historial'

// Contenido de una pestaña cuyo módulo todavía no existe (Alquileres, Mantenimiento)
function PestanaPendiente({ pestana }) {
  return (
    <PanelMessage
      icon={pestana.Icon}
      title={`Historial de ${pestana.label.toLowerCase()}`}
      description={`Disponible cuando se implemente el módulo de ${pestana.pendiente}.`}
    />
  )
}

/*
 * Historial de un equipo (/admin/maquinas/:id/historial), activo o dado de baja. Es de solo lectura: no hay ningún
 * botón de editar ni de borrar. La pestaña activa va en la URL (?tab=checklists) y reemplaza la entrada del
 * historial del navegador: sobrevive a recargar y "atrás" lleva a la pantalla anterior, no a la pestaña anterior.
 * Alquileres y Mantenimiento muestran un estado vacío hasta que existan sus módulos (M-08 y M-10)
 */
export default function MachineHistoryPage() {
  const { id } = useParams()
  const { status, equipo, retry } = useEquipo(id, obtenerEquipo)
  const [searchParams, setSearchParams] = useSearchParams()
  const pestana = getPestanaHistorial(searchParams.get(PARAM_PESTANA))

  const cambiarPestana = (nueva) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set(PARAM_PESTANA, nueva)
        return next
      },
      { replace: true },
    )
  }

  // Desde el inventario se llega con la página scrolleada: cada equipo se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando historial…
        </p>
        <HistorialSkeleton />
      </div>
    )
  } else if (status === 'not-found') {
    content = (
      <PanelMessage
        titleAs="h1"
        icon={PackageX}
        title="Equipo no encontrado"
        description="El equipo que buscás no existe en el inventario. Revisá el enlace o buscalo en el listado."
      >
        <Link to={RUTAS_MAQUINAS.inventario} className="btn-tonal">
          Volver al inventario
        </Link>
      </PanelMessage>
    )
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        titleAs="h1"
        icon={CloudOff}
        title="No pudimos cargar el historial"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else {
    content = (
      <>
        <HistorialHeader equipo={equipo} />
        <HistorialTabs activa={pestana.id} onCambiar={cambiarPestana}>
          {pestana.pendiente ? (
            <PestanaPendiente pestana={pestana} />
          ) : (
            // Provisorio: el listado de checklists con filtros llega en la próxima issue de M-07
            <PanelMessage
              icon={ClipboardCheck}
              title="Checklists del equipo"
              description="Acá vas a ver los checklists cargados desde el QR del equipo."
            />
          )}
        </HistorialTabs>
      </>
    )
  }

  return (
    <article className="flex flex-col gap-4 sm:gap-6">
      <Link
        to={RUTAS_MAQUINAS.inventario}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver al inventario
      </Link>

      {content}
    </article>
  )
}
