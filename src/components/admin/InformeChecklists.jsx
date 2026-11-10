import {
  contar,
  describirFiltros,
  formatFechaChecklist,
  formatHorasChecklist,
  getTipoChecklist,
} from '../../utils/historial'
import EncabezadoImpresion from './EncabezadoImpresion'

const NOUN = { one: 'checklist', other: 'checklists' }

/*
 * Historial de checklists para imprimir o guardar como PDF: encabezado del equipo con la fecha de emisión, los
 * filtros con los que se exportó y una tabla con todos los checklists que los cumplen (no solo la página que se
 * estaba viendo), del más nuevo al más viejo. Va dentro de HojaImpresion.
 * Las horas de motor solo aparecen en las máquinas: los aditamentos no tienen motor
 */
export default function InformeChecklists({ equipo, checklists, filtros, emitido }) {
  const esMaquina = equipo.tipo === 'maquina'
  const aplicados = describirFiltros(filtros)

  return (
    <>
      <EncabezadoImpresion titulo="Historial de checklists" equipo={equipo} emitido={emitido} />

      <section className="flex flex-col gap-1.5">
        <h2 className="impresion-titulo">Filtros aplicados</h2>
        {aplicados.length > 0 ? (
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {aplicados.map(({ label, valor }) => (
              <li key={label}>
                <span className="text-neutral-700">{label}:</span> <span className="font-medium">{valor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-700">Sin filtros: todos los checklists del equipo.</p>
        )}
        <p className="font-medium tabular-nums">{contar(checklists.length, NOUN)}</p>
      </section>

      <table className="impresion-tabla">
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Hora</th>
            <th scope="col">Tipo</th>
            {esMaquina && (
              <th scope="col" className="text-right">
                Horas motor
              </th>
            )}
            <th scope="col">Responsable</th>
            <th scope="col" className="text-right">
              Anormales
            </th>
            <th scope="col" className="text-right">
              Fotos
            </th>
          </tr>
        </thead>
        <tbody>
          {checklists.map((checklist) => {
            const momento = formatFechaChecklist(checklist.fecha)
            const conAnormales = checklist.anormales > 0
            return (
              <tr key={checklist.id}>
                <td className="whitespace-nowrap tabular-nums">{momento?.fecha ?? 'Sin fecha'}</td>
                <td className="whitespace-nowrap tabular-nums">{momento?.hora ?? '—'}</td>
                <td className="whitespace-nowrap">{getTipoChecklist(checklist.tipo).label}</td>
                {esMaquina && (
                  <td className="text-right whitespace-nowrap tabular-nums">
                    {formatHorasChecklist(checklist.horasMotor, esMaquina)}
                  </td>
                )}
                <td className="break-words">{checklist.responsable || '—'}</td>
                <td className={`text-right tabular-nums ${conAnormales ? 'font-semibold text-brand-700' : 'text-neutral-700'}`}>
                  {conAnormales ? `✕ ${checklist.anormales}` : '0'}
                </td>
                <td className="text-right tabular-nums">{checklist.fotos}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
