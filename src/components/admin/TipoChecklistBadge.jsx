import { getTipoChecklist } from '../../utils/historial'

// Tipo de un checklist: ícono, texto y un tono distinto por tipo (nunca solo el color)
export default function TipoChecklistBadge({ tipo }) {
  const { Icon, label, className } = getTipoChecklist(tipo)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${className}`}
    >
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  )
}
