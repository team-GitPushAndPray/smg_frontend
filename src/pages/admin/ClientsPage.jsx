import { Building2, CloudOff, Plus, RotateCw, SearchX } from 'lucide-react'
import { useState } from 'react'
import ClienteFormModal from '../../components/admin/ClienteFormModal'
import ClientesTable, { ClientesTableSkeleton } from '../../components/admin/ClientesTable'
import ClientesToolbar from '../../components/admin/ClientesToolbar'
import PanelMessage from '../../components/admin/PanelMessage'
import PermissionBadge from '../../components/admin/PermissionBadge'
import { MODULOS, RUTAS_ALQUILERES } from '../../config/rutasPanel'
import { useClientes } from '../../hooks/useClientes'
import { useFiltrosClientes } from '../../hooks/useFiltrosClientes'
import { usePermiso } from '../../hooks/usePermiso'
import { useTextoDiferido } from '../../hooks/useTextoDiferido'

// Espera desde la última tecla antes de buscar en el back
const ESPERA_BUSQUEDA_CLIENTES = 300

function countLabel(cantidad) {
  return cantidad === 1 ? '1 cliente' : `${cantidad} clientes`
}

const getHrefCliente = (cliente) => RUTAS_ALQUILERES.cliente(cliente.id)

/*
 * Alquileres › Clientes: todos los clientes con buscador por razón social y filtro de estado (Activos por defecto),
 * ambos en la URL. El back los devuelve ordenados por razón social. Toda la fila abre el detalle.
 * "Nuevo cliente" solo con edición en Alquileres; sin ella, la pantalla es de solo lectura
 */
export default function ClientsPage() {
  const { puedeEditar } = usePermiso(MODULOS.ALQUILERES)
  const { filtros, setFiltros, limpiarFiltros } = useFiltrosClientes()
  const { status, clientes, isLoading, hasData, retry } = useClientes(filtros)
  const busqueda = useTextoDiferido(filtros.q, (q) => setFiltros({ q }), ESPERA_BUSQUEDA_CLIENTES)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const clearFilters = () => {
    busqueda.descartar()
    limpiarFiltros()
  }

  let content
  if (isLoading && !hasData) {
    content = <ClientesTableSkeleton />
  } else if (!isLoading && status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar los clientes"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (clientes.length === 0 && filtros.q) {
    content = (
      <PanelMessage
        icon={SearchX}
        title={`Sin resultados para «${filtros.q}»`}
        description={
          filtros.estado === 'todos'
            ? 'Probá con otra razón social.'
            : 'Probá con otra razón social o cambiá el filtro de estado.'
        }
      >
        <button type="button" onClick={clearFilters} className="btn-tonal">
          Limpiar filtros
        </button>
      </PanelMessage>
    )
  } else if (clientes.length === 0 && filtros.estado === 'activos') {
    content = (
      <PanelMessage
        icon={Building2}
        title="No hay clientes activos"
        description="Los clientes dados de alta van a aparecer acá."
      >
        <button type="button" onClick={() => setFiltros({ estado: 'todos' })} className="btn-tonal">
          Ver todos
        </button>
      </PanelMessage>
    )
  } else if (clientes.length === 0) {
    content = (
      <PanelMessage
        icon={Building2}
        title="No hay clientes"
        description={
          puedeEditar
            ? 'Cargá el primero con «Nuevo cliente» para poder asignarle alquileres.'
            : 'Cuando se carguen clientes, se van a ver acá.'
        }
      />
    )
  } else {
    content = <ClientesTable clientes={clientes} getHref={getHrefCliente} />
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">Clientes</h1>
            {!puedeEditar && <PermissionBadge puedeEditar={false} />}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Empresas a las que se les alquila maquinaria.</p>
        </div>
        {puedeEditar && (
          <button type="button" onClick={() => setIsFormOpen(true)} className="btn-primary shrink-0">
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nuevo cliente
          </button>
        )}
      </header>

      <ClientesToolbar
        query={busqueda.texto}
        onQueryChange={busqueda.cambiar}
        onQueryClear={busqueda.borrar}
        estado={filtros.estado}
        onEstadoChange={(estado) => setFiltros({ estado })}
      />

      <p role="status" className="sr-only">
        {isLoading || !hasData ? 'Cargando clientes…' : `${countLabel(clientes.length)}${filtros.q ? ' encontrados' : ''}`}
      </p>

      {/* Mientras llega la nueva búsqueda se sigue viendo la lista anterior, atenuada */}
      <div
        aria-busy={isLoading}
        className={`transition-opacity duration-200 ease-glass ${isLoading && hasData ? 'pointer-events-none opacity-60' : ''}`}
      >
        {content}
      </div>

      {isFormOpen && <ClienteFormModal onClose={() => setIsFormOpen(false)} />}
    </section>
  )
}
