import { Estado } from './Estado'
import { Alfabeto } from './Alfabeto'
import { Arista } from './Arista'

export type MatrizTransicion = Record<string, Record<string, string[]>>

/**
 * Representa un Autómata Finito Determinista (AFD).
 * Encapsula la quíntupla completa: (Q, Σ, δ, q0, F)
 *   Q  = estados
 *   Σ  = alfabeto
 *   δ  = función de transición (W)
 *   q0 = estado inicial (i)
 *   F  = estados de aceptación (A)
 */
export class Automata {
  private readonly _estados: Estado[]
  private readonly _alfabeto: Alfabeto
  private readonly _estadoInicial: Estado
  private readonly _estadosAceptacion: Estado[]
  private readonly _transiciones: Arista[]
  private _matriz: MatrizTransicion | null = null

  constructor(
    estados: Estado[],
    alfabeto: Alfabeto,
    estadoInicial: Estado,
    estadosAceptacion: Estado[],
    transiciones: Arista[],
  ) {
    this._estados = estados
    this._alfabeto = alfabeto
    this._estadoInicial = estadoInicial
    this._estadosAceptacion = estadosAceptacion
    this._transiciones = transiciones
  }

  get estados(): Estado[] {
    return [...this._estados]
  }

  get alfabeto(): Alfabeto {
    return this._alfabeto
  }

  get estadoInicial(): Estado {
    return this._estadoInicial
  }

  get estadosAceptacion(): Estado[] {
    return [...this._estadosAceptacion]
  }

  get transiciones(): Arista[] {
    return [...this._transiciones]
  }
  /**
   * Devuelve la matriz de transición del autómata.
   * Si la matriz ya fue calculada anteriormente, se devuelve la versión en cache.
   * De lo contrario, se construye la matriz y se guarda en cache para futuras llamadas.
   */
  buildMatriz(): MatrizTransicion {
    if (this._matriz) return this._matriz

    const matriz: MatrizTransicion = {}

    for (const estado of this._estados) {
      matriz[estado.nombre] = {}
    }

    for (const transicion of this._transiciones) {
      if (!matriz[transicion.origen]) {
        matriz[transicion.origen] = {}
      }
      if (!matriz[transicion.origen][transicion.simbolo]) {
        matriz[transicion.origen][transicion.simbolo] = []
      }
      matriz[transicion.origen][transicion.simbolo].push(transicion.destino)
    }

    this._matriz = matriz
    return this._matriz
  }

  esEstadoAceptacion(nombreEstado: string): boolean {
    return this._estadosAceptacion.some((e) => e.nombre === nombreEstado)
  }

  esEstadoInicial(nombreEstado: string): boolean {
    return this._estadoInicial.nombre === nombreEstado
  }

  toString(): string {
    return [
      `Q = {${this._estados.map((e) => e.nombre).join(', ')}}`,
      `Σ = ${this._alfabeto.toString()}`,
      `q0 = ${this._estadoInicial.nombre}`,
      `F = {${this._estadosAceptacion.map((e) => e.nombre).join(', ')}}`,
      `|δ| = ${this._transiciones.length} aristas`,
    ].join('\n')
  }
}
