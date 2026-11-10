import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { RUTAS_POSTULACIONES } from '../../config/rutasPanel'
import { formatFechaPostulacion, getNombrePostulante } from '../../utils/postulaciones'
import EstadoPostulacionBadge from './EstadoPostulacionBadge'

/** @import { ReactNode } from 'react' */
/** @import { Postulacion } from '../../types/postulaciones' */

const SKELETON_COUNT = 5
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const thBase = `px-3 py-3.5 text-xs font-medium tracking-wide whitespace-nowrap uppercase first:pl-6 ${textMuted}`

// Rojo para texto chico sobre el vidrio: brand-700 en claro y brand-400 en oscuro pasan AA
const linkFicha =
  'interactive inline-flex min-h-11 items-center gap-1 rounded-control px-3 text-sm font-medium whitespace-nowrap text-brand-700 hover:bg-brand-600/10 dark:text-brand-400 dark:hover:bg-brand-500/15'

function VacanteCelda({ vacante }) {
  if (!vacante) return '—'
  return (
    <>
      {vacante.titulo}
      {!vacante.activa && <span className={textMuted}> (inactiva)</span>}
    </>
  )
}

/**
 * Columnas de la bandeja, en orden. Sumar una (por ejemplo "Puntaje", en M14) es agregar un elemento acá: la tabla y
 * las tarjetas de celular se arman recorriendo este array.
 * `principal` es la que va como título de la tarjeta; `className` se aplica a la celda (y al valor en la tarjeta)
 * @type {ReadonlyArray<{
 *   id: string,
 *   label: string,
 *   principal?: boolean,
 *   className?: string,
 *   render: (postulacion: Postulacion) => ReactNode,
 * }>}
 */
const COLUMNAS = Object.freeze([
  {
    id: 'fecha',
    label: 'Fecha',
    className: `whitespace-nowrap tabular-nums ${textSoft}`,
    render: (postulacion) => formatFechaPostulacion(postulacion.creado_en),
  },
  {
    id: 'postulante',
    label: 'Nombre y apellido',
    principal: true,
    className: `min-w-48 font-medium text-pretty ${textStrong}`,
    render: getNombrePostulante,
  },
  {
    id: 'vacante',
    label: 'Vacante',
    className: `min-w-48 text-pretty ${textSoft}`,
    render: (postulacion) => <VacanteCelda vacante={postulacion.vacante} />,
  },
  {
    id: 'estado',
    label: 'Estado',
    render: (postulacion) => <EstadoPostulacionBadge estado={postulacion.estado} />,
  },
])

const columnaPrincipal = COLUMNAS.find((columna) => columna.principal)
const columnasSecundarias = COLUMNAS.filter((columna) => !columna.principal)

/**
 * Bandeja de postulaciones: tabla desde lg y tarjetas por debajo, en el orden en que las manda el back (no se
 * reordena). Cada fila termina con "Ver ficha", que abre la ficha del postulante; `linkState` viaja con la navegación
 * (los filtros de la bandeja, para volver a la misma lista)
 * @param {{ postulaciones: Postulacion[], linkState?: object }} props
 */
export default function PostulacionesTable({ postulaciones, linkState }) {
  const verFicha = (postulacion, className = '') => (
    <Link
      to={RUTAS_POSTULACIONES.ficha(postulacion.id)}
      state={linkState}
      aria-label={`Ver ficha de ${getNombrePostulante(postulacion)}`}
      className={`${linkFicha} ${className}`}
    >
      Ver ficha
      <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  )

  return (
    <div className="glass overflow-hidden">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              {COLUMNAS.map((columna) => (
                <th key={columna.id} scope="col" className={thBase}>
                  {columna.label}
                </th>
              ))}
              <th scope="col" className="w-px py-3.5 pr-4">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {postulaciones.map((postulacion) => (
              <tr key={postulacion.id}>
                {COLUMNAS.map((columna) => (
                  <td key={columna.id} className={`px-3 py-3 first:pl-6 ${columna.className ?? ''}`}>
                    {columna.render(postulacion)}
                  </td>
                ))}
                <td className="py-2 pr-4 text-right">{verFicha(postulacion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 lg:hidden dark:divide-white/10">
        {postulaciones.map((postulacion) => (
          <li key={postulacion.id} className="flex flex-col gap-2 py-4 pr-3 pl-4 sm:pl-5">
            <p className={`font-medium text-pretty ${textStrong}`}>{columnaPrincipal.render(postulacion)}</p>
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-sm">
              {columnasSecundarias.map((columna) => (
                <div key={columna.id} className="contents">
                  <dt className={textMuted}>{columna.label}</dt>
                  <dd className={`min-w-0 ${columna.className ?? ''}`}>{columna.render(postulacion)}</dd>
                </div>
              ))}
            </dl>
            {verFicha(postulacion, '-ml-3 self-start')}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function PostulacionesTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
              <span className={`h-4 w-20 ${skeletonBar}`} />
              <span className={`h-4 w-3/5 max-w-48 ${skeletonBar}`} />
              <span className={`h-4 w-2/5 max-w-40 ${skeletonBar}`} />
              <span className={`h-6 w-24 ${skeletonBar}`} />
            </div>
            <span className={`hidden h-4 w-20 lg:block ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
