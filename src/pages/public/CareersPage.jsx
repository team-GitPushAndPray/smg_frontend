import { BriefcaseBusiness, CloudOff, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import ApplicationModal from '../../components/public/ApplicationModal'
import CatalogMessage from '../../components/public/CatalogMessage'
import JobOpeningCard, { JobOpeningCardSkeleton } from '../../components/public/JobOpeningCard'
import SectionHeading from '../../components/public/SectionHeading'
import { trabajaConNosotros } from '../../data/empresa'
import { useVacantesPublicas } from '../../hooks/useVacantesPublicas'

const SKELETON_COUNT = 2
const gridClass = 'grid gap-4 lg:grid-cols-2'

function countLabel(cantidad) {
  return cantidad === 1 ? '1 búsqueda abierta' : `${cantidad} búsquedas abiertas`
}

// "Trabajá con nosotros": vacantes activas y postulación con CV, en un modal, a la que se elija
export default function CareersPage() {
  const { status, vacantes, retry, recargar } = useVacantesPublicas()
  const [vacanteElegida, setVacanteElegida] = useState(null)

  // El layout se comparte con la home: al entrar se arranca desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando búsquedas…
        </p>
        <ul className={gridClass}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <JobOpeningCardSkeleton key={index} />
          ))}
        </ul>
      </div>
    )
  } else if (status === 'error') {
    content = (
      <CatalogMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar las búsquedas"
        description="Revisá tu conexión e intentá de nuevo en unos segundos."
      >
        <button type="button" onClick={retry} className="btn-primary">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </CatalogMessage>
    )
  } else if (vacantes.length === 0) {
    content = (
      <CatalogMessage
        icon={BriefcaseBusiness}
        title="Por el momento no hay búsquedas abiertas"
        description="Cada nueva búsqueda se publica en esta página. Volvé a visitarnos más adelante."
      />
    )
  } else {
    content = (
      <>
        <p role="status" className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          {countLabel(vacantes.length)}
        </p>
        <ul className={gridClass}>
          {vacantes.map((vacante) => (
            <JobOpeningCard key={vacante.id} vacante={vacante} onPostularme={setVacanteElegida} />
          ))}
        </ul>
      </>
    )
  }

  return (
    <section aria-labelledby="trabaja-titulo" className="page-container pt-12 pb-8 sm:pt-16">
      <SectionHeading
        as="h1"
        id="trabaja-titulo"
        eyebrow="Trabajá con nosotros"
        title={trabajaConNosotros.titulo}
        description={trabajaConNosotros.bajada}
      />

      <div className="mt-10">{content}</div>

      {/* La vacante queda guardada aunque una recarga la saque del listado: el modal la sigue mostrando hasta cerrarse */}
      {vacanteElegida && (
        <ApplicationModal
          vacante={vacanteElegida}
          onClose={() => setVacanteElegida(null)}
          onVacanteCerrada={recargar}
        />
      )}
    </section>
  )
}
