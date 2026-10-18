export class Arista {
  private readonly _origen: string
  private readonly _destino: string
  private readonly _simbolo: string

  constructor(origen: string, destino: string, simbolo: string) {
    this._origen = origen.trim()
    this._destino = destino.trim()
    this._simbolo = simbolo.trim()
  }

  get origen(): string {
    return this._origen
  }

  get destino(): string {
    return this._destino
  }

  get simbolo(): string {
    return this._simbolo
  }

  toString(): string {
    return `(${this._origen}, ${this._destino}, ${this._simbolo})`
  }
}
