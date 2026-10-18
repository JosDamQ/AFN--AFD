import { Estado } from '../models/Estado'
import { Alfabeto } from '../models/Alfabeto'
import { Arista } from '../models/Arista'
import { Automata } from '../models/Automata'

/**
 * Parsea el contenido de un archivo .txt con la quíntupla de un AFD
 * y retorna una instancia de Automata.
 *
 * Formato esperado:
 *   Q:{A1,B,C,D,E}
 *   S:{a,b}
 *   i:A1
 *   A:{C}
 *   W:{(A1,B,a);(A1,D,b);...}
 *
 * @param texto - Contenido del archivo .txt como string
 * @returns instancia de Automata completamente construida
 * @throws Error si el formato es inválido o falta alguna sección
 */
export function parsearArchivo(texto: string): Automata {
  if (!texto || typeof texto !== 'string' || texto.trim() === '') {
    throw new Error('El archivo está vacío o no contiene texto válido.')
  }

  //Extraer secciones con regex
  const matchQ = texto.match(/Q\s*:\s*\{([^}]+)\}/i)
  const matchS = texto.match(/S\s*:\s*\{([^}]+)\}/i)
  const matchI = texto.match(/i\s*:\s*([^\n\r;{}]+)/i)
  const matchA = texto.match(/A\s*:\s*\{([^}]+)\}/i)
  const matchW = texto.match(/W\s*:\s*\{([\s\S]*)\}\s*$/i)

  //Validar que todas las secciones existan
  const secciones: Record<string, RegExpMatchArray | null> = {
    Q: matchQ, S: matchS, i: matchI, A: matchA, W: matchW,
  }
  for (const [clave, match] of Object.entries(secciones)) {
    if (!match) {
      throw new Error(
        `Formato inválido: no se encontró la sección "${clave}" en el archivo.\n` +
        `Asegurate de que el archivo tenga el formato correcto:\n` +
        `Q:{...}  S:{...}  i:...  A:{...}  W:{...}`,
      )
    }
  }

  const qContent = matchQ![1]
  const sContent = matchS![1]
  const iContent = matchI![1]
  const aContent = matchA![1]
  const wContent = matchW![1]

  //Parsear Q
  const nombresEstados = qContent
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (nombresEstados.length === 0) {
    throw new Error('La sección Q no contiene estados válidos.')
  }

  //Parsear S
  const simbolos = sContent
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (simbolos.length === 0) {
    throw new Error('La sección S no contiene símbolos válidos.')
  }

  //Parsear i
  const nombreInicial = iContent.trim()

  if (!nombreInicial) {
    throw new Error('La sección i no contiene un estado inicial válido.')
  }
  if (!nombresEstados.includes(nombreInicial)) {
    throw new Error(
      `El estado inicial "${nombreInicial}" no existe en Q = {${nombresEstados.join(', ')}}.`,
    )
  }

  //Parsear A
  const nombresAceptacion = aContent
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (nombresAceptacion.length === 0) {
    throw new Error('La sección A no contiene estados de aceptación válidos.')
  }
  for (const nombre of nombresAceptacion) {
    if (!nombresEstados.includes(nombre)) {
      throw new Error(
        `El estado de aceptación "${nombre}" no existe en Q = {${nombresEstados.join(', ')}}.`,
      )
    }
  }

  //Parsear W
  const regexTupla = /\(\s*([^,)]+)\s*,\s*([^,)]+)\s*,\s*([^,)]+)\s*\)/g
  const aristas: Arista[] = []
  let tupla: RegExpExecArray | null

  while ((tupla = regexTupla.exec(wContent)) !== null) {
    const origen  = tupla[1].trim()
    const destino = tupla[2].trim()
    const simbolo = tupla[3].trim()

    if (!nombresEstados.includes(origen)) {
      throw new Error(`Arista inválida: el estado de origen "${origen}" no existe en Q.`)
    }
    if (!nombresEstados.includes(destino)) {
      throw new Error(`Arista inválida: el estado de destino "${destino}" no existe en Q.`)
    }
    if (!simbolos.includes(simbolo)) {
      throw new Error(
        `Arista inválida: el símbolo "${simbolo}" no pertenece a Σ = {${simbolos.join(', ')}}.`,
      )
    }

    aristas.push(new Arista(origen, destino, simbolo))
  }

  if (aristas.length === 0) {
    throw new Error('La sección W no contiene aristas válidas.')
  }

  //Construir instancias del modelo
  const alfabeto = new Alfabeto(simbolos)

  const estados = nombresEstados.map(
    (nombre) => new Estado(
      nombre,
      nombre === nombreInicial,
      nombresAceptacion.includes(nombre),
    ),
  )

  const estadoInicial = estados.find((e) => e.nombre === nombreInicial)!
  const estadosAceptacion = estados.filter((e) => nombresAceptacion.includes(e.nombre))

  return new Automata(estados, alfabeto, estadoInicial, estadosAceptacion, aristas)
}
