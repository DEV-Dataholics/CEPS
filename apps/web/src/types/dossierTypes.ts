// Tipos del Sistema de Expedientes / Dossiers de Seguridad CEPS Paso del Norte

export type EstatusExpediente =
  | 'en_evaluacion'
  | 'aprobado_servicio'
  | 'en_reserva'
  | 'vetado_alerta'
  | 'asignado_planta'

export type EscolaridadCandidato =
  | 'Primaria'
  | 'Secundaria'
  | 'Preparatoria / Bachillerato'
  | 'Carrera Técnica'
  | 'Licenciatura trunca o concluida'

// 1. Recepción y Datos de Abordaje
export interface DatosAbordaje {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  telefono: string
  edad: string
  escolaridad: EscolaridadCandidato
  puestoInteres: string
  moduloAbordaje: string
  fecha: string
  fotoPerfilUrl?: string
}

// 2. Examen de Razonamiento (VER5 Oficial)
export interface ExamenRazonamientoRespuestas {
  // Lectura comprensiva (La mochila de Ana)
  dondeEncontroMochila: string // correcta: 'En el parque'
  queHabiaEnMochila: string // correcta: 'Una nota'
  queDeciaNota: string // correcta: '"Gracias por cuidar mis cosas. Mi nombre es Ana"'
  comoSeSentioAna: string // correcta: 'Agradecida'

  // Aritmética básica (Sumas y restas)
  op1_40_mas: string // 40 + 40 = 80
  op2_200_mas: string // 200 + 250 = 450
  op3_20_mas: string // 20 + 25 = 45
  op4_menos_60: string // 80 - 60 = 20
  op5_menos_50: string // 200 - 50 = 150
  op6_85_menos: string // 85 - 45 = 40
  op7_32_mas: string // 32 + 0 = 32
  op8_70_mas: string // 70 + 35 = 105
  op9_78_mas: string // 78 + 22 = 100
  op10_70_menos: string // 70 - 30 = 40
  op11_96_menos: string // 96 - 60 = 36
  op12_45_menos: string // 45 - 20 = 25

  // Lógica y preguntas capciosas
  palabraAuto: string // ¿Es correcto? (No, finaliza con O)
  pastorOvejas: string // ¿Cuántas sobreviven? (Sobreviven 12 o contestan 7)
  trenSobrevivientes: string // ¿Dónde se entierran? (A los sobrevivientes no se les entierra)
  paradojaMentira: string // Verdad o mentira (Paradoja / ninguna)
  huevoGallo: string // Hacia qué lado rodaría (Los gallos no ponen huevos)
}

export interface ExamenRazonamientoEvaluacion {
  erroresLectura: number
  erroresAritmetica: number
  erroresLogica: number
  totalErrores: number
  aprobado: boolean // true si totalErrores <= 8
  requiereComitePerfiles: boolean // true si totalErrores > 8
  observaciones?: string
}

// 3. Cuestionario de Entrevista de Reclutamiento (10 Preguntas Oficiales RH)
export interface CuestionarioEntrevistaRespuestas {
  p1_valores: string
  p2_experienciaSeguridad: 'si' | 'no'
  p3_funcionesGuardia: string
  p4_reporteIncidente: 'seguridad_interna' | 'jefe_grupo_ceps' | 'supervisor_ceps'
  p5_reaccionRobo: 'reporto_jefe' | 'ayudo' | 'no_digo_nada'
  p6_motivoInteres: 'experiencia' | 'sueldo' | 'otros'
  p6_motivoInteresDetalle: string
  p7_motivoRenuncia: string
  p8_descripcionExperiencia: string
  p9_autorizaReferencias: 'si' | 'no'
  p10_nivelTolerancia: number // 1 al 10
}

// Auditoría Confidencial Interna (Solo visible en el Dossier para CEPS)
export interface AuditoriaIntegridad {
  riesgoRobo: 'bajo_confiable' | 'alto_critico'
  apegoCadenaMando: 'optimo' | 'desvio'
  calificacionTolerancia: 'optima' | 'moderada' | 'baja_riesgo'
  banderasRojas: string[]
  dictamenReclutador: 'apto' | 'reserva' | 'no_apto'
  notasConfidenciales: string
  evaluadoPor: string
  fechaEvaluacion: string
}

// 4. Solicitud de Empleo Digital (Captura ágil que evita tachaduras de papel)
export interface SolicitudEmpleoDigital {
  curp: string
  rfc: string
  nss: string
  fechaNacimiento: string
  estadoCivil: 'Soltero' | 'Casado' | 'Unión Libre' | 'Divorciado'
  calleNumero: string
  colonia: string
  codigoPostal: string
  entrecalles: string
  tiempoEnJuarez: string
  ultimoEmpleoEmpresa: string
  ultimoEmpleoPuesto: string
  ultimoEmpleoSueldo: string
  nombreFamiliarReferencia: string
  telefonoFamiliarReferencia: string
}

// 5. Checklist de Papelería Original en Módulo
export interface ChecklistPapeleriaOriginal {
  ineOriginalPresentada: boolean
  curpPresentada: boolean
  rfcPresentada: boolean
  nssPresentada: boolean
  comprobanteDomicilioPresentado: boolean
  comprobanteEstudiosPresentado: boolean
  actaNacimientoPresentada: boolean
  cartaNoPenalesPresentada: boolean
  papeleriaCompleta: boolean
  documentosPendientes: string[]
}

// Modelo Unificado del Expediente / Dossier de Seguridad
export interface ExpedienteGuardia {
  id: string
  folio: string // ej. CEPS-2026-3101
  estatus: EstatusExpediente
  fechaCreacion: string
  abordaje: DatosAbordaje
  examenRazonamiento: {
    respuestas: ExamenRazonamientoRespuestas
    evaluacion: ExamenRazonamientoEvaluacion
  }
  cuestionarioEntrevista: {
    respuestas: CuestionarioEntrevistaRespuestas
    auditoria: AuditoriaIntegridad
  }
  solicitudEmpleo: SolicitudEmpleoDigital
  checklistPapeleria: ChecklistPapeleriaOriginal
  vacanteAsignada?: {
    vacanteId: string
    empresa: string
    planta: string
    puesto: string
    turno: string
    fechaAsignacion: string
  }
  historialEventos: Array<{
    fecha: string
    tipo: 'creacion' | 'evaluacion_razonamiento' | 'entrevista_rh' | 'solicitud_completada' | 'asignacion_vacante' | 'nota_seguridad'
    descripcion: string
    autor: string
  }>
}
