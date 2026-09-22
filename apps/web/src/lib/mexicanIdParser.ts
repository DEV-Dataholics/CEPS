/**
 * Decodificador Oficial de Documentos de Identidad Mexicanos (CURP y RFC)
 * CEPS Paso del Norte — Seguridad Privada y Custodia Especializada
 *
 * Cumple con la normativa técnica de RENAPO (Secretaría de Gobernación)
 * y el SAT (Servicio de Administración Tributaria).
 */

export interface ExtractedCurpData {
  curp: string
  esValida: boolean
  fechaNacimiento: string // Formato: DD/MM/AAAA
  fechaIso: string // Formato: AAAA-MM-DD
  edad: number
  sexo: 'Masculino' | 'Femenino'
  claveEntidad: string
  nombreEntidad: string
  rfcBase: string // 10 caracteres (4 letras + 6 números de fecha)
  rfcCompleto?: string // 13 caracteres si se escaneó constancia SAT

  // Nombre Completo Oficial Extraído
  nombre?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  nombreCompleto?: string

  // Domicilio Oficial SAT o Capturado
  domicilio?: {
    calle?: string
    tipoVialidad?: string
    numeroExterior?: string
    numeroInterior?: string
    calleNumero: string
    colonia: string
    codigoPostal: string
    municipio?: string
    ciudad?: string
    estado?: string
    direccionCompleta?: string
  }
  situacionFiscal?: string
  regimenesFiscales?: string[]
  origenDocumento?: 'renapo_qr' | 'renapo_barcode' | 'sat_qr' | 'sat_directo' | 'manual'
}

export const ENTIDADES_FEDERATIVAS_MEXICO: Record<string, string> = {
  AS: 'Aguascalientes',
  BC: 'Baja California',
  BS: 'Baja California Sur',
  CC: 'Campeche',
  CL: 'Coahuila',
  CM: 'Colima',
  CS: 'Chiapas',
  CH: 'Chihuahua',
  DF: 'Ciudad de México',
  DG: 'Durango',
  GT: 'Guanajuato',
  GR: 'Guerrero',
  HG: 'Hidalgo',
  JC: 'Jalisco',
  MC: 'Estado de México',
  MN: 'Michoacán',
  MS: 'Morelos',
  NT: 'Nayarit',
  NL: 'Nuevo León',
  OC: 'Oaxaca',
  PL: 'Puebla',
  QT: 'Querétaro',
  QR: 'Quintana Roo',
  SP: 'San Luis Potosí',
  SL: 'Sinaloa',
  SR: 'Sonora',
  TC: 'Tabasco',
  TS: 'Tamaulipas',
  TL: 'Tlaxcala',
  VZ: 'Veracruz',
  YN: 'Yucatán',
  ZS: 'Zacatecas',
  NE: 'Nacido en el Extranjero',
}

// Expresión regular oficial de RENAPO para validación de CURP (18 posiciones)
export const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/

// Expresión regular oficial del SAT para RFC de Personas Físicas (13 posiciones)
export const RFC_REGEX = /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/

/**
 * Limpia y normaliza texto crudo obtenido de escáneres QR, códigos de barras o enlaces RENAPO
 */
export function normalizarTextoEscaneado(rawText: string): string {
  if (!rawText) return ''
  const cleaned = rawText.trim().toUpperCase()

  // Si el escáner capturó una URL de consulta de CURP
  if (cleaned.includes('CURP=')) {
    const match = cleaned.match(/CURP=([A-Z0-9]{18})/i)
    if (match && match[1]) {
      return match[1].toUpperCase()
    }
  }

  // Si la cadena contiene caracteres no alfanuméricos, extraer la secuencia de 18 caracteres de CURP
  const matchDirecto = cleaned.match(/[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d/)
  if (matchDirecto) {
    return matchDirecto[0]
  }

  return cleaned.replace(/[^A-Z0-9]/g, '')
}

/**
 * Corrige la inversión de 'Z' y 'Y' producida por lectores de código
 * de barras configurados con emulación de teclado alemán (QWERTZ).
 */
export function corregirInversionYZ(cadena: string): string {
  if (!cadena) return ''
  return cadena
    .split('')
    .map((char) => {
      if (char === 'Z') return 'Y'
      if (char === 'z') return 'y'
      if (char === 'Y') return 'Z'
      if (char === 'y') return 'z'
      return char
    })
    .join('')
}

/**
 * Extrae Nombre(s), Apellido Paterno y Apellido Materno a partir de:
 * 1. Formato estándar oficial de constancia RENAPO (delimitado por tuberías |):
 *    Ejemplo: HEPL800101HDFRRN01||HERNANDEZ|PEREZ|JORGE LUIS|HOMBRE|01/01/1980|CIUDAD DE MEXICO|09|
 * 2. Formato URL o Query Params (curp=...&primerApellido=...&segundoApellido=...&nombres=...)
 * 3. Formato JSON serializado en QR
 * 4. Formato OCR / MRZ de credencial para votar INE (ej: HERNANDEZ<<JORGE<LUIS)
 * 5. Formato multilínea o pares clave-valor
 */
export function extraerNombreDesdeTexto(rawText: string): {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombreCompleto: string
} | null {
  if (!rawText) return null
  const text = rawText.trim()

  // 1. Detección de formato oficial RENAPO / Escáner delimitado por ']' o '|'
  // Formato: CURP]]PATERNO]MATERNO]NOMBRES]HOMBRE]30-12-1986]CHIHUAHUA]08]
  // o formato: CURP||PATERNO|MATERNO|NOMBRES|SEXO|FECHA_NAC|ENTIDAD|CLAVE|
  const delimitadorTokens = text.includes(']') ? ']' : text.includes('|') ? '|' : null
  if (delimitadorTokens) {
    const tokens = text.split(delimitadorTokens).map((t) => t.trim())
    const curpIndex = tokens.findIndex((t) =>
      /[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d/.test(t)
    )

    if (curpIndex !== -1) {
      // Tomamos los tokens posteriores a la CURP ignorando vacíos generados por ']]' o '||'
      const tokensDespues = tokens.slice(curpIndex + 1).filter(Boolean)
      if (tokensDespues.length >= 3) {
        const paterno = tokensDespues[0].toUpperCase()
        const materno = tokensDespues[1].toUpperCase()
        const nombres = tokensDespues[2].toUpperCase()
        return {
          nombre: nombres,
          apellidoPaterno: paterno,
          apellidoMaterno: materno,
          nombreCompleto: `${nombres} ${paterno} ${materno}`.trim(),
        }
      }
    }
  }

  // 2. Formato MRZ del reverso de la Credencial INE (ej: PATERNO<<MATERNO<NOMBRES o PATERNO<MATERNO<<NOMBRES)
  if (text.includes('<<') || text.includes('IDMEX')) {
    const lineas = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    // Usualmente la línea 3 contiene los nombres en el formato MRZ del INE
    const lineaNombre = lineas.find((l) => l.includes('<<')) || lineas[lineas.length - 1]
    if (lineaNombre) {
      const partes = lineaNombre.split('<<').map((p) => p.replace(/<+/g, ' ').trim())
      if (partes.length >= 2) {
        const apellidos = partes[0].split(' ')
        const pat = (apellidos[0] || '').toUpperCase()
        const mat = (apellidos.slice(1).join(' ') || '').toUpperCase()
        const nom = (partes[1] || '').toUpperCase()
        if (pat && nom) {
          return {
            nombre: nom,
            apellidoPaterno: pat,
            apellidoMaterno: mat,
            nombreCompleto: [nom, pat, mat].filter(Boolean).join(' '),
          }
        }
      }
    }
  }

  // 3. Formato URL o Query Params (ej: ?curp=...&primerApellido=HERNANDEZ&segundoApellido=PEREZ&nombres=JORGE+LUIS)
  if (
    text.includes('nombre=') ||
    text.includes('nombres=') ||
    text.includes('paterno=') ||
    text.includes('primerApellido=')
  ) {
    try {
      const queryString = text.includes('?') ? text.split('?')[1] : text
      const urlParams = new URLSearchParams(queryString)
      const nom = decodeURIComponent(
        urlParams.get('nombres') || urlParams.get('nombre') || ''
      ).trim()
      const pat = decodeURIComponent(
        urlParams.get('primerApellido') ||
          urlParams.get('paterno') ||
          urlParams.get('apellidoPaterno') ||
          ''
      ).trim()
      const mat = decodeURIComponent(
        urlParams.get('segundoApellido') ||
          urlParams.get('materno') ||
          urlParams.get('apellidoMaterno') ||
          ''
      ).trim()

      if (nom || pat) {
        const nomUpper = nom.toUpperCase()
        const patUpper = pat.toUpperCase()
        const matUpper = mat.toUpperCase()
        return {
          nombre: nomUpper,
          apellidoPaterno: patUpper,
          apellidoMaterno: matUpper,
          nombreCompleto: [nomUpper, patUpper, matUpper].filter(Boolean).join(' '),
        }
      }
    } catch {
      // Continuar con otros extractores
    }
  }

  // 4. Detección de JSON (si el QR retorna un objeto serializado)
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const obj = JSON.parse(text)
      const nom = String(obj.nombre || obj.nombres || '').trim()
      const pat = String(obj.apellidoPaterno || obj.paterno || obj.primerApellido || '').trim()
      const mat = String(obj.apellidoMaterno || obj.materno || obj.segundoApellido || '').trim()
      const comp = String(obj.nombreCompleto || '').trim() || [nom, pat, mat].filter(Boolean).join(' ')

      if (comp) {
        return {
          nombre: nom.toUpperCase(),
          apellidoPaterno: pat.toUpperCase(),
          apellidoMaterno: mat.toUpperCase(),
          nombreCompleto: comp.toUpperCase(),
        }
      }
    } catch {
      // Ignorar si no es JSON válido
    }
  }

  // 5. Formato delimitado con ';' o tabuladores
  const separadorAlt = text.includes(';') ? ';' : text.includes('\t') ? '\t' : null
  if (separadorAlt) {
    const partes = text.split(separadorAlt).map((p) => p.trim()).filter(Boolean)
    for (let i = 0; i < partes.length; i++) {
      if (CURP_REGEX.test(partes[i]) && partes.length >= i + 4) {
        const paterno = partes[i + 1].toUpperCase()
        const materno = partes[i + 2].toUpperCase()
        const nombres = partes[i + 3].toUpperCase()
        if (paterno && nombres) {
          return {
            nombre: nombres,
            apellidoPaterno: paterno,
            apellidoMaterno: materno,
            nombreCompleto: `${nombres} ${paterno} ${materno}`.trim(),
          }
        }
      }
    }
  }

  return null
}

/**
 * Decodifica una CURP y extrae sus atributos demográficos de forma determinista
 */
export function parseCurp(rawText: string): ExtractedCurpData | null {
  if (!rawText) return null
  const curp = normalizarTextoEscaneado(rawText)

  if (!CURP_REGEX.test(curp)) {
    return null
  }

  // 1. Extraer componentes posicionales
  const fechaStr = curp.substring(4, 10) // AAMMDD
  const sexoChar = curp.charAt(10) // H o M
  const entidadCode = curp.substring(11, 13) // Ej: CH
  const digitoSigloChar = curp.charAt(16) // Si es letra, siglo XXI (2000+); si es número, siglo XX (1900+)

  // 2. Resolver año completo (Siglo XX vs XXI)
  const anioCorto = parseInt(fechaStr.substring(0, 2), 10)
  const mes = parseInt(fechaStr.substring(2, 4), 10)
  const dia = parseInt(fechaStr.substring(4, 6), 10)

  const esSiglo21 = isNaN(parseInt(digitoSigloChar, 10))
  const anioCompleto = esSiglo21 ? 2000 + anioCorto : 1900 + anioCorto

  // 3. Calcular edad exacta contra fecha actual
  const hoy = new Date()
  let edad = hoy.getFullYear() - anioCompleto
  const mesActual = hoy.getMonth() + 1
  const diaActual = hoy.getDate()

  if (mesActual < mes || (mesActual === mes && diaActual < dia)) {
    edad--
  }

  // 4. Formatear fechas legibles
  const diaPad = String(dia).padStart(2, '0')
  const mesPad = String(mes).padStart(2, '0')
  let fechaNacimiento = `${diaPad}/${mesPad}/${anioCompleto}`
  let fechaIso = `${anioCompleto}-${mesPad}-${diaPad}`

  // 5. Sexo
  let sexo: 'Masculino' | 'Femenino' = sexoChar === 'H' ? 'Masculino' : 'Femenino'

  // 6. Entidad Federativa
  let nombreEntidad = ENTIDADES_FEDERATIVAS_MEXICO[entidadCode] || 'Entidad no especificada'
  let claveEntidadFinal = entidadCode

  // 7. Prefijo RFC base (Primeras 10 posiciones)
  const rfcBase = curp.substring(0, 10)

  // 8. Extraer Nombre Oficial si viene estructurado en el texto
  const datosNombre = extraerNombreDesdeTexto(rawText)

  // 9. Extraer demografía enriquecida si el escáner envió tokens delimitados (']' o '|')
  const delimitadorTokens = rawText.includes(']') ? ']' : rawText.includes('|') ? '|' : null
  if (delimitadorTokens) {
    const tokens = rawText.split(delimitadorTokens).map((t) => t.trim())
    const curpIndex = tokens.findIndex((t) => CURP_REGEX.test(t))
    if (curpIndex !== -1) {
      const tokensDespues = tokens.slice(curpIndex + 1).filter(Boolean)
      // tokensDespues[0] = Paterno
      // tokensDespues[1] = Materno
      // tokensDespues[2] = Nombres
      // tokensDespues[3] = Género (ej: HOMBRE / MUJER)
      if (tokensDespues.length >= 4) {
        const genRaw = tokensDespues[3].toUpperCase()
        if (genRaw.includes('HOMB') || genRaw === 'H' || genRaw === 'MASCULINO') {
          sexo = 'Masculino'
        } else if (genRaw.includes('MUJ') || genRaw === 'M' || genRaw === 'FEMENINO') {
          sexo = 'Femenino'
        }
      }

      // tokensDespues[4] = Fecha Nacimiento explícita (ej: 30-12-1986 o 30/12/1986)
      if (tokensDespues.length >= 5) {
        const fechaRaw = tokensDespues[4]
        const mFecha = fechaRaw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
        if (mFecha) {
          const d = mFecha[1].padStart(2, '0')
          const mo = mFecha[2].padStart(2, '0')
          const y = parseInt(mFecha[3], 10)
          fechaNacimiento = `${d}/${mo}/${y}`
          fechaIso = `${y}-${mo}-${d}`

          let edadCalculada = hoy.getFullYear() - y
          const ma = hoy.getMonth() + 1
          const da = hoy.getDate()
          if (ma < parseInt(mo, 10) || (ma === parseInt(mo, 10) && da < parseInt(d, 10))) {
            edadCalculada--
          }
          edad = Math.max(0, edadCalculada)
        }
      }

      // tokensDespues[5] = Estado de nacimiento (ej: CHIHUAHUA)
      if (tokensDespues.length >= 6 && tokensDespues[5]) {
        nombreEntidad = tokensDespues[5].toUpperCase()
      }

      // tokensDespues[6] = Clave de estado (ej: 08)
      if (tokensDespues.length >= 7 && tokensDespues[6]) {
        claveEntidadFinal = tokensDespues[6].toUpperCase()
      }
    }
  }

  return {
    curp,
    esValida: true,
    fechaNacimiento,
    fechaIso,
    edad: Math.max(0, edad),
    sexo,
    claveEntidad: claveEntidadFinal,
    nombreEntidad,
    rfcBase,
    nombre: datosNombre?.nombre,
    apellidoPaterno: datosNombre?.apellidoPaterno,
    apellidoMaterno: datosNombre?.apellidoMaterno,
    nombreCompleto: datosNombre?.nombreCompleto,
    origenDocumento: rawText.includes(']')
      ? 'renapo_barcode'
      : rawText.includes('|')
      ? 'renapo_qr'
      : 'renapo_barcode',
  }
}

/**
 * Decodifica o valida un RFC completo de 13 caracteres, QR del SAT o Cédula de Identificación Fiscal
 */
export function parseSatQr(rawText: string): {
  rfc: string
  homoclave: string
  urlSat?: string
  nombre?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  nombreCompleto?: string
} | null {
  if (!rawText) return null
  const cleaned = rawText.trim()

  // 1. Cadena de URL oficial del SAT (Validador QR de CIF)
  if (cleaned.includes('siat.sat.gob.mx') || cleaned.includes('validadorqr.jsf')) {
    const matchD3 = cleaned.match(/_([A-Z&Ñ]{4}\d{6}[A-Z0-9]{3})/i)
    if (matchD3) {
      const rfc = matchD3[1].toUpperCase()
      return {
        rfc,
        homoclave: rfc.substring(10, 13),
        urlSat: cleaned,
      }
    }
  }

  // 2. Cadena de RFC directa de 13 posiciones (ej: HEPL8001017C5 o código de barras 1D)
  if (RFC_REGEX.test(cleaned.toUpperCase())) {
    const rfc = cleaned.toUpperCase()
    return {
      rfc,
      homoclave: rfc.substring(10, 13),
    }
  }

  // 3. Buscar RFC de 13 caracteres dentro de cualquier texto escaneado
  const matchRfc = cleaned.match(/[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}/i)
  if (matchRfc) {
    const rfc = matchRfc[0].toUpperCase()
    const datosNombre = extraerNombreDesdeTexto(rawText)
    return {
      rfc,
      homoclave: rfc.substring(10, 13),
      nombre: datosNombre?.nombre,
      apellidoPaterno: datosNombre?.apellidoPaterno,
      apellidoMaterno: datosNombre?.apellidoMaterno,
      nombreCompleto: datosNombre?.nombreCompleto,
    }
  }

  return null
}

