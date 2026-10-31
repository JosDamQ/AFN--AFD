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

  // Verificar que las secciones usen EXACTAMENTE mayúsculas (Q, S, i, A, W)
  // Si se detecta alguna en minúscula dar un error claro
  const erroresCaseSensitive: string[] = []
  if (/^q\s*:/m.test(texto))  erroresCaseSensitive.push('"q" debe ser "Q"')
  if (/^s\s*:/m.test(texto))  erroresCaseSensitive.push('"s" debe ser "S"')
  if (/^I\s*:/m.test(texto))  erroresCaseSensitive.push('"I" debe ser "i"')
  if (/^a\s*:/m.test(texto))  erroresCaseSensitive.push('"a" debe ser "A"')
  if (/^w\s*:/m.test(texto))  erroresCaseSensitive.push('"w" debe ser "W"')
  if (erroresCaseSensitive.length > 0) {
    throw new Error(
      `Formato inválido: las secciones deben usar exactamente estas letras: Q, S, i, A, W.\n` +
      `Corregí lo siguiente:\n` +
      erroresCaseSensitive.map((e) => `  • ${e}`).join('\n'),
    )
  }

  //Extraer secciones con regex — sin flag 'i', case sensitive
  const matchQ = texto.match(/Q\s*:\s*\{([^}]+)\}/)
  const matchS = texto.match(/S\s*:\s*\{([^}]+)\}/)
  const matchI = texto.match(/i\s*:\s*([^\n\r;{}]+)/)
  const matchA = texto.match(/A\s*:\s*\{([^}]+)\}/)
  const matchW = texto.match(/W\s*:\s*\{([\s\S]*)\}\s*$/)

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

  // 'e' está reservada exclusivamente para epsilon — no puede ser nombre de estado
  if (nombresEstados.includes('e')) {
    throw new Error(
      `Nombre de estado inválido: "e" está reservada para epsilon y no puede usarse como estado en Q.\n` +
      `Usá otro nombre para ese estado (ej: q1, A, E1, etc.).`,
    )
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
  // Primero validar que las tuplas estén separadas por ';' y no por otros caracteres
  // Se detecta si hay dos tuplas consecutivas sin ';' entre ellas
  const wTrimmed = wContent.trim()
  if (wTrimmed.length > 0) {
    // Buscar si hay una ')' seguida de algo que no sea ';', espacios o fin de string
    // lo que indicaría un separador incorrecto (ej: coma entre tuplas)
    const separadorIncorrecto = /\)\s*[^;\s]/.test(wTrimmed.replace(/\)\s*$/, ''))
    if (separadorIncorrecto) {
      throw new Error(
        `Formato inválido en W: las tuplas deben separarse con punto y coma ";".\n` +
        `Formato correcto: W:{(origen,destino,simbolo);(origen,destino,simbolo);...}`,
      )
    }
  }

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
