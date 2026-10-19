import { Eye, PencilLine } from 'lucide-react'

const variants = {
  edit: {
    Icon: PencilLine,
    label: 'Edición',
    className: 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  },
  read: {
    Icon: Eye,
    label: 'Solo lectura',
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
}

// Nivel de permiso del usuario sobre un módulo: "Edición" o "Solo lectura"
export default function PermissionBadge({ puedeEditar }) {
  const { Icon, label, className } = variants[puedeEditar ? 'edit' : 'read']
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  )
}
