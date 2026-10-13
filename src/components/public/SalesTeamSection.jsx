import { CloudOff, RotateCw } from 'lucide-react'
import { equipoComercial } from '../../data/empresa'
import { useVendedores } from '../../hooks/useVendedores'
import CatalogMessage from './CatalogMessage'
import SalesRepCard, { SalesRepCardSkeleton } from './SalesRepCard'
import SectionHeading from './SectionHeading'

const SKELETON_COUNT = 3
const gridClass = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

// Equipo comercial: una tarjeta por vendedor activo, en el orden que define el back
export default function SalesTeamSection() {
  const { status, vendedores, hasEquipo, retry } = useVendedores()

  if (!hasEquipo) return null

  let content
  if (status === 'loading') {
    content = (
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
  } else if (status === 'error') {
    content = (
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
  } else {
    content = (
      <ul className={gridClass}>
        {vendedores.map((vendedor) => (
          <SalesRepCard
            key={vendedor.id}
            nombre={vendedor.nombre}
            cargo={vendedor.cargo}
            descripcion={vendedor.descripcion}
            foto={vendedor.foto}
            contacto={vendedor.contacto}
          />
        ))}
      </ul>
    )
  }

  return (
    <section id="equipo" aria-labelledby="equipo-titulo" className="page-section">
      <SectionHeading
        id="equipo-titulo"
        eyebrow="Equipo comercial"
        title={equipoComercial.titulo}
        description={equipoComercial.bajada}
      />
      <div className="mt-10">{content}</div>
    </section>
  )
}
