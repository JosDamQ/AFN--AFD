import { useState, useRef, DragEvent, ChangeEvent, KeyboardEvent } from 'react'
import { parsearArchivo } from '../utils/parser'
import { Automata } from '../models/Automata'
import './DropZone.css'

type DropZoneEstado = 'idle' | 'dragover' | 'loaded' | 'error'

interface DropZoneProps {
  onAutomataLoaded: (automata: Automata | null, textoArchivo: string | null) => void
}

export function DropZone({ onAutomataLoaded }: DropZoneProps) {
  const [estado, setEstado] = useState<DropZoneEstado>('idle')
  const [archivoNombre, setArchivoNombre] = useState<string>('')
  const [mensajeError, setMensajeError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  //Procesar archivo
  const procesarArchivo = (file: File | undefined): void => {
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setEstado('error')
      setMensajeError(
        `"${file.name}" no es un archivo .txt válido. Solo se aceptan archivos de texto plano.`,
      )
      return
    }

    const reader = new FileReader()

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const texto = e.target?.result as string
      try {
        const automata = parsearArchivo(texto)
        setEstado('loaded')
        setArchivoNombre(file.name)
        setMensajeError('')
        onAutomataLoaded(automata, texto)
      } catch (err) {
        setEstado('error')
        setMensajeError(err instanceof Error ? err.message : 'Error desconocido al parsear el archivo.')
        onAutomataLoaded(null, texto)
      }
    }

    reader.onerror = () => {
      setEstado('error')
      setMensajeError('No se pudo leer el archivo. Intentá de nuevo.')
    }

    reader.readAsText(file, 'UTF-8')
  }

  //Handlers drag & drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (estado !== 'dragover') setEstado('dragover')
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setEstado('idle')
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    procesarArchivo(e.dataTransfer.files[0])
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    procesarArchivo(e.target.files?.[0])
    e.target.value = ''
  }

  const handleClick = (): void => {
    inputRef.current?.click()
  }

  const handleReset = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setEstado('idle')
    setArchivoNombre('')
    setMensajeError('')
    onAutomataLoaded(null, null)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') handleClick()
  }

  //Componente HTML
  return (
    <div
      className={`dropzone dropzone--${estado}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={estado !== 'loaded' ? handleClick : undefined}
      role="button"
      tabIndex={0}
      aria-label="Zona para cargar archivo AFD"
      onKeyDown={handleKeyDown}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* ── IDLE ── */}
      {estado === 'idle' && (
        <div className="dropzone__content">
          <div className="dropzone__icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="3" fill="none"/>
              <path d="M22 12V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" stroke="currentColor" strokeWidth="3"/>
              <path d="M32 26v16M24 34l8-8 8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="dropzone__title">Arrastrá tu archivo aquí</p>
          <p className="dropzone__subtitle">o hacé click para seleccionarlo</p>
          <span className="dropzone__badge">Solo archivos .txt</span>
        </div>
      )}

      {/* ── DRAGOVER ── */}
      {estado === 'dragover' && (
        <div className="dropzone__content">
          <div className="dropzone__icon dropzone__icon--animated" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 8v32M20 28l12 12 12-12" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 48h40" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="dropzone__title">¡Soltá el archivo!</p>
        </div>
      )}

      {/* ── LOADED ── */}
      {estado === 'loaded' && (
        <div className="dropzone__content">
          <div className="dropzone__icon dropzone__icon--success" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3"/>
              <path d="M20 32l8 8 16-16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="dropzone__title dropzone__title--success">Archivo cargado</p>
          <p className="dropzone__filename" title={archivoNombre}>{archivoNombre}</p>
          <button className="dropzone__reset-btn" onClick={handleReset} aria-label="Cargar otro archivo">
            Cargar otro archivo
          </button>
        </div>
      )}

      {/* ── ERROR ── */}
      {estado === 'error' && (
        <div className="dropzone__content">
          <div className="dropzone__icon dropzone__icon--error" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3"/>
              <path d="M32 20v14M32 40v2" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="dropzone__title dropzone__title--error">Error al cargar</p>
          <p className="dropzone__error-msg">{mensajeError}</p>
          <button
            className="dropzone__reset-btn dropzone__reset-btn--error"
            onClick={handleReset}
            aria-label="Intentar de nuevo"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}
