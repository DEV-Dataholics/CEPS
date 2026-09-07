/**
 * Motor Táctico de Candados de Duplicidad y Detección de Reingresos
 * CEPS Paso del Norte — Seguridad Privada y Custodia Especializada
 *
 * Cumple con los requisitos operativos del Flujo 3 y Flujo 4 (Supervisión de RH):
 * - Detección de solicitudes duplicadas en módulos de campo.
 * - Identificación de candidatos de reingreso que requieren autorización de Alondra / Eunice.
 * - Prevención de discrepancias de identidad entre credenciales y expedientes.
 */

import type { AspiranteSolicitud } from '../store/vacancyStore'
import type { ExtractedCurpData } from './mexicanIdParser'

export type EstadoDuplicidad =
  | 'limpio'
  | 'duplicado_curp'
  | 'posible_reingreso'
  | 'homonimo'
  | 'mismo_domicilio'

export type NivelAlertaDuplicidad = 'verde' | 'amarillo' | 'rojo'

export interface ResultadoDuplicidad {
  estado: EstadoDuplicidad
  nivelAlerta: NivelAlertaDuplicidad
  bloqueante: boolean
  esDuplicadoCurp: boolean
  esHomonimo: boolean
  titulo: string
  mensaje: string
  folioPrevio?: string
  fechaPrevia?: string
  moduloPrevio?: string
  puestoPrevio?: string
  estatusPrevio?: string
  folioExistente?: string
  fechaRegistroExistente?: string
  moduloExistente?: string
  puestoExistente?: string
  estatusExistente?: string
  nombreExistente?: string
  coincidencia?: AspiranteSolicitud
  detalles: string[]
}

/**
 * Evalúa los datos extraídos del aspirante contra la lista de expedientes registrados
 */
export function verificarDuplicidadAspirante(
  datos: ExtractedCurpData | null,
  aspirantes: AspiranteSolicitud[] | undefined | null
): ResultadoDuplicidad {
  if (!datos) {
    return {
      estado: 'limpio',
      nivelAlerta: 'verde',
      bloqueante: false,
      esDuplicadoCurp: false,
      esHomonimo: false,
      titulo: 'Candado de Duplicidad Inactivo',
      mensaje: 'No hay datos cargados para evaluar duplicidad.',
      detalles: [],
    }
  }

  // Sanitizar lista de aspirantes
  const listaAspirantes = Array.isArray(aspirantes)
    ? aspirantes.filter((a): a is AspiranteSolicitud => Boolean(a && typeof a === 'object' && a.curp))
    : []

  const curpNormalizada = (datos.curp || '').trim().toUpperCase()
  const nombreNormalizado = [datos.nombre, datos.apellidoPaterno, datos.apellidoMaterno]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toUpperCase()

  // 1. Candado Crítico: Coincidencia Exacta de CURP (18 caracteres)
  if (curpNormalizada.length === 18) {
    const coincidenciaCurp = listaAspirantes.find(
      (a) => a.curp && a.curp.trim().toUpperCase() === curpNormalizada
    )

    if (coincidenciaCurp) {
      const esReingreso =
        coincidenciaCurp.estatus === 'asignado' ||
        coincidenciaCurp.estatus === 'en_espera'

      const nombreCoincidente = [
        coincidenciaCurp.nombre,
        coincidenciaCurp.apellidoPaterno,
        coincidenciaCurp.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' ')

      return {
        estado: esReingreso ? 'posible_reingreso' : 'duplicado_curp',
        nivelAlerta: 'rojo',
        bloqueante: true,
        esDuplicadoCurp: true,
        esHomonimo: false,
        titulo: esReingreso
          ? '⚠️ ALERTA DE CANDADO: Posible Reingreso Detectado'
          : '⛔ ALERTA DE CANDADO: CURP Ya Registrada en Sistema',
        mensaje: `El aspirante ya cuenta con el expediente registrado bajo el folio ${coincidenciaCurp.folio}.`,
        folioPrevio: coincidenciaCurp.folio,
        fechaPrevia: coincidenciaCurp.fechaEtiqueta,
        moduloPrevio: coincidenciaCurp.moduloAbordaje,
        puestoPrevio: coincidenciaCurp.puestoDeseado,
        estatusPrevio: coincidenciaCurp.estatus,
        folioExistente: coincidenciaCurp.folio,
        fechaRegistroExistente: coincidenciaCurp.fechaEtiqueta,
        moduloExistente: coincidenciaCurp.moduloAbordaje,
        puestoExistente: coincidenciaCurp.puestoDeseado,
        estatusExistente: coincidenciaCurp.estatus,
        nombreExistente: nombreCoincidente,
        coincidencia: coincidenciaCurp,
        detalles: [
          `Folio Asignado: ${coincidenciaCurp.folio}`,
          `Fecha de Captura: ${coincidenciaCurp.fechaEtiqueta}`,
          `Puesto Solicitado: ${coincidenciaCurp.puestoDeseado}`,
          `Módulo de Abordaje: ${coincidenciaCurp.moduloAbordaje}`,
          `Estatus Actual: ${coincidenciaCurp.estatus.toUpperCase()}`,
        ],
      }
    }
  }

  // 2. Candado de Homónimo / Posible Falsificación: Mismo Nombre Completo con distinta CURP
  if (nombreNormalizado.length >= 8) {
    const coincidenciaNombre = listaAspirantes.find((a) => {
      const nomExistente = [a.nombre, a.apellidoPaterno, a.apellidoMaterno]
        .filter(Boolean)
        .join(' ')
        .trim()
        .toUpperCase()
      return nomExistente === nombreNormalizado
    })

    if (coincidenciaNombre && coincidenciaNombre.curp !== curpNormalizada) {
      const nombreCoincidente = [
        coincidenciaNombre.nombre,
        coincidenciaNombre.apellidoPaterno,
        coincidenciaNombre.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' ')

      return {
        estado: 'homonimo',
        nivelAlerta: 'amarillo',
        bloqueante: false,
        esDuplicadoCurp: false,
        esHomonimo: true,
        titulo: '⚠️ AVISO DE CANDADO: Homónimo Detectado',
        mensaje: `Existe un aspirante registrado con el mismo nombre completo (${nombreNormalizado}) pero con clave CURP ${coincidenciaNombre.curp}.`,
        folioPrevio: coincidenciaNombre.folio,
        fechaPrevia: coincidenciaNombre.fechaEtiqueta,
        moduloPrevio: coincidenciaNombre.moduloAbordaje,
        puestoPrevio: coincidenciaNombre.puestoDeseado,
        estatusPrevio: coincidenciaNombre.estatus,
        folioExistente: coincidenciaNombre.folio,
        fechaRegistroExistente: coincidenciaNombre.fechaEtiqueta,
        moduloExistente: coincidenciaNombre.moduloAbordaje,
        puestoExistente: coincidenciaNombre.puestoDeseado,
        estatusExistente: coincidenciaNombre.estatus,
        nombreExistente: nombreCoincidente,
        coincidencia: coincidenciaNombre,
        detalles: [
          `Nombre coincidente: ${nombreNormalizado}`,
          `CURP previa: ${coincidenciaNombre.curp}`,
          `CURP actual: ${curpNormalizada}`,
          `Folio previo: ${coincidenciaNombre.folio}`,
        ],
      }
    }
  }

  // 3. Candado Limpio: Sin antecedentes en la base de datos
  return {
    estado: 'limpio',
    nivelAlerta: 'verde',
    bloqueante: false,
    esDuplicadoCurp: false,
    esHomonimo: false,
    titulo: '✓ CANDADO DE DUPLICIDAD LIMPIO',
    mensaje: 'Aspirante nuevo sin registros ni solicitudes previas en la base de datos de CEPS.',
    detalles: [
      'Sin coincidencias de CURP en plantilla ni candidatos activos.',
      'Sin homónimos conflictivos detectados.',
      'Apto para apertura de expediente nuevo en campo.',
    ],
  }
}
