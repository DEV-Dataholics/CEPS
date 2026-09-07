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
  }
}

/**
 * Decodifica códigos QR del SAT (Cédula de Identificación Fiscal / Constancia de Situación Fiscal)
 * URL típica: https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=10&D2=1&D3=1412038198_MEVC9004128N1
 */
export function parseSatQr(rawText: string): { rfc: string; homoclave: string } | null {
  if (!rawText) return null
  const cleaned = rawText.trim()

  // Buscar RFC de 13 dígitos dentro del texto o URL
  const matchRfc = cleaned.match(/[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}/i)
  if (matchRfc) {
    const rfc = matchRfc[0].toUpperCase()
    return {
      rfc,
      homoclave: rfc.substring(10, 13),
    }
  }

  return null
}
