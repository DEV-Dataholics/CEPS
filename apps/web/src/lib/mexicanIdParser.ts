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
  let cleaned = rawText.trim().toUpperCase()

  // Si el escáner capturó una URL de consulta de CURP (ej: https://consultas.curp.gob.mx/...curp=XXXX...)
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
 * Decodifica una CURP y extrae sus atributos demográficos de forma determinista
 */
export function parseCurp(rawText: string): ExtractedCurpData | null {
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

  // En la CURP oficial, el caracter 17 (índice 16) es:
  // - 0-9 para personas nacidas antes del año 2000 (1900-1999)
  // - A-Z para personas nacidas a partir del año 2000 (2000-2099)
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
  const fechaNacimiento = `${diaPad}/${mesPad}/${anioCompleto}`
  const fechaIso = `${anioCompleto}-${mesPad}-${diaPad}`

  // 5. Sexo
  const sexo: 'Masculino' | 'Femenino' = sexoChar === 'H' ? 'Masculino' : 'Femenino'

  // 6. Entidad Federativa
  const nombreEntidad = ENTIDADES_FEDERATIVAS_MEXICO[entidadCode] || 'Entidad no especificada'

  // 7. Prefijo RFC base (Primeras 10 posiciones)
  const rfcBase = curp.substring(0, 10)

  // 8. Intentar extraer nombre si el texto crudo venía en formato estructurado (MRZ, QR RENAPO, SAT, etc.)
  const datosNombre = extraerNombreDesdeTexto(rawText)

  return {
    curp,
    esValida: true,
    fechaNacimiento,
    fechaIso,
    edad: Math.max(0, edad),
    sexo,
    claveEntidad: entidadCode,
    nombreEntidad,
    rfcBase,
    nombre: datosNombre?.nombre,
    apellidoPaterno: datosNombre?.apellidoPaterno,
    apellidoMaterno: datosNombre?.apellidoMaterno,
    nombreCompleto: datosNombre?.nombreCompleto,
  }
}

export const DIRECTOTIO_CURP_DEMO: Record<
  string,
  {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    nombreCompleto: string
    rfcCompleto?: string
  }
> = {
  MECJ920514HCHDRR08: {
    nombre: 'JORGE ALEJANDRO',
    apellidoPaterno: 'MEDINA',
    apellidoMaterno: 'CASTILLO',
    nombreCompleto: 'JORGE ALEJANDRO MEDINA CASTILLO',
    rfcCompleto: 'MECJ920514QR3',
  },
  HIVR970822MCHNL02: {
    nombre: 'ROSA MARÍA',
    apellidoPaterno: 'HINOJOSA',
    apellidoMaterno: 'VALLES',
    nombreCompleto: 'ROSA MARÍA HINOJOSA VALLES',
    rfcCompleto: 'HIVR970822PL9',
  },
  DOSC850311HCHMN04: {
    nombre: 'CARLOS ALBERTO',
    apellidoPaterno: 'DOMÍNGUEZ',
    apellidoMaterno: 'SÁENZ',
    nombreCompleto: 'CARLOS ALBERTO DOMÍNGUEZ SÁENZ',
    rfcCompleto: 'DOSC850311KJ1',
  },
  HELM881105HCHRR03: {
    nombre: 'LUIS MARIO',
    apellidoPaterno: 'HERNÁNDEZ',
    apellidoMaterno: 'LOZANO',
    nombreCompleto: 'LUIS MARIO HERNÁNDEZ LOZANO',
    rfcCompleto: 'HELM881105TY2',
  },
}

/**
 * Extrae Nombre(s), Apellido Paterno y Apellido Materno a partir de:
 * 1. Formato MRZ de credencial INE/IFE (Líneas TD1 con apellidos y nombres separados por '<' y '<<')
 *    Ejemplo: MENDOZA<VALLES<<CARLOS<EDUARDO
 * 2. Formato delimitado por tuberías '|' o punto y coma ';' (códigos QR de RENAPO o constancias)
 *    Ejemplo: CURP|PATERNO|MATERNO|NOMBRES
 * 3. Formato clave-valor o URL (ej: curp=...&primerApellido=MEDINA&segundoApellido=CASTILLO&nombres=JORGE+ALEJANDRO)
 * 4. Formato JSON serializado en QR
 * 5. Formato multilínea etiquetado (Nombre:, Apellido Paterno:, etc.)
 * 6. Directorio institucional de aspirantes / expedientes conocidos
 */
export function extraerNombreDesdeTexto(rawText: string): {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombreCompleto: string
} | null {
  if (!rawText) return null
  const text = rawText.trim()

  // 0. Detección de JSON (si el QR o escáner retorna un objeto serializado)
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

  // 1. Detección de formato MRZ de INE / Credencial para Votar
  // Caso 1A: Dos apellidos (PATERNO<MATERNO<<NOMBRES)
  const matchMrz2 = text.match(/([A-ZÁÉÍÓÚÑ]+)<([A-ZÁÉÍÓÚÑ]+)<<([A-ZÁÉÍÓÚÑ<]+)/i)
  if (matchMrz2) {
    const paterno = matchMrz2[1].trim().toUpperCase()
    const materno = matchMrz2[2].trim().toUpperCase()
    const nombres = matchMrz2[3].replace(/<+/g, ' ').trim().toUpperCase()
    return {
      nombre: nombres,
      apellidoPaterno: paterno,
      apellidoMaterno: materno,
      nombreCompleto: `${nombres} ${paterno} ${materno}`.trim(),
    }
  }

  // Caso 1B: Un solo apellido (PATERNO<<NOMBRES)
  const matchMrz1 = text.match(/([A-ZÁÉÍÓÚÑ]+)<<([A-ZÁÉÍÓÚÑ<]+)/i)
  if (matchMrz1) {
    const paterno = matchMrz1[1].trim().toUpperCase()
    const nombres = matchMrz1[2].replace(/<+/g, ' ').trim().toUpperCase()
    return {
      nombre: nombres,
      apellidoPaterno: paterno,
      apellidoMaterno: '',
      nombreCompleto: `${nombres} ${paterno}`.trim(),
    }
  }

  // 2. Detección de formato delimitado con '|', ';', o '\t' (RENAPO / Credenciales / SAT)
  const separador = text.includes('|') ? '|' : text.includes(';') ? ';' : text.includes('\t') ? '\t' : null
  if (separador) {
    const partes = text.split(separador).map((p) => p.trim())

    // Caso 2A: CURP|PATERNO|MATERNO|NOMBRES
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

      // Caso 2B: CURP|NOMBRE COMPLETO
      if (CURP_REGEX.test(partes[i]) && partes.length >= i + 2) {
        const nombreCompleto = partes[i + 1].toUpperCase()
        const palabras = nombreCompleto.split(/\s+/).filter(Boolean)
        if (palabras.length >= 3) {
          return {
            nombre: palabras.slice(2).join(' '),
            apellidoPaterno: palabras[0],
            apellidoMaterno: palabras[1],
            nombreCompleto,
          }
        } else if (palabras.length === 2) {
          return {
            nombre: palabras[1],
            apellidoPaterno: palabras[0],
            apellidoMaterno: '',
            nombreCompleto,
          }
        }
      }
    }

    // Caso 2C: Formato SAT CIF: RFC|NOMBRE COMPLETO O RAZON SOCIAL
    if (partes.length >= 2 && RFC_REGEX.test(partes[0])) {
      const nombreCompleto = partes[1].toUpperCase()
      const palabras = nombreCompleto.split(/\s+/).filter(Boolean)
      if (palabras.length >= 3) {
        return {
          nombre: palabras.slice(2).join(' '),
          apellidoPaterno: palabras[0],
          apellidoMaterno: palabras[1],
          nombreCompleto,
        }
      }
    }
  }

  // 3. Formato URL o Query Params (ej: ?curp=...&primerApellido=MEDINA&segundoApellido=CASTILLO&nombres=JORGE+ALEJANDRO)
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
      const comp = decodeURIComponent(urlParams.get('nombreCompleto') || '').trim()

      if (nom || comp) {
        const nomUpper = nom.toUpperCase()
        const patUpper = pat.toUpperCase()
        const matUpper = mat.toUpperCase()
        const compFinal =
          comp.toUpperCase() || `${nomUpper} ${patUpper} ${matUpper}`.trim()
        return {
          nombre: nomUpper || compFinal.split(' ').slice(0, 2).join(' '),
          apellidoPaterno: patUpper,
          apellidoMaterno: matUpper,
          nombreCompleto: compFinal,
        }
      }
    } catch {
      // Ignorar errores de URL
    }
  }

  // 4. Formato Multilínea Etiquetado (Texto OCR o Captura Estructurada)
  if (text.includes(':')) {
    const lineas = text.split('\n')
    let nom = ''
    let pat = ''
    let mat = ''
    let comp = ''
    for (const linea of lineas) {
      const lower = linea.toLowerCase().trim()
      if (lower.startsWith('nombre:') || lower.startsWith('nombre(s):') || lower.startsWith('nombres:')) {
        nom = linea.split(':')[1]?.trim() || ''
      } else if (lower.startsWith('apellido paterno:') || lower.startsWith('paterno:') || lower.startsWith('primer apellido:')) {
        pat = linea.split(':')[1]?.trim() || ''
      } else if (lower.startsWith('apellido materno:') || lower.startsWith('materno:') || lower.startsWith('segundo apellido:')) {
        mat = linea.split(':')[1]?.trim() || ''
      } else if (lower.startsWith('nombre completo:')) {
        comp = linea.split(':')[1]?.trim() || ''
      }
    }
    if (nom || comp) {
      const nomUpper = nom.toUpperCase()
      const patUpper = pat.toUpperCase()
      const matUpper = mat.toUpperCase()
      const compFinal = comp.toUpperCase() || `${nomUpper} ${patUpper} ${matUpper}`.trim()
      return {
        nombre: nomUpper,
        apellidoPaterno: patUpper,
        apellidoMaterno: matUpper,
        nombreCompleto: compFinal,
      }
    }
  }

  // 5. Consulta en Directorio Institucional de CURPs Demo / Conocidas
  const matchCurp = text.match(/[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d/)
  if (matchCurp && DIRECTOTIO_CURP_DEMO[matchCurp[0]]) {
    const matchDemo = DIRECTOTIO_CURP_DEMO[matchCurp[0]]
    return {
      nombre: matchDemo.nombre,
      apellidoPaterno: matchDemo.apellidoPaterno,
      apellidoMaterno: matchDemo.apellidoMaterno,
      nombreCompleto: matchDemo.nombreCompleto,
    }
  }

  return null
}

/**
 * Decodifica códigos QR del SAT (Cédula de Identificación Fiscal / Constancia de Situación Fiscal)
 * URL típica: https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=10&D2=1&D3=1412038198_MEVC9004128N1
 */
export function parseSatQr(rawText: string): {
  rfc: string
  homoclave: string
  nombre?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  nombreCompleto?: string
} | null {
  if (!rawText) return null
  const cleaned = rawText.trim()

  // Buscar RFC de 13 dígitos dentro del texto o URL
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
