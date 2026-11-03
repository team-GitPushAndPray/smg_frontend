import { Pencil, RotateCw, Send, X } from 'lucide-react'
import { useId } from 'react'
import { useChecklist } from '../../../hooks/useChecklist'
import {
  contarEstados,
  ESTADOS_ITEM,
  formatCambioHoras,
  getEstadoItem,
  getItemsAnormales,
  textoFaltaCierre,
  textoFaltanItems,
  validarHoras,
  validarNombre,
} from '../../../utils/checklists'
import EnvioAlert from '../EnvioAlert'
import FieldScreen from '../FieldScreen'
import MainAction from '../MainAction'

// Color del ícono de cada estado, el mismo que usan los botones de los ítems
const COLOR_ESTADO = {
  NORMAL: 'text-ok-700',
  ANORMAL: 'text-brand-700',
  NO_APLICA: 'text-neutral-700',
}

// Un bloque de la revisión, con su "Editar" que lleva al paso donde se cargó
function RevisionBlock({ titulo, onEditar, children }) {
  const tituloId = useId()

  return (
    <section aria-labelledby={tituloId} className="campo-card flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id={tituloId} className="font-medium text-neutral-700">
          {titulo}
        </h2>
        <button
          type="button"
          onClick={onEditar}
          aria-label={`Editar ${titulo.toLowerCase()}`}
          className="interactive -my-2 -mr-2 inline-flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-control px-2 font-semibold text-brand-700 hover:text-brand-800"
        >
          <Pencil size={20} strokeWidth={2} aria-hidden="true" />
          Editar
        </button>
      </div>
      {children}
    </section>
  )
}

/*
 * Lo primero que falta para enviar, con el paso que lo corrige: { paso, texto } o null si está todo.
 * Hace falta acá porque se puede llegar desde un borrador (sin las fotos) o con horas que un 409 dejó viejas
 */
function getFaltante({ equipo, items, datos, fotos }) {
  if (equipo.esMaquina && validarHoras(datos.horas, equipo.horasMotorActual).estado !== 'ok') {
    return { paso: 'horas', texto: 'Revisá las horas' }
  }
  const pendientes = items.filter(({ id }) => !getEstadoItem(datos.respuestas, id)).length
  if (pendientes > 0) return { paso: 'items', texto: textoFaltanItems(pendientes) }

  const cierre = {
    fotoOk: fotos.length > 0,
    nombreOk: validarNombre(datos.nombre) === 'ok',
    apellidoOk: validarNombre(datos.apellido) === 'ok',
  }
  if (!cierre.fotoOk || !cierre.nombreOk || !cierre.apellidoOk) return { paso: 'cierre', texto: textoFaltaCierre(cierre) }
  return null
}

/*
 * Último paso: todo lo cargado, de solo lectura, en un bloque por paso con su "Editar". "Enviar" se bloquea mientras
 * se envía ("Enviando…"); sin conexión queda "Reintentar" con todo intacto. Si falta algo, el botón dice qué y lleva ahí
 */
export default function RevisionStep({ header }) {
  const { equipo, opcion, datos, fotos, enviando, errorEnvio, editarPaso, enviar } = useChecklist()

  const items = opcion?.items ?? []
  const validacionHoras = validarHoras(datos.horas, equipo.horasMotorActual)
  const cantidades = contarEstados(items, datos.respuestas)
  const anormales = getItemsAnormales(items, datos.respuestas)
  const faltante = getFaltante({ equipo, items, datos, fotos })
  const detalleEquipo = [equipo.codigoInterno, equipo.categoria, equipo.marca].filter(Boolean).join(' · ')

  let accion
  if (faltante) accion = <MainAction label={faltante.texto} incompleto onClick={() => editarPaso(faltante.paso)} />
  else if (enviando) accion = <MainAction label="Enviando…" busy />
  else if (errorEnvio?.red) accion = <MainAction label="Reintentar" icon={RotateCw} onClick={enviar} />
  else accion = <MainAction label="Enviar" icon={Send} onClick={enviar} />

  return (
    <FieldScreen header={header} footer={accion}>
      <h1 className="text-2xl font-semibold text-balance">Revisá y enviá</h1>
      <EnvioAlert />

      <RevisionBlock titulo="Revisión" onEditar={() => editarPaso('inicio')}>
        <p className="text-lg font-semibold">{opcion?.titulo}</p>
        <p className="break-words text-neutral-700">{detalleEquipo}</p>
      </RevisionBlock>

      {equipo.esMaquina && (
        <RevisionBlock titulo="Horas" onEditar={() => editarPaso('horas')}>
          {validacionHoras.estado === 'ok' ? (
            <p className="text-lg font-semibold tabular-nums">
              {formatCambioHoras(equipo.horasMotorActual, validacionHoras.horas, { conDiferencia: true })}
            </p>
          ) : (
            <p className="text-lg font-semibold text-brand-700">Revisá las horas</p>
          )}
        </RevisionBlock>
      )}

      <RevisionBlock titulo="Ítems" onEditar={() => editarPaso('items')}>
        <ul className="grid grid-cols-3 gap-2">
          {ESTADOS_ITEM.map(({ valor, etiqueta, icono: Icon }) => (
            <li
              key={valor}
              className="flex flex-col items-center gap-1 rounded-control border border-neutral-300 px-1 py-2 text-center"
            >
              <Icon size={22} strokeWidth={2.5} aria-hidden="true" className={COLOR_ESTADO[valor]} />
              <span className="text-2xl font-semibold tabular-nums">{cantidades[valor]}</span>
              <span className="font-medium whitespace-nowrap">{etiqueta}</span>
            </li>
          ))}
        </ul>
        {anormales.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            <p className="font-medium">Anormales:</p>
            <ul className="flex flex-col gap-2">
              {anormales.map(({ id, nombre }) => (
                <li key={id} className="flex items-start gap-2">
                  <X size={22} strokeWidth={2.5} aria-hidden="true" className="mt-px shrink-0 text-brand-700" />
                  <span className="min-w-0 break-words">{nombre}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </RevisionBlock>

      <RevisionBlock titulo="Cierre" onEditar={() => editarPaso('cierre')}>
        <dl className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-neutral-700">Fotos:</dt>
            <dd className="font-semibold">{fotos.length === 1 ? '1 foto' : `${fotos.length} fotos`}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-neutral-700">Responsable:</dt>
            <dd className="min-w-0 font-semibold break-words">
              {`${datos.nombre.trim()} ${datos.apellido.trim()}`.trim() || '—'}
            </dd>
          </div>
        </dl>
      </RevisionBlock>
    </FieldScreen>
  )
}
