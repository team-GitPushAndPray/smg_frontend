import { CircleCheck, CirclePlay, CircleX, Clock } from 'lucide-react'

/** @import { EstadoAlquiler } from '../types/alquileres' */

/*
 * Estados de un alquiler, con la clave tal cual la manda el back. Mismo badge en todas las pantallas.
 * La paleta no tiene ámbar ni verde: cada estado se distingue por tono, relleno e ícono, y siempre con su texto.
 * Activo es el que más resalta (relleno sólido); Pendiente, solo contorno (todavía no arrancó); Finalizado, gris;
 * Anulado, rojo apagado. El orden es el del ciclo de vida
 */
export const ESTADOS_ALQUILER = Object.freeze({
  PENDIENTE: {
    label: 'Pendiente',
    Icon: Clock,
    className: 'text-neutral-800 ring-1 ring-neutral-500 ring-inset dark:text-neutral-200 dark:ring-neutral-400',
  },
  ACTIVO: {
    label: 'Activo',
    Icon: CirclePlay,
    className: 'bg-black text-white dark:bg-white dark:text-black',
  },
  FINALIZADO: {
    label: 'Finalizado',
    Icon: CircleCheck,
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
  ANULADO: {
    label: 'Anulado',
    Icon: CircleX,
    className: 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  },
})

/**
 * Configuración del estado de un alquiler, o null si el front no lo conoce
 * @param {EstadoAlquiler | string} estado
 */
export function getEstadoAlquiler(estado) {
  return Object.hasOwn(ESTADOS_ALQUILER, estado) ? ESTADOS_ALQUILER[estado] : null
}

// Tipos de checklist de un equipo alquilado: el `?tipo=` de la ruta y del GET del formulario
export const TIPOS_CHECKLIST_ALQUILER = Object.freeze({
  ENTREGA: 'Entrega',
  DEVOLUCION: 'Devolución',
})

/**
 * Link a Google Maps de una ubicación, para abrir en pestaña nueva. Devuelve null si falta alguna coordenada o no es un
 * número (así el que lo usa no arma un link roto)
 * @param {number | string | null | undefined} lat
 * @param {number | string | null | undefined} lng
 * @returns {string | null}
 */
export function linkMaps(lat, lng) {
  if (lat == null || lng == null || lat === '' || lng === '') return null
  const latitud = Number(lat)
  const longitud = Number(lng)
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return null
  return `https://www.google.com/maps?q=${latitud},${longitud}`
}
