import { useState } from 'react'
import './App.css'
import { DropZone } from './components/DropZone'
import { VectoresPanel } from './components/VectoresPanel'
import { MatrizPanel } from './components/MatrizPanel'
import { AfnToAfdPanel } from './components/AfnToAfdPanel'
import { Automata } from './models/Automata'

function App() {
  const [automata, setAutomata] = useState<Automata | null>(null)
  const [textoArchivo, setTextoArchivo] = useState<string | null>(null)

  const handleAutomataLoaded = (nuevoAutomata: Automata | null, texto: string | null): void => {
    setAutomata(nuevoAutomata)
    setTextoArchivo(texto)
  }

  return (
    <div className="app">

      {/* ── Mitad izquierda: fase 1 ── */}
      <div className="app__half app__half--left">

        {/* Fila superior */}
        <div className="app__top">

          {/* Panel drop zone */}
          <div className="app__drop">
            <header className="app__header">
              <svg
                className="app__logo"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="6"  cy="16" r="4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="26" cy="8"  r="4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="26" cy="24" r="4" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
                <path d="M10 14.5l12-5M10 17.5l12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="26" cy="24" r="2.2" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <h1 className="app__title">
                Conversor <span>AFN → AFD</span>
              </h1>
            </header>

          <div className="app__dropzone-wrapper">
              <DropZone onAutomataLoaded={handleAutomataLoaded} />
            </div>

            {/* Contenido del archivo */}
          {textoArchivo && (
            <div className="app__archivo">
              <p className="app__archivo-label">Despliegue de Archivo</p>
              <pre className="app__archivo-content">{textoArchivo}</pre>
            </div>
          )}
          </div>

          {/* Panel vectores Q, S, A */}
          <div className="app__vectores">
            <VectoresPanel automata={automata} />
          </div>

        </div>

        {/* Fila inferior: matriz de transición */}
        <div className="app__bottom">
          <div className="app__matriz">
            <MatrizPanel automata={automata} />
          </div>
        </div>

        {/* Firma */}
        <footer className="app__footer">
          <span className="app__footer-name">Josue Damian Garcia Quiñonez</span>
          <span className="app__footer-divider" aria-hidden="true">·</span>
          <span className="app__footer-carnet">9490-24-4256</span>
        </footer>

      </div>

      {/* ── Mitad derecha: conversión AFN → AFD ── */}
      <div className="app__half app__half--right">
        <AfnToAfdPanel automata={automata} />
      </div>

    </div>
  )
}

export default App
