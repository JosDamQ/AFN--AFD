import { Automata } from '../models/Automata'
import './VectoresPanel.css'

interface VectoresPanelProps {
  automata: Automata | null
}

type ChipVariant = 'default' | 'inicial' | 'aceptacion' | 'both' | 'simbolo'

interface ChipItem {
  texto: string
  esInicial: boolean
  esAceptacion: boolean
  variant: ChipVariant
}

/**
 * Panel que muestra los vectores Q, S y A como columnas independientes,
 * cada una con su label y sus elementos apilados verticalmente.
 */
export function VectoresPanel({ automata }: VectoresPanelProps) {
  if (!automata) {
    return (
      <div className="vectores-panel vectores-panel--empty">
        <p className="vectores-panel__placeholder">
          Cargá un archivo para ver los vectores
        </p>
      </div>
    )
  }

  const estados           = automata.estados
  const simbolos          = automata.alfabeto.getSimbolos()
  const estadosAceptacion = automata.estadosAceptacion

  const columnasQ: ChipItem[] = estados.map((estado) => {
    const esInicial    = automata.esEstadoInicial(estado.nombre)
    const esAceptacion = automata.esEstadoAceptacion(estado.nombre)
    const variant: ChipVariant =
      esInicial && esAceptacion ? 'both'
      : esInicial               ? 'inicial'
      : esAceptacion            ? 'aceptacion'
      :                           'default'
    return { texto: estado.nombre, esInicial, esAceptacion, variant }
  })

  const columnasS: ChipItem[] = simbolos.map((s) => ({
    texto: s, esInicial: false, esAceptacion: false, variant: 'simbolo',
  }))

  const columnasA: ChipItem[] = estadosAceptacion.map((estado) => ({
    texto: estado.nombre, esInicial: false, esAceptacion: true, variant: 'aceptacion',
  }))

  return (
    <div className="vectores-panel">
      <h2 className="vectores-panel__title">Vectores del Autómata</h2>

      <div className="vectores-columnas">

        {/* ── Columna Q ── */}
        <div className="vector-col vector-col--q">
          <div className="vector-col__header">
            <span className="vector-col__letter">Q</span>
          </div>
          <div className="vector-col__items" role="list" aria-label="Estados Q">
            {columnasQ.map((item) => (
              <span
                key={item.texto}
                className={`chip chip--${item.variant}`}
                role="listitem"
                title={
                  item.variant === 'both'       ? 'Estado inicial y de aceptación' :
                  item.variant === 'inicial'    ? 'Estado inicial'                 :
                  item.variant === 'aceptacion' ? 'Estado de aceptación'           : ''
                }
              >
                {item.esInicial    && <span className="chip__indicator chip__indicator--inicial"    aria-hidden="true">→</span>}
                {item.texto}
                {item.esAceptacion && <span className="chip__indicator chip__indicator--aceptacion" aria-hidden="true">*</span>}
              </span>
            ))}
          </div>
        </div>

        {/* ── Columna S ── */}
        <div className="vector-col vector-col--s">
          <div className="vector-col__header">
            <span className="vector-col__letter">S</span>
          </div>
          <div className="vector-col__items" role="list" aria-label="Símbolos del alfabeto S">
            {columnasS.map((item) => (
              <span key={item.texto} className="chip chip--simbolo" role="listitem">
                {item.texto}
              </span>
            ))}
          </div>
        </div>

        {/* ── Columna A ── */}
        <div className="vector-col vector-col--a">
          <div className="vector-col__header">
            <span className="vector-col__letter">A</span>
          </div>
          <div className="vector-col__items" role="list" aria-label="Estados de aceptación A">
            {columnasA.map((item) => (
              <span
                key={item.texto}
                className="chip chip--aceptacion"
                role="listitem"
                title="Estado de aceptación"
              >
                {item.texto}
                <span className="chip__indicator chip__indicator--aceptacion" aria-hidden="true">*</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ── Leyenda ── */}
      <div className="vectores-panel__leyenda" aria-label="Leyenda">
        <span className="leyenda__item">
          <span className="leyenda__dot leyenda__dot--inicial">→</span>
          Estado inicial
        </span>
        <span className="leyenda__item">
          <span className="leyenda__dot leyenda__dot--aceptacion">*</span>
          Estado de aceptación
        </span>
      </div>
    </div>
  )
}
