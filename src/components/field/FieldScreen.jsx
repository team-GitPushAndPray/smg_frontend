/*
 * Pantalla del módulo de campo: encabezado opcional arriba (fijo), contenido y la acción principal abajo,
 * fija y al alcance del pulgar. `centered` centra el contenido en el alto (avisos de una sola idea)
 */
export default function FieldScreen({ header, footer, centered = false, children }) {
  return (
    <div className="flex min-h-svh flex-col">
      {header && <header className="sticky top-0 z-10 bg-neutral-100 px-4 pt-2 pb-3">{header}</header>}
      <main className={`flex flex-1 flex-col gap-5 px-4 pb-6 ${header ? 'pt-2' : 'pt-6'} ${centered ? 'justify-center' : ''}`}>
        {children}
      </main>
      {footer && (
        <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-neutral-300 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </div>
  )
}
