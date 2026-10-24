import { useState, useCallback } from 'react'
import { Automata } from '../models/Automata'
import { convertirAfnAfd, validarCadena, AfnToAfdResult } from '../utils/afnToAfd'
import './AfnToAfdPanel.css'

interface AfnToAfdPanelProps {
  automata: Automata | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Validador de cadenas
// ─────────────────────────────────────────────────────────────────────────────

interface ValidadorProps {
  result: AfnToAfdResult
}

function Validador({ result }: ValidadorProps) {
  const [cadena, setCadena] = useState('')
  const [estadoValidacion, setEstadoValidacion] = useState<'valida' | 'invalida' | null>(null)

  const ejecutarValidacion = useCallback(() => {
    const esValida = validarCadena(cadena, result)
    setEstadoValidacion(esValida ? 'valida' : 'invalida')
  }, [cadena, result])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') ejecutarValidacion()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCadena(e.target.value)
    // Limpiar resultado al escribir
    setEstadoValidacion(null)
  }

  return (
    <div className="afn-afd-panel__section">
      <p className="validador__label">Validar cadena</p>

      <div className="validador__row">
        <input
          className="validador__input"
          type="text"
          value={cadena}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ingresá una cadena y presioná Enter…"
          aria-label="Cadena a validar"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          className="validador__btn"
          onClick={ejecutarValidacion}
          aria-label="Validar cadena"
        >
          Validar
        </button>
      </div>

      {estadoValidacion !== null && (
        <p
          className={`validador__resultado validador__resultado--${estadoValidacion}`}
          role="status"
          aria-live="polite"
        >
          {estadoValidacion === 'valida'
            ? `✓ Cadena "${cadena}" es válida`
            : `✗ Cadena "${cadena}" es inválida`}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Cuadro quintupla
// ─────────────────────────────────────────────────────────────────────────────

interface QuintuplaProps {
  result: AfnToAfdResult
}

function CuadroQuintupla({ result }: QuintuplaProps) {
  const { estados, alfabeto, estadoInicial, estadosAceptacion } = result

  const listaQ = estados
    .map((e) => {
      const badges = []
      if (e.esInicial)    badges.push(<span key="i" className="quintupla__badge">→</span>)
      if (e.esAceptacion) badges.push(<span key="a" className="quintupla__badge">*</span>)
      return (
        <span key={e.nombre} style={{ marginRight: '6px', whiteSpace: 'nowrap' }}>
          {badges}{e.nombre}
        </span>
      )
    })

  const listaSigma = alfabeto.join(', ')

  const listai = (
    <>
      <span className="quintupla__badge">→</span>
      {estadoInicial.nombre}
    </>
  )

  const listaA = estadosAceptacion.map((e) => (
    <span key={e.nombre} style={{ marginRight: '6px', whiteSpace: 'nowrap' }}>
      <span className="quintupla__badge">*</span>{e.nombre}
    </span>
  ))

  return (
    <div className="afn-afd-panel__section">
      <p className="quintupla__title">AFD Resultante</p>

      <table className="quintupla__tabla" aria-label="Quintupla del AFD resultante">
        <tbody>
          <tr className="quintupla__fila">
            <td className="quintupla__celda-label" title="Conjunto de estados">Q</td>
            <td className="quintupla__celda-valor">
              {'{'}
              {listaQ.map((el, i) => (
                <span key={i}>{el}{i < listaQ.length - 1 ? ', ' : ''}</span>
              ))}
              {'}'}
            </td>
          </tr>
          <tr className="quintupla__fila">
            <td className="quintupla__celda-label" title="Alfabeto">Σ</td>
            <td className="quintupla__celda-valor">{'{'}{listaSigma}{'}'}</td>
          </tr>
          <tr className="quintupla__fila">
            <td className="quintupla__celda-label" title="Estado inicial">i</td>
            <td className="quintupla__celda-valor">{listai}</td>
          </tr>
          <tr className="quintupla__fila">
            <td className="quintupla__celda-label" title="Estados de aceptación">A</td>
            <td className="quintupla__celda-valor">
              {'{'}
              {listaA.map((el, i) => (
                <span key={i}>{el}{i < listaA.length - 1 ? ', ' : ''}</span>
              ))}
              {'}'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Tabla de transición W del AFD
// ─────────────────────────────────────────────────────────────────────────────

interface TablaWProps {
  result: AfnToAfdResult
}

function TablaW({ result }: TablaWProps) {
  const { estados, alfabeto, transiciones } = result

  return (
    <div className="afd-tabla-section">
      <h2 className="afd-tabla__title">
        Función de Transición
        <span className="afd-tabla__title-delta" aria-hidden="true"> δ (W)</span>
      </h2>

      <div className="afd-tabla__scroll-wrapper">
        <table className="afd-tabla" role="table" aria-label="Tabla de transición del AFD resultante">
          <thead>
            <tr>
              {/* Esquina diagonal */}
              <th className="afd-tabla__corner" scope="col" aria-label="Estado / Símbolo">
                <span className="corner__estado" aria-hidden="true">δ</span>
                <span className="corner__divider" aria-hidden="true" />
                <span className="corner__simbolo" aria-hidden="true">σ</span>
              </th>

              {/* Headers de símbolos */}
              {alfabeto.map((simbolo) => (
                <th key={simbolo} className="afd-tabla__th-simbolo" scope="col">
                  {simbolo}
                </th>
              ))}

              {/* Header composición */}
              <th className="afd-tabla__th-composicion" scope="col">
                Composición
              </th>
            </tr>
          </thead>

          <tbody>
            {estados.map((estado) => {
              const composicionTexto =
                estado.composicion.length > 0
                  ? `{${estado.composicion.join(',')}}`
                  : null // null = estado vacío ∅

              return (
                <tr key={estado.nombre} className="afd-tabla__row">
                  {/* Celda del estado */}
                  <th
                    className="afd-tabla__th-estado"
                    scope="row"
                    title={
                      estado.esAceptacion && estado.esInicial
                        ? 'Estado inicial y de aceptación'
                        : estado.esAceptacion
                          ? 'Estado de aceptación'
                          : estado.esInicial
                            ? 'Estado inicial'
                            : ''
                    }
                  >
                    <span className="afd-estado-cell">
                      {estado.esInicial && (
                        <span className="afd-estado-cell__badge" aria-label="Estado inicial">→</span>
                      )}
                      <span>{estado.nombre}</span>
                      {estado.esAceptacion && (
                        <span className="afd-estado-cell__badge" aria-label="Estado de aceptación">*</span>
                      )}
                    </span>
                  </th>

                  {/* Celdas de transición por símbolo */}
                  {alfabeto.map((simbolo) => {
                    const destino = transiciones[estado.nombre]?.[simbolo]
                    return (
                      <td
                        key={simbolo}
                        className="afd-tabla__td"
                        aria-label={
                          destino
                            ? `δ(${estado.nombre}, ${simbolo}) = ${destino}`
                            : `δ(${estado.nombre}, ${simbolo}) no definida`
                        }
                      >
                        {destino ?? '—'}
                      </td>
                    )
                  })}

                  {/* Celda de composición */}
                  <td
                    className={[
                      'afd-tabla__td-composicion',
                      composicionTexto === null ? 'afd-tabla__td-composicion--vacia' : '',
                    ].filter(Boolean).join(' ')}
                    aria-label={`Composición de ${estado.nombre}: ${composicionTexto ?? '∅'}`}
                  >
                    {composicionTexto ?? '∅'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="afd-tabla__leyenda" aria-label="Leyenda de la tabla">
        <span className="afd-leyenda__item">
          <span className="afd-leyenda__swatch">→</span>
          Estado inicial
        </span>
        <span className="afd-leyenda__item">
          <span className="afd-leyenda__swatch">*</span>
          Estado de aceptación
        </span>
        <span className="afd-leyenda__item">
          <span className="afd-leyenda__swatch" style={{ fontStyle: 'italic' }}>∅</span>
          Estado vacío
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export function AfnToAfdPanel({ automata }: AfnToAfdPanelProps) {
  if (!automata) {
    return (
      <div className="afn-afd-panel afn-afd-panel--empty">
        <p className="afn-afd-panel__placeholder">
          Cargá un archivo para ver la conversión AFN → AFD
        </p>
      </div>
    )
  }

  const result = convertirAfnAfd(automata)

  return (
    <div className="afn-afd-panel">
      <Validador result={result} />
      <CuadroQuintupla result={result} />
      <TablaW result={result} />
    </div>
  )
}
