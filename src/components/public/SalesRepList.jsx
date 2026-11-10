import { CloudOff, RotateCw } from 'lucide-react'
import { useVendedores } from '../../hooks/useVendedores'
import CatalogMessage from './CatalogMessage'
import SalesRepCard, { SalesRepCardSkeleton } from './SalesRepCard'

const SKELETON_COUNT = 3
const gridClass = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

/*
 * Grilla del equipo comercial con sus estados de carga y error, en el orden que define el back.
 * La usan la sección de la home y el detalle de un equipo; `mensaje` cambia el WhatsApp precargado.
 * Quien la usa decide si se muestra: sin vendedores activos (`hasEquipo`) no tiene sentido.
 */
export default function SalesRepList({ mensaje }) {
  const { status, vendedores, retry } = useVendedores()

  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando equipo comercial…
        </p>
        <ul className={gridClass}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <SalesRepCardSkeleton key={index} />
          ))}
        </ul>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <CatalogMessage
        role="alert"
        titleAs="h3"
        icon={CloudOff}
        title="No pudimos cargar el equipo comercial"
        description="Revisá tu conexión e intentá de nuevo en unos segundos."
      >
        <button type="button" onClick={retry} className="btn-primary">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </CatalogMessage>
    )
  }

  return (
    <ul className={gridClass}>
      {vendedores.map((vendedor) => (
        <SalesRepCard
          key={vendedor.id}
          nombre={vendedor.nombre}
          cargo={vendedor.cargo}
          descripcion={vendedor.descripcion}
          foto={vendedor.foto}
          contacto={vendedor.contacto}
          mensaje={mensaje}
        />
      ))}
    </ul>
  )
}
