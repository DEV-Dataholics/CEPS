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

  // Domicilio opcional (capturado en formulario)
  domicilio?: {
    calleNumero: string
    colonia: string
    codigoPostal: string
    ciudad?: string
  }
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
 * Extrae Nombre(s), Apellido Paterno y Apellido Materno a partir de:
 * 1. Formato estándar oficial de constancia RENAPO (delimitado por tuberías |):
 *    Ejemplo: RULG861230HCHZZS06||RUIZ|LOZANO|GUSTAVO ALONSO|HOMBRE|30/12/1986|CHIHUAHUA|08|
 * 2. Formato URL o Query Params (curp=...&primerApellido=...&segundoApellido=...&nombres=...)
 * 3. Formato JSON serializado en QR
 * 4. Formato multilínea o pares clave-valor
 */
export function extraerNombreDesdeTexto(rawText: string): {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombreCompleto: string
} | null {
  if (!rawText) return null
  const text = rawText.trim()

  // 1. Detección de formato oficial RENAPO delimitado por '|'
  // Formato: CURP||PATERNO|MATERNO|NOMBRES|SEXO|FECHA_NAC|ENTIDAD|CLAVE|
  // o: CURP|PATERNO|MATERNO|NOMBRES|...
  if (text.includes('|')) {
    const tokens = text.split('|').map((t) => t.trim())
    const curpIndex = tokens.findIndex((t) =>
      /[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d/.test(t)
    )

    if (curpIndex !== -1) {
      // Tomamos los tokens posteriores a la CURP ignorando vacíos generados por '||'
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

  // 2. Formato URL o Query Params (ej: ?curp=...&primerApellido=RUIZ&segundoApellido=LOZANO&nombres=GUSTAVO+ALONSO)
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

  // 3. Detección de JSON (si el QR retorna un objeto serializado)
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

  // 4. Formato delimitado con ';' o tabuladores
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
  const fechaNacimiento = `${diaPad}/${mesPad}/${anioCompleto}`
  const fechaIso = `${anioCompleto}-${mesPad}-${diaPad}`

  // 5. Sexo
  const sexo: 'Masculino' | 'Femenino' = sexoChar === 'H' ? 'Masculino' : 'Femenino'

  // 6. Entidad Federativa
  const nombreEntidad = ENTIDADES_FEDERATIVAS_MEXICO[entidadCode] || 'Entidad no especificada'

  // 7. Prefijo RFC base (Primeras 10 posiciones)
  const rfcBase = curp.substring(0, 10)

  // 8. Extraer Nombre Oficial si viene estructurado en el texto
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
    origenDocumento: rawText.includes('|') ? 'renapo_qr' : 'renapo_barcode',
  }
}

/**
 * Decodifica o valida un RFC completo de 13 caracteres, QR del SAT o Cédula de Identificación Fiscal
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

  // 1. Cadena de RFC directa de 13 posiciones (ej: RULG8612307C5)
  if (RFC_REGEX.test(cleaned.toUpperCase())) {
    const rfc = cleaned.toUpperCase()
    return {
      rfc,
      homoclave: rfc.substring(10, 13),
    }
  }

  // 2. Buscar RFC de 13 dígitos dentro de texto o URL del SAT
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

