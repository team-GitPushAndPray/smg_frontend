// Texto del estado según el género del registro: "Activo" para usuarios y clientes, "Activa" para vacantes
const TEXTOS = {
  masculino: { activo: 'Activo', inactivo: 'Inactivo' },
  femenino: { activo: 'Activa', inactivo: 'Inactiva' },
}

/*
 * Estado Activo / Inactivo de un registro del panel (usuarios, clientes, vacantes). Sin verde en la paleta: activo es
 * un punto lleno en el color del texto; inactivo, un punto hueco y en gris (pasa AA sobre el vidrio). Siempre con su
 * texto. Con `femenino` dice Activa / Inactiva
 */
export default function EstadoActivoBadge({ activo, femenino = false }) {
  const textos = TEXTOS[femenino ? 'femenino' : 'masculino']
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
      {activo ? textos.activo : textos.inactivo}
    </span>
  )
}
