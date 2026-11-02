import FieldScreen from './FieldScreen'

/*
 * Aviso de pantalla completa del módulo de campo (QR no válido, sin conexión). Sin enlaces a otras partes
 * del sistema: si hay algo para hacer, va como acción principal abajo (`action`)
 */
export default function FieldMessage({ icon: Icon, title, description, action, role }) {
  return (
    <FieldScreen centered footer={action}>
      <div role={role} className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-16 place-items-center rounded-card bg-brand-50 text-brand-700">
          <Icon size={32} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold text-balance">{title}</h1>
        <p className="text-lg text-pretty text-neutral-700">{description}</p>
      </div>
    </FieldScreen>
  )
}
