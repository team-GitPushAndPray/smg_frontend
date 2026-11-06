import { ArrowLeft, Building2, CloudOff, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import ClienteDetail, { ClienteDetailSkeleton } from '../../components/admin/ClienteDetail'
import ClienteEstadoDialog from '../../components/admin/ClienteEstadoDialog'
import ClienteFormModal from '../../components/admin/ClienteFormModal'
import HistorialAlquileresCliente from '../../components/admin/HistorialAlquileresCliente'
import PanelMessage from '../../components/admin/PanelMessage'
import { MODULOS, RUTAS_ALQUILERES } from '../../config/rutasPanel'
import { useAlquileresCliente } from '../../hooks/useAlquileresCliente'
import { useCliente } from '../../hooks/useCliente'
import { usePermiso } from '../../hooks/usePermiso'
import { useToast } from '../../hooks/useToast'

/*
 * /admin/alquileres/clientes/:id: datos del cliente, activo o no, con Editar y Desactivar / Reactivar si se puede
 * editar Alquileres. Después de guardar se queda acá y el cliente se vuelve a pedir sin pasar por la carga.
 * Debajo, el historial de alquileres del cliente (todos los estados, el más nuevo arriba); cada uno abre su detalle.
 * El historial se pide a la vez que el cliente, pero solo se muestra cuando el cliente cargó
 */
export default function ClientDetailPage() {
  const { id } = useParams()
  const { puedeEditar } = usePermiso(MODULOS.ALQUILERES)
  const { showToast } = useToast()
  const { status, cliente, retry, reload } = useCliente(id)
  const historial = useAlquileresCliente(id)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEstadoOpen, setIsEstadoOpen] = useState(false)

  // Desde el listado se llega con la página scrolleada: cada cliente se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const onSaved = () => {
    setIsFormOpen(false)
    showToast('Cambios guardados', { tipo: 'exito' })
    reload()
  }

  const onEstadoCambiado = (guardado) => {
    setIsEstadoOpen(false)
    showToast(guardado.activo ? 'Cliente reactivado' : 'Cliente desactivado', { tipo: 'exito' })
    reload()
  }

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando cliente…
        </p>
        <ClienteDetailSkeleton />
      </div>
    )
  } else if (status === 'not-found') {
    content = (
      <PanelMessage
        titleAs="h1"
        icon={Building2}
        title="Cliente no encontrado"
        description="El cliente que buscás no existe. Revisá el enlace o buscalo en el listado."
      >
        <Link to={RUTAS_ALQUILERES.clientes} className="btn-tonal">
          Volver a clientes
        </Link>
      </PanelMessage>
    )
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        titleAs="h1"
        icon={CloudOff}
        title="No pudimos cargar el cliente"
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
      <div className="flex flex-col gap-8">
        <ClienteDetail
          cliente={cliente}
          canEdit={puedeEditar}
          onEdit={() => setIsFormOpen(true)}
          onToggleEstado={() => setIsEstadoOpen(true)}
        />
        <HistorialAlquileresCliente
          status={historial.status}
          alquileres={historial.alquileres}
          onRetry={historial.retry}
        />
      </div>
    )
  }

  return (
    <article className="flex flex-col gap-4">
      <Link
        to={RUTAS_ALQUILERES.clientes}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver a clientes
      </Link>

      {content}

      {isFormOpen && cliente && (
        <ClienteFormModal cliente={cliente} onClose={() => setIsFormOpen(false)} onSaved={onSaved} />
      )}
      {isEstadoOpen && cliente && (
        <ClienteEstadoDialog cliente={cliente} onClose={() => setIsEstadoOpen(false)} onDone={onEstadoCambiado} />
      )}
    </article>
  )
}
