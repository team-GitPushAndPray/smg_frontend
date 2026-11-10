import { useState } from 'react'
import { ESTADOS_ITEM } from '../../utils/checklists'
import {
  contar,
  formatFechaChecklist,
  formatHorasChecklist,
  getTipoChecklist,
  getUrlFoto,
  TRANSFORMACION_FOTO,
} from '../../utils/historial'
import EncabezadoImpresion from './EncabezadoImpresion'

// Lugar de cada foto: alto fijo para que entren dos filas por hoja; la foto se ve entera, sin recortar
const marcoFoto = 'h-[8cm] w-full rounded-control border border-neutral-300 bg-neutral-100'

const ANORMALES = { one: 'ítem anormal', other: 'ítems anormales' }

// En papel el estado se lee por el símbolo y el texto (puede salir en blanco y negro); el color solo acompaña
const ESTADO_IMPRESION = Object.freeze({
  NORMAL: { simbolo: '✓', className: 'text-ok-700' },
  ANORMAL: { simbolo: '✕', className: 'font-semibold text-brand-700' },
  NO_APLICA: { simbolo: '—', className: 'text-neutral-700' },
})

function Estado({ estado }) {
  const etiqueta = ESTADOS_ITEM.find(({ valor }) => valor === estado)?.etiqueta ?? (estado || 'Sin estado')
  const { simbolo, className } = ESTADO_IMPRESION[estado] ?? { simbolo: '?', className: 'text-neutral-700' }
  return (
    <span className={`whitespace-nowrap ${className}`}>
      {simbolo} {etiqueta}
    </span>
  )
}

function Dato({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-neutral-700">{label}</dt>
      <dd className={value ? 'font-medium tabular-nums' : 'text-neutral-700'}>{value || 'Sin registrar'}</dd>
    </div>
  )
}

/*
 * Checklist para imprimir o guardar como PDF (lo que se le muestra al cliente en una entrega o devolución):
 * encabezado del equipo, datos del checklist, observaciones generales, todas las respuestas en el orden de la
 * plantilla (las anormales resaltadas, con su observación) y las fotos, dos por fila. Va dentro de HojaImpresion,
 * que espera a que carguen las fotos antes de abrir el diálogo
 */
export default function InformeChecklistDetalle({ checklist, equipo, emitido }) {
  const esMaquina = equipo.tipo === 'maquina'
  const momento = formatFechaChecklist(checklist.fecha)
  const anormales = checklist.respuestas.filter((respuesta) => respuesta.estado === 'ANORMAL').length
  const totalFotos = checklist.fotos.length
  const [fallidas, setFallidas] = useState(() => new Set())
  const marcarFallida = (clave) => setFallidas((actuales) => new Set(actuales).add(clave))

  return (
    <>
      <EncabezadoImpresion
        titulo={`Checklist · ${getTipoChecklist(checklist.tipo).label}`}
        equipo={equipo}
        emitido={emitido}
      />

      <dl className={`grid gap-4 ${esMaquina ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <Dato label="Fecha y hora" value={momento ? `${momento.fecha} · ${momento.hora}` : null} />
        {esMaquina && (
          <Dato
            label="Horas motor"
            value={checklist.horasMotor != null ? formatHorasChecklist(checklist.horasMotor, esMaquina) : null}
          />
        )}
        <Dato label="Responsable" value={checklist.responsable} />
        <Dato label="Resultado" value={anormales > 0 ? contar(anormales, ANORMALES) : 'Sin anormales'} />
      </dl>

      <section className="flex flex-col gap-1.5">
        <h2 className="impresion-titulo">Observaciones generales</h2>
        <p
          className={`leading-relaxed break-words whitespace-pre-line ${checklist.observaciones ? '' : 'text-neutral-700'}`}
        >
          {checklist.observaciones || 'Sin observaciones.'}
        </p>
      </section>

      {checklist.respuestas.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="impresion-titulo">Ítems revisados</h2>
          <table className="impresion-tabla">
            <thead>
              <tr>
                <th scope="col" className="w-8 text-right">
                  #
                </th>
                <th scope="col" className="w-2/5">
                  Ítem
                </th>
                <th scope="col" className="w-24">
                  Estado
                </th>
                <th scope="col">Observación</th>
              </tr>
            </thead>
            <tbody>
              {checklist.respuestas.map((respuesta, index) => (
                <tr key={respuesta.id} className={respuesta.estado === 'ANORMAL' ? 'bg-brand-50' : undefined}>
                  <td className="text-right text-neutral-700 tabular-nums">{index + 1}</td>
                  <td className="break-words">{respuesta.item}</td>
                  <td>
                    <Estado estado={respuesta.estado} />
                  </td>
                  <td className="break-words whitespace-pre-line">{respuesta.observacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {totalFotos > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="impresion-titulo">
            Fotos <span className="font-normal text-neutral-700 tabular-nums">{totalFotos}</span>
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {checklist.fotos.map((foto, index) => {
              const clave = foto.id ?? foto.url
              return (
                <li key={clave} className="flex break-inside-avoid flex-col gap-1">
                  {fallidas.has(clave) ? (
                    <p className={`${marcoFoto} grid place-items-center text-neutral-700`}>No se pudo cargar la foto.</p>
                  ) : (
                    <img
                      src={getUrlFoto(foto.url, TRANSFORMACION_FOTO.impresion)}
                      alt={`Foto ${index + 1} de ${totalFotos}`}
                      loading="eager"
                      onError={() => marcarFallida(clave)}
                      className={`${marcoFoto} object-contain`}
                    />
                  )}
                  <p className="text-xs text-neutral-700 tabular-nums">
                    Foto {index + 1} de {totalFotos}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
