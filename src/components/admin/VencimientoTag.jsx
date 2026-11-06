import { Clock, TriangleAlert } from 'lucide-react'

/** @import { Vencimiento } from '../../utils/alquileres' */

/*
 * Vencido: rojo con alerta, lo que tiene que saltar a la vista (brand-700 / brand-400 pasan AA en texto chico sobre el
 * vidrio). Por vencer: gris fuerte con reloj. No depende solo del color: siempre lleva ícono y texto
 */
const VENCIMIENTO = {
  vencido: { Icon: TriangleAlert, className: 'text-brand-700 dark:text-brand-400' },
  'por-vencer': { Icon: Clock, className: 'text-neutral-800 dark:text-neutral-200' },
}

/**
 * Aviso de vencimiento de un alquiler ACTIVO ("Vence en 3 días", "Vencido hace 2 días"), el que arma getVencimiento.
 * Sin aviso no muestra nada. Lo usan el listado y el detalle
 * @param {{ vencimiento: Vencimiento | null, className?: string }} props
 */
export default function VencimientoTag({ vencimiento, className = '' }) {
  if (!vencimiento) return null
  const { Icon, className: tono } = VENCIMIENTO[vencimiento.tipo]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${tono} ${className}`}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      {vencimiento.label}
    </span>
  )
}
