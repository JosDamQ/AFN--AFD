export class Estado {
  private readonly _nombre: string
  private _esInicial: boolean
  private _esAceptacion: boolean

  constructor(nombre: string, esInicial = false, esAceptacion = false) {
    this._nombre = nombre.trim()
    this._esInicial = esInicial
    this._esAceptacion = esAceptacion
  }

  get nombre(): string {
    return this._nombre
  }

  get esInicial(): boolean {
    return this._esInicial
  }

  get esAceptacion(): boolean {
    return this._esAceptacion
  }

  set esInicial(valor: boolean) {
    this._esInicial = valor
  }

  set esAceptacion(valor: boolean) {
    this._esAceptacion = valor
  }

  toString(): string {
    return this._nombre
  }
}
