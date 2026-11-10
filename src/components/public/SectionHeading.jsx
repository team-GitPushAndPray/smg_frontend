// Encabezado común de las secciones: antetítulo opcional, título y bajada opcional.
// `as` cambia el nivel del título (h1 en páginas propias como el catálogo)
export default function SectionHeading({ id, eyebrow, title, description, as: Heading = 'h2' }) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      {eyebrow && (
        <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-400">{eyebrow}</p>
      )}
      <Heading id={id} className="text-3xl font-semibold text-balance sm:text-4xl">
        {title}
      </Heading>
      {description && <p className="text-lg text-neutral-600 dark:text-neutral-400">{description}</p>}
    </div>
  )
}
