import { CloudOff, History, RotateCw, SearchX } from 'lucide-react'
import { useEffect } from 'react'
import { useFiltrosRegistro } from '../../hooks/useFiltrosRegistro'
import { useRegistroEnvios } from '../../hooks/useRegistroEnvios'
import { contar } from '../../utils/historial'
import { ENVIOS_POR_PAGINA, FILTROS_CANAL_ENVIO, FILTROS_ESTADO_ENVIO } from '../../utils/notificaciones'
import FilterMenu from './FilterMenu'
import Pagination from './Pagination'
import PanelMessage from './PanelMessage'
import RegistroEnviosTable, { RegistroEnviosTableSkeleton } from './RegistroEnviosTable'

const NOUN = { one: 'envío', other: 'envíos' }

/*
 * Sección Registro de envíos de /admin/avisos: cada mensaje que salió (o intentó salir) por una regla de notificación
 * (GET /notificaciones/registro), del más nuevo al más viejo, de a 20 por página. Es de solo lectura: la ve igual
 * cualquier rol con Avisos.
 * Filtros desplegables por estado (Todos / Enviado / Error) y por canal, que vuelven a la página 1; filtros y página
 * viven en la URL (useFiltrosRegistro).
 * "Actualizar" vuelve a pedir la página que se está viendo: sirve para ver al instante el aviso que acaba de salir
 * después de cargar horas en una máquina. Mientras llega se sigue viendo la lista anterior, atenuada
 */
export default function RegistroEnviosTab() {
  const { filtros, hasFilters, setFiltros, setPage, limpiarFiltros } = useFiltrosRegistro()
  const { status, envios, total, isLoading, hasData, recargar } = useRegistroEnvios(filtros)

  // Una página que ya no existe (un enlace viejo, o filtros que achicaron la lista) lleva a la última
  const totalPages = Math.max(1, Math.ceil(total / ENVIOS_POR_PAGINA))
  const pageOutOfRange = !isLoading && hasData && filtros.page > totalPages
  useEffect(() => {
    if (pageOutOfRange) setPage(totalPages)
  }, [pageOutOfRange, totalPages, setPage])

  let content
  if ((isLoading && !hasData) || pageOutOfRange) {
    content = <RegistroEnviosTableSkeleton />
  } else if (!isLoading && status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar el registro"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={recargar} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (total === 0 && hasFilters) {
    content = (
      <PanelMessage
        icon={SearchX}
        title="Ningún envío coincide"
        description="No hay envíos con estos filtros. Probá con otros o mirá todos."
      >
        <button type="button" onClick={limpiarFiltros} className="btn-tonal">
          Ver todos
        </button>
      </PanelMessage>
    )
  } else if (total === 0) {
    content = (
      <PanelMessage
        icon={History}
        title="Todavía no se envió ninguna notificación"
        description="Cuando un aviso salga por Telegram o mail, vas a verlo acá con su resultado."
      />
    )
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <RegistroEnviosTable envios={envios} />
        <Pagination page={filtros.page} total={total} limit={ENVIOS_POR_PAGINA} noun={NOUN} onPageChange={setPage} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Filtros a la izquierda y Actualizar a la derecha, en una línea también a 360px */}
      <div className="flex items-center gap-2">
        <div role="group" aria-label="Filtros" className="flex min-w-0 flex-wrap items-center gap-2">
          <FilterMenu
            titulo="Estado"
            opciones={FILTROS_ESTADO_ENVIO}
            valor={filtros.estado}
            onCambiar={(estado) => setFiltros({ estado })}
          />
          <FilterMenu
            titulo="Canal"
            opciones={FILTROS_CANAL_ENVIO}
            valor={filtros.canal}
            onCambiar={(canal) => setFiltros({ canal })}
          />
        </div>

        {/* En celular, solo el ícono; el nombre accesible es siempre "Actualizar" */}
        <button
          type="button"
          onClick={recargar}
          aria-busy={isLoading}
          title="Actualizar"
          className="pill ml-auto shrink-0 justify-center px-3 sm:px-4"
        >
          <RotateCw
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            className={isLoading ? 'animate-spin motion-reduce:animate-none' : ''}
          />
          <span className="sr-only sm:not-sr-only">{isLoading ? 'Actualizando…' : 'Actualizar'}</span>
        </button>
      </div>

      <p role="status" className="sr-only">
        {isLoading || !hasData
          ? 'Cargando envíos…'
          : status === 'success'
            ? `${contar(total, NOUN)}${hasFilters ? (total === 1 ? ' encontrado' : ' encontrados') : ''}`
            : ''}
      </p>

      {/* Mientras llega la página actualizada se sigue viendo la anterior, atenuada */}
      <div
        aria-busy={isLoading}
        className={`transition-opacity duration-200 ease-glass ${isLoading && hasData ? 'pointer-events-none opacity-60' : ''}`}
      >
        {content}
      </div>
    </div>
  )
}
