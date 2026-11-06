/*
 * Estado Activo / Inactivo de un registro del panel (usuarios, clientes). Sin verde en la paleta: activo es un punto
 * lleno en el color del texto; inactivo, un punto hueco y en gris (pasa AA sobre el vidrio). Siempre con su texto
 */
export default function EstadoActivoBadge({ activo }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
        activo ? 'text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-400'
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full ${activo ? 'bg-current' : 'border-[1.5px] border-current'}`}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}
