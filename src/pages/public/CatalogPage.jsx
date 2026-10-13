import { CloudOff, PackageOpen, RotateCw, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import CatalogMessage from '../../components/public/CatalogMessage'
import CatalogSearch from '../../components/public/CatalogSearch'
import CategoryFilter from '../../components/public/CategoryFilter'
import EquipmentCard, { EquipmentCardSkeleton } from '../../components/public/EquipmentCard'
import SectionHeading from '../../components/public/SectionHeading'
import { useCatalogo } from '../../hooks/useCatalogo'
import { describeEquipo, getCategorias } from '../../utils/equipos'
import { normalizeText } from '../../utils/text'

const SKELETON_COUNT = 6
const gridClass = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

function countLabel(cantidad) {
  return cantidad === 1 ? '1 equipo' : `${cantidad} equipos`
}

// Catálogo público: equipos disponibles con búsqueda y filtro por tipo en tiempo real
export default function CatalogPage() {
  const { status, equipos, retry } = useCatalogo()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState(null)

  // El layout se comparte con la home: al entrar al catálogo se arranca desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Datos listos para mostrar y el texto normalizado sobre el que se busca
  const items = useMemo(
    () =>
      equipos.map((equipo) => {
        const datos = describeEquipo(equipo)
        return {
          ...datos,
          id: equipo.id,
          categoriaId: equipo.categoria?.id ?? null,
          searchText: normalizeText(`${datos.tipo} ${datos.marca} ${datos.modelo}`),
        }
      }),
    [equipos],
  )
  const categorias = useMemo(() => getCategorias(equipos), [equipos])

  // Si la categoría elegida ya no está en el listado (por ejemplo, al reintentar), se muestran todas
  const activeCategoryId = categorias.some((categoria) => categoria.id === categoryId) ? categoryId : null
  // Cada palabra buscada tiene que aparecer en el tipo, la marca o el modelo
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  const visibleItems = items.filter(
    (item) =>
      (activeCategoryId === null || item.categoriaId === activeCategoryId) &&
      words.every((word) => item.searchText.includes(word)),
  )
  const hasFilters = words.length > 0 || activeCategoryId !== null

  const clearFilters = () => {
    setQuery('')
    setCategoryId(null)
  }

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando equipos…
        </p>
        <ul className={gridClass}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <EquipmentCardSkeleton key={index} />
          ))}
        </ul>
      </div>
    )
  } else if (status === 'error') {
    content = (
      <CatalogMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar el catálogo"
        description="Revisá tu conexión e intentá de nuevo en unos segundos."
      >
        <button type="button" onClick={retry} className="btn-primary">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </CatalogMessage>
    )
  } else if (items.length === 0) {
    content = (
      <CatalogMessage
        icon={PackageOpen}
        title="Por ahora no hay equipos disponibles"
        description="Escribinos y te ayudamos a encontrar lo que necesitás para tu obra."
      >
        <Link to={{ pathname: '/', hash: 'contacto' }} className="btn-primary">
          Contactanos
        </Link>
      </CatalogMessage>
    )
  } else {
    content = (
      <>
        <div className="mb-4 flex min-h-11 items-center justify-between gap-4">
          <p role="status" className="text-sm text-neutral-600 dark:text-neutral-400">
            {hasFilters
              ? `${visibleItems.length} de ${countLabel(items.length)}`
              : `${countLabel(items.length)} ${items.length === 1 ? 'disponible' : 'disponibles'}`}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="interactive -mr-3 min-h-11 rounded-control px-3 text-sm font-medium text-brand-700 hover:bg-brand-600/10 dark:text-brand-400 dark:hover:bg-brand-500/15"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {visibleItems.length > 0 ? (
          <ul className={gridClass}>
            {visibleItems.map((item) => (
              <EquipmentCard
                key={item.id}
                tipo={item.tipo}
                marca={item.marca}
                modelo={item.modelo}
                esAditamento={item.esAditamento}
              />
            ))}
          </ul>
        ) : (
          <CatalogMessage
            icon={SearchX}
            title="No hay equipos que coincidan"
            description="Probá con otra búsqueda, elegí otro tipo o limpiá los filtros."
          />
        )}
      </>
    )
  }

  return (
    <section aria-labelledby="catalogo-titulo" className="page-container pt-12 pb-8 sm:pt-16">
      <SectionHeading
        as="h1"
        id="catalogo-titulo"
        eyebrow="Catálogo"
        title="Equipos disponibles"
        description="Maquinaria y aditamentos listos para tu obra. Buscá por marca o modelo, o filtrá por tipo de equipo."
      />

      {status === 'success' && items.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          <CatalogSearch value={query} onChange={setQuery} />
          <CategoryFilter
            categorias={categorias}
            total={items.length}
            selectedId={activeCategoryId}
            onSelect={setCategoryId}
          />
        </div>
      )}

      <div className="mt-8">{content}</div>
    </section>
  )
}
