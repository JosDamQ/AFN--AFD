import { Automata, MatrizTransicion } from '../models/Automata'

export interface EstadoAfd {
  nombre: string
  composicion: string[]
  esInicial: boolean
  esAceptacion: boolean
}

export interface AfnToAfdResult {
  estados: EstadoAfd[]
  alfabeto: string[]
  estadoInicial: EstadoAfd
  estadosAceptacion: EstadoAfd[]
  /** [nombreEstadoAfd][simbolo] = nombreEstadoAfdDestino */
  transiciones: Record<string, Record<string, string>>
}

function conjuntoKey(estados: string[]): string {
  return [...estados].sort().join(',')
}

function cerraduraEpsilon(
  conjuntoEstados: string[],
  matrizAfn: MatrizTransicion,
  epsilon: string,
): string[] {
  const visitados = new Set<string>(conjuntoEstados)
  const pila = [...conjuntoEstados]

  while (pila.length > 0) {
    const actual = pila.pop()!
    const destinosEpsilon = matrizAfn[actual]?.[epsilon] ?? []
    for (const destino of destinosEpsilon) {
      if (!visitados.has(destino)) {
        visitados.add(destino)
        pila.push(destino)
      }
    }
  }

  return [...visitados].sort()
}

function mover(
  conjuntoEstados: string[],
  simbolo: string,
  matrizAfn: MatrizTransicion,
): string[] {
  const resultado = new Set<string>()
  for (const estado of conjuntoEstados) {
    const destinos = matrizAfn[estado]?.[simbolo] ?? []
    for (const d of destinos) {
      resultado.add(d)
    }
  }
  return [...resultado].sort()
}

/**
 * Convierte un Autómata Finito No-determinista (con transiciones ε) en un
 * Autómata Finito Determinista equivalente usando el algoritmo de cerradura-ε.
 */
export function convertirAfnAfd(afn: Automata): AfnToAfdResult {
  const EPSILON = 'e'

  const alfabetoAfn = afn.alfabeto.getSimbolos()
  const alfabetoAfd = alfabetoAfn.filter((s) => s !== EPSILON)

  const aceptacionAfn = new Set(afn.estadosAceptacion.map((e) => e.nombre))

  const matrizAfn = afn.buildMatriz()

  const keyANombre = new Map<string, string>()
  const estadosAfd: EstadoAfd[] = []
  const transicionesAfd: Record<string, Record<string, string>> = {}

  let codigoLetra = 65
  const siguienteLetra = (): string => String.fromCharCode(codigoLetra++)

  const obtenerOCrearEstado = (composicion: string[], esInicial = false): EstadoAfd => {
    const key = conjuntoKey(composicion)
    if (keyANombre.has(key)) {
      return estadosAfd.find((e) => e.nombre === keyANombre.get(key))!
    }

    const nombre = siguienteLetra()
    keyANombre.set(key, nombre)

    const esAceptacion = composicion.some((s) => aceptacionAfn.has(s))
    const nuevoEstado: EstadoAfd = { nombre, composicion, esInicial, esAceptacion }
    estadosAfd.push(nuevoEstado)
    transicionesAfd[nombre] = {}
    return nuevoEstado
  }

  const t0 = cerraduraEpsilon([afn.estadoInicial.nombre], matrizAfn, EPSILON)
  const estadoInicial = obtenerOCrearEstado(t0, true)

  const cola: EstadoAfd[] = [estadoInicial]
  const marcados = new Set<string>()

  while (cola.length > 0) {
    const estadoActual = cola.shift()!

    if (marcados.has(estadoActual.nombre)) continue
    marcados.add(estadoActual.nombre)

    for (const simbolo of alfabetoAfd) {
      const movidos = mover(estadoActual.composicion, simbolo, matrizAfn)
      const u = cerraduraEpsilon(movidos, matrizAfn, EPSILON)

      const estadoDestino = obtenerOCrearEstado(u)

      transicionesAfd[estadoActual.nombre][simbolo] = estadoDestino.nombre

      if (!marcados.has(estadoDestino.nombre)) {
        cola.push(estadoDestino)
      }
    }
  }

  const estadosAceptacion = estadosAfd.filter((e) => e.esAceptacion)

  return {
    estados: estadosAfd,
    alfabeto: alfabetoAfd,
    estadoInicial,
    estadosAceptacion,
    transiciones: transicionesAfd,
  }
}

/**
 * Simula la ejecución de una cadena sobre el AFD resultante.
 * Retorna true si la cadena es aceptada, false si no lo es.
 */
export function validarCadena(cadena: string, result: AfnToAfdResult): boolean {
  let estadoActual = result.estadoInicial.nombre

  for (const simbolo of cadena) {
    if (!result.alfabeto.includes(simbolo)) return false
    const destino = result.transiciones[estadoActual]?.[simbolo]
    if (!destino) return false
    estadoActual = destino
  }

  return result.estados.find((e) => e.nombre === estadoActual)?.esAceptacion ?? false
}
