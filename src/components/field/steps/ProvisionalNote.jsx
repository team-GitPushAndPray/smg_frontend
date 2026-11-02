import { Construction } from 'lucide-react'

// Provisorio: marca los pasos del asistente que todavía no tienen su formulario (se completan en las próximas issues)
export default function ProvisionalNote({ children }) {
  return (
    <p className="campo-card flex items-start gap-3 border-dashed p-4 text-neutral-700">
      <Construction size={22} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0" />
      {children}
    </p>
  )
}
