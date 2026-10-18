import { Automata } from '../models/Automata'
import './MatrizPanel.css'

interface MatrizPanelProps {
  automata: Automata | null
}

/**
 * Panel que muestra la función de transición δ (W) del AFD como tabla.
 * Filas = estados (Q), Columnas = símbolos del alfabeto (S).
 */
export function MatrizPanel({ automata }: MatrizPanelProps) {
  if (!automata) {
    return (
      <div className="matriz-panel matriz-panel--empty">
        <p className="matriz-panel__placeholder">
          Cargá un archivo para ver la matriz de transición
        </p>
      </div>
    )
  }

  const estados  = automata.estados
  const simbolos = automata.alfabeto.getSimbolos()
  const matriz   = automata.buildMatriz()

  return (
    <div className="matriz-panel">
      <h2 className="matriz-panel__title">
        Función de Transición
        <span className="matriz-panel__title-delta" aria-hidden="true"> δ (W)</span>
      </h2>

      <div className="matriz-panel__scroll-wrapper">
        <table className="matriz-tabla" role="table" aria-label="Tabla de transición del autómata">
          <thead>
            <tr>
              <th className="matriz-tabla__corner" scope="col" aria-label="Estado / Símbolo">
                <span className="corner__estado" aria-hidden="true">δ</span>
                <span className="corner__divider" aria-hidden="true" />
                <span className="corner__simbolo" aria-hidden="true">σ</span>
              </th>
              {simbolos.map((simbolo) => (
                <th key={simbolo} className="matriz-tabla__th-simbolo" scope="col">
                  {simbolo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {estados.map((estado) => {
              const esAceptacion = automata.esEstadoAceptacion(estado.nombre)
              const esInicial    = automata.esEstadoInicial(estado.nombre)

              return (
                <tr
                  key={estado.nombre}
                  className={[
                    'matriz-tabla__row',
                    esAceptacion ? 'matriz-tabla__row--aceptacion' : '',
                    esInicial    ? 'matriz-tabla__row--inicial'    : '',
                  ].filter(Boolean).join(' ')}
                >
                  <th
                    className="matriz-tabla__th-estado"
                    scope="row"
                    title={
                      esAceptacion && esInicial ? 'Estado inicial y de aceptación' :
                      esAceptacion              ? 'Estado de aceptación'           :
                      esInicial                 ? 'Estado inicial'                 : ''
                    }
                  >
                    <span className="estado-cell">
                      {esInicial && (
                        <span className="estado-cell__badge estado-cell__badge--inicial" aria-label="Estado inicial">→</span>
                      )}
                      <span className="estado-cell__nombre">{estado.nombre}</span>
                      {esAceptacion && (
                        <span className="estado-cell__badge estado-cell__badge--aceptacion" aria-label="Estado de aceptación">*</span>
                      )}
                    </span>
                  </th>

                  {simbolos.map((simbolo) => {
                    const destinos = matriz[estado.nombre]?.[simbolo] ?? []
                    const hayDestinos = destinos.length > 0
                    const esDestinoAceptacion = destinos.some((d) => automata.esEstadoAceptacion(d))
                    const textoDestinos = destinos.length > 0
                      ? destinos.join(',')
                      : undefined

                    return (
                      <td
                        key={simbolo}
                        className={[
                          'matriz-tabla__td',
                          !hayDestinos        ? 'matriz-tabla__td--vacia'      : '',
                          esDestinoAceptacion ? 'matriz-tabla__td--aceptacion' : '',
                        ].filter(Boolean).join(' ')}
                        aria-label={
                          hayDestinos
                            ? `δ(${estado.nombre}, ${simbolo}) = ${textoDestinos}`
                            : `δ(${estado.nombre}, ${simbolo}) no definida`
                        }
                      >
                        {textoDestinos ?? '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Leyenda ── */}
      <div className="matriz-panel__leyenda" aria-label="Leyenda de la tabla">
        <span className="leyenda__item">
          <span className="leyenda__swatch leyenda__swatch--inicial">→</span>
          Estado inicial
        </span>
        <span className="leyenda__item">
          <span className="leyenda__swatch leyenda__swatch--aceptacion">*</span>
          Estado de aceptación
        </span>
        <span className="leyenda__item">
          <span className="leyenda__swatch leyenda__swatch--vacia">—</span>
          Transición no definida
        </span>
      </div>
    </div>
  )
}
