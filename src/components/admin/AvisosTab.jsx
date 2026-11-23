import { BellOff, CheckCheck, CloudOff, Lock, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { MODULOS } from '../../config/rutasPanel'
import { useAvisos } from '../../hooks/useAvisos'
import { useFiltrosAvisos } from '../../hooks/useFiltrosAvisos'
import { usePermiso } from '../../hooks/usePermiso'
import { useResumenAvisos } from '../../hooks/useResumenAvisos'
import { FILTROS_TIPO_AVISO, PESTANAS_AVISOS } from '../../utils/avisos'
import { contar } from '../../utils/historial'
import AtenderAvisoModal from './AtenderAvisoModal'
import AvisoCard, { AvisosSkeleton } from './AvisoCard'
import AvisosToolbar from './AvisosToolbar'
import PanelMessage from './PanelMessage'
import SegmentedTabs from './SegmentedTabs'

/** @import { Aviso } from '../../types/avisos' */

const NOUN = { one: 'aviso', other: 'avisos' }

// Estado del back de cada pestaña (PENDIENTE / ATENDIDO)
const ESTADO_PESTANA = Object.fromEntries(PESTANAS_AVISOS.map(({ id, estado }) => [id, estado]))

const textMuted = 'text-neutral-600 dark:text-neutral-400'

/*
 * Sección Avisos de /admin/avisos: centro de avisos de service y de certificación de la flota.
 * Dos pestañas, con la activa en la URL (?estado=): Pendientes y Atendidos; y un filtro por tipo (Todos / Service /
 * Certificación, ?tipo=) que vale para las dos. Cada pestaña pide GET /avisos con su estado y el tipo recién cuando se
 * abre, y conserva su última lista: al volver se ve atenuada mientras llega la nueva.
 * El orden lo da el back (vencidos primero, después los más cercanos): el front no reordena.
 * Estados: cargando, vacío (por pestaña y por tipo), error de red con reintento y 403 si el rol no tiene el módulo.
 * "Marcar atendido" se ve en los pendientes con edición en Avisos y abre el modal de atención. Al atender (o si otro
 * usuario se adelantó) se vuelve a pedir la lista de pendientes y el resumen de la campanita, sin recargar la página.
 * Atendidos se pide de nuevo cada vez que se abre su pestaña, así que ya trae el aviso recién cerrado
 */
export default function AvisosTab() {
  const { puedeEditar } = usePermiso(MODULOS.AVISOS)
  const { puedeVer: puedeVerMaquinas } = usePermiso(MODULOS.MAQUINAS)
  const { filtros, hayFiltroTipo, setPestana, setTipo } = useFiltrosAvisos()
  const { tab, tipo } = filtros
  const { refrescar: refrescarResumen } = useResumenAvisos()
  const [atendiendo, setAtendiendo] = useState(/** @type {Aviso | null} */ (null))
  const filtroTipo = FILTROS_TIPO_AVISO[tipo]

  const consulta = (pestana) => (tab === pestana ? { estado: ESTADO_PESTANA[pestana], tipo: filtroTipo.tipo } : null)
  const pendientes = useAvisos(consulta('pendientes'))
  const atendidos = useAvisos(consulta('atendidos'))
  const { status, avisos, isLoading, hasData, retry } = { pendientes, atendidos }[tab]
  const total = avisos.length

  const onAtendido = () => {
    pendientes.retry()
    refrescarResumen()
  }

  let content
  if (isLoading && !hasData) {
    content = <AvisosSkeleton />
  } else if (!isLoading && status === 'forbidden') {
    content = (
      <PanelMessage
        role="alert"
        icon={Lock}
        title="No tenés acceso a los avisos"
        description="Tu rol no incluye el módulo Avisos. Si lo necesitás, consultá con un administrador."
      />
    )
  } else if (!isLoading && status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar los avisos"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (total === 0) {
    const enPendientes = tab === 'pendientes'
    content = (
      <PanelMessage
        icon={enPendientes ? BellOff : CheckCheck}
        title={enPendientes ? `No hay ${filtroTipo.avisos} pendientes` : `Todavía no hay ${filtroTipo.avisos} atendidos`}
        description={
          enPendientes
            ? 'Cuando una máquina se acerque a su próximo service o a vencer su certificación, el aviso va a aparecer acá.'
            : 'Cuando se marque un aviso como atendido, va a quedar registrado acá con su nota.'
        }
      >
        {hayFiltroTipo && (
          <button type="button" onClick={() => setTipo('todos')} className="btn-tonal">
            Ver todos los tipos
          </button>
        )}
      </PanelMessage>
    )
  } else {
    content = (
      <div className="flex flex-col gap-3">
        <p aria-hidden="true" className={`text-sm tabular-nums ${textMuted}`}>
          {contar(total, NOUN)}
        </p>
        <ul className="flex flex-col gap-3">
          {avisos.map((aviso) => (
            <AvisoCard
              key={aviso.id}
              aviso={aviso}
              puedeVerMaquina={puedeVerMaquinas}
              puedeAtender={puedeEditar}
              onMarcarAtendido={setAtendiendo}
            />
          ))}
        </ul>
      </div>
    )
  }

  return (
    <>
      <SegmentedTabs pestanas={PESTANAS_AVISOS} activa={tab} onCambiar={setPestana} label="Estado de los avisos">
        <div className="flex flex-col gap-4">
          <AvisosToolbar tipo={tipo} onTipoChange={setTipo} />

          <p role="status" className="sr-only">
            {isLoading || !hasData ? 'Cargando avisos…' : status === 'success' ? contar(total, NOUN) : ''}
          </p>

          {/* Mientras llega la nueva lista se sigue viendo la anterior, atenuada */}
          <div
            aria-busy={isLoading}
            className={`transition-opacity duration-200 ease-glass ${isLoading && hasData ? 'pointer-events-none opacity-60' : ''}`}
          >
            {content}
          </div>
        </div>
      </SegmentedTabs>

      {atendiendo && (
        <AtenderAvisoModal
          key={atendiendo.id}
          aviso={atendiendo}
          onClose={() => setAtendiendo(null)}
          onDone={onAtendido}
        />
      )}
    </>
  )
}
