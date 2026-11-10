import { equipoComercial } from '../../data/empresa'
import { useVendedores } from '../../hooks/useVendedores'
import SalesRepList from './SalesRepList'
import SectionHeading from './SectionHeading'

// Equipo comercial de la home: una tarjeta por vendedor activo
export default function SalesTeamSection() {
  const { hasEquipo } = useVendedores()

  if (!hasEquipo) return null

  return (
    <section id="equipo" aria-labelledby="equipo-titulo" className="page-section">
      <SectionHeading
        id="equipo-titulo"
        eyebrow="Equipo comercial"
        title={equipoComercial.titulo}
        description={equipoComercial.bajada}
      />
      <div className="mt-10">
        <SalesRepList />
      </div>
    </section>
  )
}
