export class Alfabeto {
  private readonly _simbolos: string[]

  constructor(simbolos: string[]) {
    if (!Array.isArray(simbolos) || simbolos.length === 0) {
      throw new Error('El alfabeto debe contener al menos un símbolo.')
    }
    this._simbolos = simbolos.map((s) => s.trim())
  }

  getSimbolos(): string[] {
    return [...this._simbolos]
  }

  contiene(simbolo: string): boolean {
    return this._simbolos.includes(simbolo.trim())
  }

  get size(): number {
    return this._simbolos.length
  }

  toString(): string {
    return `{${this._simbolos.join(', ')}}`
  }
}
