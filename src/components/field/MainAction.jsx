/*
 * Botón principal de un paso. Deshabilitado, el texto dice qué falta ("Faltan 3 ítems") en lugar de la acción.
 * `busy` lo bloquea mientras se envía, para que un doble toque no mande dos veces
 */
export default function MainAction({ label, onClick, disabled = false, busy = false, icon: Icon }) {
  return (
    <button type="button" className="campo-btn-primary" onClick={onClick} disabled={disabled || busy} aria-busy={busy}>
      {label}
      {Icon && <Icon size={22} strokeWidth={2} aria-hidden="true" />}
    </button>
  )
}
