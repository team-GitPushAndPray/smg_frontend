// Encabezado común de las secciones de la home: antetítulo opcional, título y bajada opcional
export default function SectionHeading({ id, eyebrow, title, description }) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      {eyebrow && (
        <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-400">{eyebrow}</p>
      )}
      <h2 id={id} className="text-3xl font-semibold text-balance sm:text-4xl">
        {title}
      </h2>
      {description && <p className="text-lg text-neutral-600 dark:text-neutral-400">{description}</p>}
    </div>
  )
}
