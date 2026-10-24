import { Automata, MatrizTransicion } from '../models/Automata'

// ─────────────────────────────────────────────────────────────────────────────
// Tipos exportados
// ─────────────────────────────────────────────────────────────────────────────

export interface EstadoAfd {
  nombre: string        // letra asignada: 'A', 'B', 'C' …
  composicion: string[] // estados del AFN que lo componen; [] = estado vacío (∅)
  esInicial: boolean
  esAceptacion: boolean
}

export interface AfnToAfdResult {
  estados: EstadoAfd[]
  alfabeto: string[]    // símbolos reales del AFD (sin epsilon)
  estadoInicial: EstadoAfd
  estadosAceptacion: EstadoAfd[]
  /** [nombreEstadoAfd][simbolo] = nombreEstadoAfdDestino */
  transiciones: Record<string, Record<string, string>>
}

// ─────────────────────────────────────────────────────────────────────────────
// Auxiliar: key canónica de un conjunto de estados (para detectar duplicados)
// ─────────────────────────────────────────────────────────────────────────────

function conjuntoKey(estados: string[]): string {
  return [...estados].sort().join(',')
}

// ─────────────────────────────────────────────────────────────────────────────
// Cerradura-ε
//   Dado un conjunto de estados del AFN, devuelve todos los estados alcanzables
//   usando únicamente transiciones epsilon (incluyendo los estados de partida).
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Mover
//   Para un conjunto de estados del AFN y un símbolo, devuelve el conjunto
//   de estados alcanzables usando exactamente esa transición.
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Función principal: Algoritmo AFN → AFD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convierte un Autómata Finito No-determinista (con transiciones ε) en un
 * Autómata Finito Determinista equivalente usando el algoritmo de cerradura-ε.
 *
 * Supuestos:
 *  - El símbolo epsilon es 'e' (siempre listado en el alfabeto del AFN).
 *  - Los estados del AFD se nombran con letras A, B, C … en orden de descubrimiento.
 *  - El estado vacío (∅) se incluye si alguna transición no lleva a ningún estado.
 *  - Un estado del AFD es de aceptación si su composición contiene algún estado
 *    de aceptación del AFN.
 */
export function convertirAfnAfd(afn: Automata): AfnToAfdResult {
  const EPSILON = 'e'

  // Alfabeto del AFD = alfabeto del AFN sin epsilon
  const alfabetoAfn = afn.alfabeto.getSimbolos()
  const alfabetoAfd = alfabetoAfn.filter((s) => s !== EPSILON)

  // Conjunto de nombres de estados de aceptación del AFN
  const aceptacionAfn = new Set(afn.estadosAceptacion.map((e) => e.nombre))

  const matrizAfn = afn.buildMatriz()

  // ── Estructura de trabajo ──────────────────────────────────────────────────
  //   keyANombre : key canónica del conjunto → nombre de letra asignado
  //   estados    : lista de EstadoAfd en orden de descubrimiento
  //   transiciones: [nombreAfd][simbolo] = nombreAfdDestino
  const keyANombre = new Map<string, string>()
  const estadosAfd: EstadoAfd[] = []
  const transicionesAfd: Record<string, Record<string, string>> = {}

  let codigoLetra = 65 // 'A'
  const siguienteLetra = (): string => String.fromCharCode(codigoLetra++)

  // Función para crear o recuperar un EstadoAfd a partir de su composición
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

  // ── Paso 1: T0 = cerradura-ε del estado inicial ───────────────────────────
  const t0 = cerraduraEpsilon([afn.estadoInicial.nombre], matrizAfn, EPSILON)
  const estadoInicial = obtenerOCrearEstado(t0, true)

  // ── Paso 2: cola de estados sin marcar ────────────────────────────────────
  const cola: EstadoAfd[] = [estadoInicial]
  const marcados = new Set<string>()

  while (cola.length > 0) {
    const estadoActual = cola.shift()!

    if (marcados.has(estadoActual.nombre)) continue
    marcados.add(estadoActual.nombre)

    for (const simbolo of alfabetoAfd) {
      // U = cerradura-ε(mover(T, simbolo))
      const movidos = mover(estadoActual.composicion, simbolo, matrizAfn)
      const u = cerraduraEpsilon(movidos, matrizAfn, EPSILON)

      // Obtener o crear el estado destino (u puede ser [] si es vacío)
      const estadoDestino = obtenerOCrearEstado(u)

      transicionesAfd[estadoActual.nombre][simbolo] = estadoDestino.nombre

      // Si es un estado nuevo, agregarlo a la cola
      if (!marcados.has(estadoDestino.nombre)) {
        cola.push(estadoDestino)
      }
    }
  }

  // El estado vacío (∅) se auto-absorbe: todas sus transiciones van a sí mismo
  // Esto ya queda resuelto porque cuando composicion=[] y se llama mover([],x) = []
  // y cerradura([])= [], por lo que la key "" siempre apunta al mismo estado vacío.

  const estadosAceptacion = estadosAfd.filter((e) => e.esAceptacion)

  return {
    estados: estadosAfd,
    alfabeto: alfabetoAfd,
    estadoInicial,
    estadosAceptacion,
    transiciones: transicionesAfd,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validador de cadenas sobre el AFD resultante
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simula la ejecución de una cadena sobre el AFD resultante.
 * Retorna true si la cadena es aceptada, false si no lo es.
 *
 * Casos especiales:
 *  - Cadena vacía: válida si el estado inicial es de aceptación.
 *  - Símbolo fuera del alfabeto del AFD: inválida inmediatamente.
 *  - Transición no definida (no debería ocurrir si el estado vacío está incluido): inválida.
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
