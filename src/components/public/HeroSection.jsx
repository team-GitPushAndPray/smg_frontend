import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { presentacion } from '../../data/empresa'

// Resalta con el acento el fragmento indicado del título; si no lo encuentra, lo muestra liso
function HighlightedTitle({ text, highlight }) {
  const start = highlight ? text.indexOf(highlight) : -1
  if (start === -1) return text

  const end = start + highlight.length
  return (
    <>
      {text.slice(0, start)}
      <span className="text-brand-600 dark:text-brand-500">{text.slice(start, end)}</span>
      {text.slice(end)}
    </>
  )
}

export default function HeroSection() {
  return (
    <section
      id="inicio"
      aria-labelledby="inicio-titulo"
      className="page-container flex scroll-mt-24 flex-col items-center gap-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-28"
    >
      <h1 id="inicio-titulo" className="max-w-4xl text-4xl font-semibold text-balance sm:text-5xl lg:text-6xl">
        <HighlightedTitle text={presentacion.titulo} highlight={presentacion.tituloDestacado} />
      </h1>

      <p className="max-w-2xl text-lg text-pretty text-neutral-600 sm:text-xl dark:text-neutral-400">
        {presentacion.bajada}
      </p>

      <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link to="/catalogo" className="btn-primary">
          Ver catálogo
          <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <Link to={{ pathname: '/', hash: 'contacto' }} className="btn-secondary">
          Contactanos
        </Link>
      </div>
    </section>
  )
}
