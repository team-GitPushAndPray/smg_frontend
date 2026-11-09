import { ArrowRight, Bell, BellOff, Clock, CloudOff, RotateCw } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { RUTAS_AVISOS } from '../../config/rutasPanel'
import { useAvisos } from '../../hooks/useAvisos'
import { useResumenAvisos } from '../../hooks/useResumenAvisos'
import {
  describirAviso,
  describirResumenAvisos,
  formatBadgeAvisos,
  ICONOS_TIPO_AVISO,
  MAX_AVISOS_CAMPANITA,
} from '../../utils/avisos'
import { EstadoAviso } from './AvisoCard'

/** @import { Aviso, FiltrosAvisos } from '../../types/avisos' */

/** @type {FiltrosAvisos} */
const CONSULTA_PENDIENTES = Object.freeze({ estado: 'PENDIENTE' })

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const triggerBase =
  'interactive relative grid size-11 place-items-center rounded-control text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
const triggerOpen = 'bg-black/5 text-black dark:bg-white/10 dark:text-white'
const linkVerTodos =
  'interactive flex min-h-11 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium text-brand-700 hover:bg-brand-600/10 dark:text-brand-400 dark:hover:bg-brand-500/15'

/**
 * Un pendiente en versión compacta: tipo, máquina, qué pide y la urgencia (con ícono y texto, no solo color)
 * @param {{ aviso: Aviso }} props
 */
function AvisoCompacto({ aviso }) {
  const { titulo } = describirAviso(aviso)
  const TipoIcon = ICONOS_TIPO_AVISO[aviso.tipo] ?? Clock
  const { codigo_interno: codigo, nombre } = aviso.maquina ?? {}

  return (
    <li className="flex items-start gap-3 rounded-control px-2.5 py-2.5">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-control bg-black/5 dark:bg-white/10 ${textSoft}`}
      >
        <TipoIcon size={18} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={`truncate text-sm font-semibold ${textStrong}`}>
          <span className="tabular-nums">{codigo ?? '—'}</span>
          {nombre && <span className={`font-normal ${textSoft}`}> · {nombre}</span>}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`text-sm ${textSoft}`}>{titulo}</span>
          <EstadoAviso aviso={aviso} />
        </div>
      </div>
    </li>
  )
}

function ListaSkeleton() {
  return (
    <ul aria-hidden="true" className="flex flex-col">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex items-start gap-3 px-2.5 py-2.5">
          <span className={`size-9 shrink-0 ${skeletonBar}`} />
          <div className="flex flex-1 flex-col gap-2 pt-0.5">
            <span className={`h-4 w-3/5 ${skeletonBar}`} />
            <span className={`h-4 w-2/5 ${skeletonBar}`} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function MensajeLista({ icon: Icon, children }) {
  return (
    <div className={`flex flex-col items-center gap-2 px-4 py-6 text-center text-sm ${textMuted}`}>
      <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      {children}
    </div>
  )
}

/*
 * Los primeros pendientes de GET /avisos?estado=PENDIENTE (el back los manda del más urgente al menos urgente). Se
 * monta al abrir el desplegable, así cada apertura trae la lista del momento
 */
function ListaPendientes() {
  const { status, avisos, isLoading, hasData, retry } = useAvisos(CONSULTA_PENDIENTES)
  const primeros = avisos.slice(0, MAX_AVISOS_CAMPANITA)

  let content
  if (isLoading && !hasData) {
    content = <ListaSkeleton />
  } else if (!isLoading && status === 'forbidden') {
    content = <MensajeLista icon={BellOff}>Tu rol no incluye el módulo Avisos.</MensajeLista>
  } else if (!isLoading && status === 'error') {
    content = (
      <MensajeLista icon={CloudOff}>
        <p>No pudimos cargar los avisos.</p>
        <button type="button" onClick={retry} className="btn-tonal mt-1">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </MensajeLista>
    )
  } else if (primeros.length === 0) {
    content = <MensajeLista icon={BellOff}>No hay avisos pendientes.</MensajeLista>
  } else {
    content = (
      <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
        {primeros.map((aviso) => (
          <AvisoCompacto key={aviso.id} aviso={aviso} />
        ))}
      </ul>
    )
  }

  return (
    <>
      <p role="status" className="sr-only">
        {isLoading ? 'Cargando avisos pendientes…' : ''}
      </p>
      <div aria-busy={isLoading} className={isLoading && hasData ? 'opacity-60' : undefined}>
        {content}
      </div>
    </>
  )
}

/*
 * Campanita de avisos en la topbar, al lado del usuario. Solo con el módulo AVISOS (si no, no se muestra).
 * Badge con los pendientes de GET /avisos/resumen (sin pendientes, sin badge); el resumen lo pide <AvisosProvider> al
 * entrar al panel, al cambiar de sección y al atender un aviso. Al abrirse también lo refresca, para que el número y la
 * lista coincidan.
 * El desplegable muestra los MAX_AVISOS_CAMPANITA más urgentes y "Ver todos" al centro de avisos. Se cierra con
 * Escape (el foco vuelve a la campana), con un clic afuera o al cambiar de sección.
 * En celular se abre a lo ancho de la topbar (la campana no está en el borde y un panel anclado a ella se saldría de
 * la pantalla); desde sm, anclado a la campana
 */
export default function CampanitaAvisos() {
  const { habilitado, resumen, refrescar } = useResumenAvisos()
  const { pathname } = useLocation()
  // Sección en la que se abrió: si cambia, el desplegable queda cerrado sin necesidad de un efecto
  const [abiertoEn, setAbiertoEn] = useState(/** @type {string | null} */ (null))
  const isOpen = abiertoEn === pathname
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const panelId = useId()
  const titleId = useId()

  const cerrar = () => setAbiertoEn(null)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setAbiertoEn(null)
      buttonRef.current?.focus()
    }
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setAbiertoEn(null)
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isOpen])

  if (!habilitado) return null

  const pendientes = resumen?.pendientes ?? 0
  const label = resumen ? `Avisos: ${describirResumenAvisos(resumen).replace(' · ', ', ')}` : 'Avisos'

  const toggle = () => {
    if (isOpen) {
      cerrar()
      return
    }
    setAbiertoEn(pathname)
    refrescar()
  }

  return (
    // Sin `relative` en celular: el panel se posiciona contra la topbar (sticky) y ocupa todo su ancho
    <div ref={containerRef} className="sm:relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={label}
        title={label}
        className={`${triggerBase} ${isOpen ? triggerOpen : ''}`}
      >
        <Bell size={22} strokeWidth={1.75} aria-hidden="true" />
        {pendientes > 0 && (
          // Blanco sobre brand-600 pasa AA en ambos modos
          <span
            aria-hidden="true"
            className="absolute top-1 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs leading-none font-semibold text-white tabular-nums"
          >
            {formatBadgeAvisos(pendientes)}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={titleId}
          className="glass-strong absolute inset-x-0 top-full mt-2 flex max-h-[calc(100svh-7rem)] flex-col sm:inset-x-auto sm:right-0 sm:mt-4 sm:w-96"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-4 pt-4 pb-2">
            <h2 id={titleId} className={`font-semibold ${textStrong}`}>
              Avisos pendientes
            </h2>
            {resumen && <p className={`text-sm tabular-nums ${textMuted}`}>{describirResumenAvisos(resumen)}</p>}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-1.5">
            <ListaPendientes />
          </div>

          <div className="border-t border-neutral-200 p-2 dark:border-neutral-800">
            <Link to={RUTAS_AVISOS.centro} onClick={cerrar} className={linkVerTodos}>
              {pendientes > MAX_AVISOS_CAMPANITA ? `Ver todos (${pendientes})` : 'Ver todos'}
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
