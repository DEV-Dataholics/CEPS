import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ExpedienteGuardia,
  EstatusExpediente,
  CuestionarioEntrevistaRespuestas,
  ExamenRazonamientoEvaluacion,
  AuditoriaIntegridad,
} from '../types/dossierTypes'

export const calcularAuditoriaIntegridad = (
  cuestionario: CuestionarioEntrevistaRespuestas,
  evaluacionRazonamiento: ExamenRazonamientoEvaluacion,
  evaluadorNombre: string = 'Reclutador en Campo CEPS'
): AuditoriaIntegridad => {
  const banderasRojas: string[] = []

  // 1. Integridad Patrimonial (P5) - Filtro Crítico
  const riesgoRobo: 'bajo_confiable' | 'alto_critico' =
    cuestionario.p5_reaccionRobo === 'reporto_jefe' ? 'bajo_confiable' : 'alto_critico'

  if (riesgoRobo === 'alto_critico') {
    banderasRojas.push(
      'BANDERA ROJA CRÍTICA: Manifiesta intención de encubrimiento o complicidad ante robo o sustracción de bienes patrimoniales.'
    )
  }

  // 2. Cadena de mando y protocolo CEPS (P4)
  const apegoCadenaMando: 'optimo' | 'desvio' =
    cuestionario.p4_reporteIncidente === 'seguridad_interna' ? 'desvio' : 'optimo'

  if (apegoCadenaMando === 'desvio') {
    banderasRojas.push(
      'OBSERVACIÓN DE PROTOCOLO: Desvío de la cadena de mando CEPS (prioriza seguridad interna de planta antes que su jefatura de grupo CEPS).'
    )
  }

  // 3. Tolerancia a la frustración y presión (P10)
  let calificacionTolerancia: 'optima' | 'moderada' | 'baja_riesgo' = 'moderada'
  if (cuestionario.p10_nivelTolerancia >= 8) {
    calificacionTolerancia = 'optima'
  } else if (cuestionario.p10_nivelTolerancia <= 4) {
    calificacionTolerancia = 'baja_riesgo'
    banderasRojas.push(
      'ALERTA CONDUCTUAL: Autopercepción de baja tolerancia (nivel ≤ 4) ante situaciones de conflicto o presión en caseta/recorrido.'
    )
  }

  // 4. Referencias laborales (P9)
  if (cuestionario.p9_autorizaReferencias === 'no') {
    banderasRojas.push(
      'ADVERTENCIA ANTECEDENTES: El aspirante niega autorización para cotejar referencias con su empleador anterior.'
    )
  }

  // 5. Filtro Examen de Razonamiento
  if (evaluacionRazonamiento.totalErrores > 8) {
    banderasRojas.push(
      `FILTRO DE RAZONAMIENTO EXCEDIDO: Registró ${evaluacionRazonamiento.totalErrores} errores (límite operativo: 8). Requiere visto bueno excepcional del Comité de Perfiles.`
    )
  }

  // Dictamen preliminar sugerido
  let dictamenReclutador: 'apto' | 'reserva' | 'no_apto' = 'apto'
  if (riesgoRobo === 'alto_critico') {
    dictamenReclutador = 'no_apto'
  } else if (banderasRojas.length > 0) {
    dictamenReclutador = 'reserva'
  }

  return {
    riesgoRobo,
    apegoCadenaMando,
    calificacionTolerancia,
    banderasRojas,
    dictamenReclutador,
    notasConfidenciales:
      riesgoRobo === 'alto_critico'
        ? 'RECHAZO DIRECTO POR POLÍTICA DE SEGURIDAD PATRIMONIAL. No apto para resguardo de planta ni custodia.'
        : banderasRojas.length > 0
        ? 'Perfil con observaciones específicas. Se remite al Comité de Perfiles para autorización de asignación en turno básico.'
        : 'Candidato con perfil óptimo para despliegue inmediato en casetas y vigilancia industrial 12x12.',
    evaluadoPor: evaluadorNombre,
    fechaEvaluacion: new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}

// Semilla inicial con casos auténticos de Ciudad Juárez
const seedExpedientes: ExpedienteGuardia[] = [
  {
    id: 'exp-1044',
    folio: 'CEPS-2026-1044',
    estatus: 'asignado_planta',
    fechaCreacion: '2026-09-02',
    abordaje: {
      nombre: 'Carlos Eduardo',
      apellidoPaterno: 'Mendoza',
      apellidoMaterno: 'Valles',
      telefono: '656 312 8841',
      edad: '34',
      escolaridad: 'Secundaria',
      puestoInteres: 'Guardia de Seguridad Industrial 12x12',
      moduloAbordaje: 'Módulo S-Mart Independencia',
      fecha: '2026-09-02',
    },
    examenRazonamiento: {
      respuestas: {
        dondeEncontroMochila: 'En el parque',
        queHabiaEnMochila: 'Una nota',
        queDeciaNota: '"Gracias por cuidar mis cosas. Mi nombre es Ana"',
        comoSeSentioAna: 'Agradecida',
        op1_40_mas: '40',
        op2_200_mas: '250',
        op3_20_mas: '25',
        op4_menos_60: '80',
        op5_menos_50: '200',
        op6_85_menos: '45',
        op7_32_mas: '0',
        op8_70_mas: '35',
        op9_78_mas: '22',
        op10_70_menos: '30',
        op11_96_menos: '60',
        op12_45_menos: '20',
        palabraAuto: 'No, finaliza con la letra O',
        pastorOvejas: 'Sobreviven 12',
        trenSobrevivientes: 'A los sobrevivientes no se les entierra',
        paradojaMentira: 'Es una contradicción o paradoja',
        huevoGallo: 'Los gallos no ponen huevos',
      },
      evaluacion: {
        erroresLectura: 0,
        erroresAritmetica: 0,
        erroresLogica: 0,
        totalErrores: 0,
        aprobado: true,
        requiereComitePerfiles: false,
        observaciones: 'Excelente desempeño analítico. Resolvió todas las operaciones y acertijos sin errores.',
      },
    },
    cuestionarioEntrevista: {
      respuestas: {
        p1_valores: 'Puntualidad, lealtad a la empresa, respeto a los compañeros y cero tolerancia al robo.',
        p2_experienciaSeguridad: 'si',
        p3_funcionesGuardia: 'Control de accesos peatonales y vehiculares, rondines perimetrales con bitácora y revisión de gafetes en torniquetes.',
        p4_reporteIncidente: 'jefe_grupo_ceps',
        p5_reaccionRobo: 'reporto_jefe',
        p6_motivoInteres: 'sueldo',
        p6_motivoInteresDetalle: 'Me interesan las prestaciones de ley y el bono de puntualidad semanal que ofrece CEPS.',
        p7_motivoRenuncia: 'Cierre de línea de producción en mi anterior trabajo.',
        p8_descripcionExperiencia: '4 años como guardia en Foxconn Planta Las Torres, manejando libro de novedades y detector de metales garrett.',
        p9_autorizaReferencias: 'si',
        p10_nivelTolerancia: 9,
      },
      auditoria: {
        riesgoRobo: 'bajo_confiable',
        apegoCadenaMando: 'optimo',
        calificacionTolerancia: 'optima',
        banderasRojas: [],
        dictamenReclutador: 'apto',
        notasConfidenciales: 'Candidato ejemplar. Experiencia previa comprobable en caseta maquiladora. Excelente trato y templanza.',
        evaluadoPor: 'Juan Antonio Ramos (Reclutador en Campo)',
        fechaEvaluacion: '2 de septiembre de 2026',
      },
    },
    solicitudEmpleo: {
      curp: 'MEVC900412HCHND02',
      rfc: 'MEVC9004128N1',
      nss: '12149028194',
      fechaNacimiento: '1990-04-12',
      estadoCivil: 'Casado',
      calleNumero: 'Calle Puerto de Palos 4120',
      colonia: 'Parajes de Oriente',
      codigoPostal: '32575',
      entrecalles: 'Punta La Viuda y Puerto Tarento',
      tiempoEnJuarez: 'Toda la vida (34 años)',
      ultimoEmpleoEmpresa: 'Foxconn Las Torres',
      ultimoEmpleoPuesto: 'Guardia de Accesos',
      ultimoEmpleoSueldo: '$2,850 semanales',
      nombreFamiliarReferencia: 'Rosa María Valles (Madre)',
      telefonoFamiliarReferencia: '656 409 1123',
    },
    checklistPapeleria: {
      ineOriginalPresentada: true,
      curpPresentada: true,
      rfcPresentada: true,
      nssPresentada: true,
      comprobanteDomicilioPresentado: true,
      comprobanteEstudiosPresentado: true,
      actaNacimientoPresentada: true,
      cartaNoPenalesPresentada: true,
      papeleriaCompleta: true,
      documentosPendientes: [],
    },
    vacanteAsignada: {
      vacanteId: 'vac-01',
      empresa: 'Foxconn Santa Teresa Campus 1',
      planta: 'Planta de Ensamble y Servidores',
      puesto: 'Guardia de Seguridad Industrial 12x12',
      turno: 'Turno 12x12 Mixto (Rol Operativo)',
      fechaAsignacion: '2026-09-03',
    },
    historialEventos: [
      {
        fecha: '2026-09-02 10:15',
        tipo: 'creacion',
        descripcion: 'Abordaje presencial exitoso en Módulo S-Mart Independencia.',
        autor: 'Juan Antonio Ramos',
      },
      {
        fecha: '2026-09-02 10:45',
        tipo: 'evaluacion_razonamiento',
        descripcion: 'Aprobó Examen de Razonamiento VER5 con 0 errores.',
        autor: 'Juan Antonio Ramos',
      },
      {
        fecha: '2026-09-02 11:20',
        tipo: 'entrevista_rh',
        descripcion: 'Cuestionario de entrevista completado con dictamen APTO.',
        autor: 'Juan Antonio Ramos',
      },
      {
        fecha: '2026-09-03 09:00',
        tipo: 'asignacion_vacante',
        descripcion: 'Asignado formalmente a Foxconn Santa Teresa en Turno 12x12.',
        autor: 'Eunice Lira (Supervisora)',
      },
    ],
  },
  {
    id: 'exp-1089',
    folio: 'CEPS-2026-1089',
    estatus: 'vetado_alerta',
    fechaCreacion: '2026-09-04',
    abordaje: {
      nombre: 'Martín Alejandro',
      apellidoPaterno: 'Barraza',
      apellidoMaterno: 'Morales',
      telefono: '656 718 2209',
      edad: '28',
      escolaridad: 'Preparatoria / Bachillerato',
      puestoInteres: 'Custodia Intramuros Maquiladora',
      moduloAbordaje: 'Módulo Sendero Las Torres',
      fecha: '2026-09-04',
    },
    examenRazonamiento: {
      respuestas: {
        dondeEncontroMochila: 'En el parque',
        queHabiaEnMochila: 'Una nota',
        queDeciaNota: '"Gracias por cuidar mis cosas. Mi nombre es Ana"',
        comoSeSentioAna: 'Agradecida',
        op1_40_mas: '40',
        op2_200_mas: '250',
        op3_20_mas: '25',
        op4_menos_60: '80',
        op5_menos_50: '200',
        op6_85_menos: '45',
        op7_32_mas: '0',
        op8_70_mas: '35',
        op9_78_mas: '22',
        op10_70_menos: '30',
        op11_96_menos: '60',
        op12_45_menos: '20',
        palabraAuto: 'No',
        pastorOvejas: '12',
        trenSobrevivientes: 'En la frontera',
        paradojaMentira: 'Mentira',
        huevoGallo: 'A la izquierda',
      },
      evaluacion: {
        erroresLectura: 0,
        erroresAritmetica: 0,
        erroresLogica: 3,
        totalErrores: 3,
        aprobado: true,
        requiereComitePerfiles: false,
        observaciones: 'Aprobó el examen de razonamiento con 3 errores en acertijos de lógica.',
      },
    },
    cuestionarioEntrevista: {
      respuestas: {
        p1_valores: 'Responsabilidad y cumplir mis horas.',
        p2_experienciaSeguridad: 'no',
        p3_funcionesGuardia: 'Cuidar la puerta y no dejar pasar gente sin gafete.',
        p4_reporteIncidente: 'seguridad_interna',
        p5_reaccionRobo: 'no_digo_nada',
        p6_motivoInteres: 'sueldo',
        p6_motivoInteresDetalle: 'Necesito ingresos rápidos.',
        p7_motivoRenuncia: 'Problemas de horario con el supervisor.',
        p8_descripcionExperiencia: 'Operador de ensamble en maquiladora de cables.',
        p9_autorizaReferencias: 'no',
        p10_nivelTolerancia: 4,
      },
      auditoria: {
        riesgoRobo: 'alto_critico',
        apegoCadenaMando: 'desvio',
        calificacionTolerancia: 'baja_riesgo',
        banderasRojas: [
          'BANDERA ROJA CRÍTICA: Manifiesta intención de encubrimiento o complicidad ante robo o sustracción de bienes patrimoniales.',
          'OBSERVACIÓN DE PROTOCOLO: Desvío de la cadena de mando CEPS (prioriza seguridad interna de planta antes que su jefatura de grupo CEPS).',
          'ALERTA CONDUCTUAL: Autopercepción de baja tolerancia (nivel ≤ 4) ante situaciones de conflicto o presión en caseta/recorrido.',
          'ADVERTENCIA ANTECEDENTES: El aspirante niega autorización para cotejar referencias con su empleador anterior.',
        ],
        dictamenReclutador: 'no_apto',
        notasConfidenciales:
          'ALERTA CONFIDENCIAL: Aspirante responde expresamente "No digo nada" si observa a un compañero sustrayendo material. Además niega referencias de su último empleo. VETADO PARA CUALQUIER ASIGNACIÓN PATRIMONIAL.',
        evaluadoPor: 'DoAl Viascan (Reclutador en Campo)',
        fechaEvaluacion: '4 de septiembre de 2026',
      },
    },
    solicitudEmpleo: {
      curp: 'BAMM980315HCHRR08',
      rfc: 'BAMM9803157Y2',
      nss: '14169820199',
      fechaNacimiento: '1998-03-15',
      estadoCivil: 'Soltero',
      calleNumero: 'Av. De las Torres 8820',
      colonia: 'Praderas del Sol',
      codigoPostal: '32695',
      entrecalles: 'Sol de Mayo y Hiedra',
      tiempoEnJuarez: '8 años',
      ultimoEmpleoEmpresa: 'Yazaki Autopartes',
      ultimoEmpleoPuesto: 'Operador de Producción',
      ultimoEmpleoSueldo: '$2,300 semanales',
      nombreFamiliarReferencia: 'Laura Morales (Tía)',
      telefonoFamiliarReferencia: '656 123 4567',
    },
    checklistPapeleria: {
      ineOriginalPresentada: true,
      curpPresentada: true,
      rfcPresentada: false,
      nssPresentada: true,
      comprobanteDomicilioPresentado: true,
      comprobanteEstudiosPresentado: true,
      actaNacimientoPresentada: true,
      cartaNoPenalesPresentada: false,
      papeleriaCompleta: false,
      documentosPendientes: ['RFC (Constancia de Situación Fiscal)', 'Carta de No Antecedentes Penales'],
    },
    historialEventos: [
      {
        fecha: '2026-09-04 12:00',
        tipo: 'creacion',
        descripcion: 'Abordaje en Módulo Sendero Las Torres.',
        autor: 'DoAl Viascan',
      },
      {
        fecha: '2026-09-04 12:20',
        tipo: 'evaluacion_razonamiento',
        descripcion: 'Aprobó razonamiento con 3 errores.',
        autor: 'DoAl Viascan',
      },
      {
        fecha: '2026-09-04 12:45',
        tipo: 'nota_seguridad',
        descripcion: 'ACTIVACIÓN DE BANDERA ROJA EN INTEGRIDAD PATRIMONIAL. Expediente clasificado como NO CONTRATABLE.',
        autor: 'DoAl Viascan',
      },
    ],
  },
  {
    id: 'exp-1120',
    folio: 'CEPS-2026-1120',
    estatus: 'en_reserva',
    fechaCreacion: '2026-09-05',
    abordaje: {
      nombre: 'Valeria Sofía',
      apellidoPaterno: 'Escobedo',
      apellidoMaterno: 'Prieto',
      telefono: '656 441 9087',
      edad: '31',
      escolaridad: 'Carrera Técnica',
      puestoInteres: 'Vigilancia Comercial y Retail',
      moduloAbordaje: 'Módulo Monumento Benito Juárez',
      fecha: '2026-09-05',
    },
    examenRazonamiento: {
      respuestas: {
        dondeEncontroMochila: 'En el parque',
        queHabiaEnMochila: 'Una nota',
        queDeciaNota: '"Gracias por cuidar mis cosas. Mi nombre es Ana"',
        comoSeSentioAna: 'Agradecida',
        op1_40_mas: '30', // error
        op2_200_mas: '200', // error
        op3_20_mas: '15', // error
        op4_menos_60: '70', // error
        op5_menos_50: '180', // error
        op6_85_menos: '35', // error
        op7_32_mas: '10', // error
        op8_70_mas: '25', // error
        op9_78_mas: '15', // error
        op10_70_menos: '30',
        op11_96_menos: '60',
        op12_45_menos: '20',
        palabraAuto: 'No',
        pastorOvejas: '12',
        trenSobrevivientes: 'Sobreviven',
        paradojaMentira: 'Paradoja',
        huevoGallo: 'No ponen huevos',
      },
      evaluacion: {
        erroresLectura: 0,
        erroresAritmetica: 9,
        erroresLogica: 0,
        totalErrores: 9,
        aprobado: false,
        requiereComitePerfiles: true,
        observaciones: 'Tuvo 9 errores en cálculo aritmético básico. Excelente comprensión de texto y lógica.',
      },
    },
    cuestionarioEntrevista: {
      respuestas: {
        p1_valores: 'Honradez, trato digno a las personas y puntualidad.',
        p2_experienciaSeguridad: 'si',
        p3_funcionesGuardia: 'Atención al cliente en accesos, prevención de pérdidas y monitoreo de cámaras CCTV.',
        p4_reporteIncidente: 'supervisor_ceps',
        p5_reaccionRobo: 'reporto_jefe',
        p6_motivoInteres: 'experiencia',
        p6_motivoInteresDetalle: 'Deseo estabilidad y especializarme en seguridad para retail y centros comerciales.',
        p7_motivoRenuncia: 'Cambio de domicilio al poniente de la ciudad.',
        p8_descripcionExperiencia: '2 años en seguridad interna en Soriana San Lorenzo.',
        p9_autorizaReferencias: 'si',
        p10_nivelTolerancia: 8,
      },
      auditoria: {
        riesgoRobo: 'bajo_confiable',
        apegoCadenaMando: 'optimo',
        calificacionTolerancia: 'optima',
        banderasRojas: [
          'FILTRO DE RAZONAMIENTO EXCEDIDO: Registró 9 errores (límite operativo: 8). Requiere visto bueno excepcional del Comité de Perfiles.',
        ],
        dictamenReclutador: 'reserva',
        notasConfidenciales:
          'Candidata con excelente perfil actitudinal y de valores. Solo falló en el cálculo numérico rápido del examen. Se recomienda autorización del Comité para vacantes de retail o CCTV.',
        evaluadoPor: 'Eunice Lira (Supervisora)',
        fechaEvaluacion: '5 de septiembre de 2026',
      },
    },
    solicitudEmpleo: {
      curp: 'EEPV950820MCHRL01',
      rfc: 'EEPV9508209H3',
      nss: '11139530491',
      fechaNacimiento: '1995-08-20',
      estadoCivil: 'Soltero',
      calleNumero: 'Calle Melchor Ocampo 512',
      colonia: 'Barrio Alto',
      codigoPostal: '32000',
      entrecalles: 'Ignacio Mejía y Galeana',
      tiempoEnJuarez: 'Toda la vida (31 años)',
      ultimoEmpleoEmpresa: 'Soriana San Lorenzo',
      ultimoEmpleoPuesto: 'Prevención de Pérdidas',
      ultimoEmpleoSueldo: '$2,700 semanales',
      nombreFamiliarReferencia: 'Guadalupe Prieto (Madre)',
      telefonoFamiliarReferencia: '656 998 7712',
    },
    checklistPapeleria: {
      ineOriginalPresentada: true,
      curpPresentada: true,
      rfcPresentada: true,
      nssPresentada: true,
      comprobanteDomicilioPresentado: true,
      comprobanteEstudiosPresentado: true,
      actaNacimientoPresentada: true,
      cartaNoPenalesPresentada: true,
      papeleriaCompleta: true,
      documentosPendientes: [],
    },
    historialEventos: [
      {
        fecha: '2026-09-05 11:00',
        tipo: 'creacion',
        descripcion: 'Abordaje presencial en Monumento a Benito Juárez.',
        autor: 'Eunice Lira',
      },
      {
        fecha: '2026-09-05 11:30',
        tipo: 'evaluacion_razonamiento',
        descripcion: 'Examen de Razonamiento enviado a Comité de Perfiles (9 errores).',
        autor: 'Eunice Lira',
      },
    ],
  },
  {
    id: 'exp-1155',
    folio: 'CEPS-2026-1155',
    estatus: 'asignado_planta',
    fechaCreacion: '2026-09-06',
    abordaje: {
      nombre: 'Jorge Luis',
      apellidoPaterno: 'Cárdenas',
      apellidoMaterno: 'Beltrán',
      telefono: '656 220 7765',
      edad: '42',
      escolaridad: 'Secundaria',
      puestoInteres: 'Supervisor de Turno / Patrulla',
      moduloAbordaje: 'Oficina Central CEPS (Ciudad Juárez)',
      fecha: '2026-09-06',
    },
    examenRazonamiento: {
      respuestas: {
        dondeEncontroMochila: 'En el parque',
        queHabiaEnMochila: 'Una nota',
        queDeciaNota: '"Gracias por cuidar mis cosas. Mi nombre es Ana"',
        comoSeSentioAna: 'Agradecida',
        op1_40_mas: '40',
        op2_200_mas: '250',
        op3_20_mas: '25',
        op4_menos_60: '80',
        op5_menos_50: '200',
        op6_85_menos: '45',
        op7_32_mas: '0',
        op8_70_mas: '35',
        op9_78_mas: '22',
        op10_70_menos: '30',
        op11_96_menos: '60',
        op12_45_menos: '20',
        palabraAuto: 'No es correcto',
        pastorOvejas: '12',
        trenSobrevivientes: 'No se entierran sobrevivientes',
        paradojaMentira: 'Paradoja lógica',
        huevoGallo: 'Gallos no ponen',
      },
      evaluacion: {
        erroresLectura: 0,
        erroresAritmetica: 0,
        erroresLogica: 0,
        totalErrores: 0,
        aprobado: true,
        requiereComitePerfiles: false,
        observaciones: 'Evaluación perfecta. Candidato con perfil sólido para mando.',
      },
    },
    cuestionarioEntrevista: {
      respuestas: {
        p1_valores: 'Disciplina marcial, honestidad absoluta, liderazgo y responsabilidad civil.',
        p2_experienciaSeguridad: 'si',
        p3_funcionesGuardia: 'Pase de lista de oficiales, verificación de consignas específicas, patrullaje móvil y reporte inmediato a central de monitoreo.',
        p4_reporteIncidente: 'supervisor_ceps',
        p5_reaccionRobo: 'reporto_jefe',
        p6_motivoInteres: 'experiencia',
        p6_motivoInteresDetalle: 'Conozco la seriedad de CEPS y busco una posición de liderazgo de grupo.',
        p7_motivoRenuncia: 'Reestructuración de turnos en mi anterior empleador.',
        p8_descripcionExperiencia: '10 años en seguridad privada en Ciudad Juárez, 4 de ellos como jefe de turno en maquilas del Parque Bermúdez.',
        p9_autorizaReferencias: 'si',
        p10_nivelTolerancia: 10,
      },
      auditoria: {
        riesgoRobo: 'bajo_confiable',
        apegoCadenaMando: 'optimo',
        calificacionTolerancia: 'optima',
        banderasRojas: [],
        dictamenReclutador: 'apto',
        notasConfidenciales: 'Perfil de alto mando. Recomendado ampliamente para asignación de supervisión en planta de alta exigencia.',
        evaluadoPor: 'Dirección Operativa CEPS',
        fechaEvaluacion: '6 de septiembre de 2026',
      },
    },
    solicitudEmpleo: {
      curp: 'CABJ840218HCHRR04',
      rfc: 'CABJ8402183M9',
      nss: '12048419203',
      fechaNacimiento: '1984-02-18',
      estadoCivil: 'Casado',
      calleNumero: 'Calle Durango 1420',
      colonia: 'Salvarcar',
      codigoPostal: '32580',
      entrecalles: 'Zaragoza y Ramón Rayón',
      tiempoEnJuarez: 'Toda la vida (42 años)',
      ultimoEmpleoEmpresa: 'BRP México',
      ultimoEmpleoPuesto: 'Supervisor de Caseta',
      ultimoEmpleoSueldo: '$3,800 semanales',
      nombreFamiliarReferencia: 'Claudia Beltrán (Hermana)',
      telefonoFamiliarReferencia: '656 880 1199',
    },
    checklistPapeleria: {
      ineOriginalPresentada: true,
      curpPresentada: true,
      rfcPresentada: true,
      nssPresentada: true,
      comprobanteDomicilioPresentado: true,
      comprobanteEstudiosPresentado: true,
      actaNacimientoPresentada: true,
      cartaNoPenalesPresentada: true,
      papeleriaCompleta: true,
      documentosPendientes: [],
    },
    vacanteAsignada: {
      vacanteId: 'vac-02',
      empresa: 'Lear Corporation Planta La Cuesta',
      planta: 'Planta de Vestiduras Automotrices',
      puesto: 'Supervisor de Turno / Patrulla',
      turno: 'Turno Nocturno Industrial (4x3)',
      fechaAsignacion: '2026-09-06',
    },
    historialEventos: [
      {
        fecha: '2026-09-06 09:30',
        tipo: 'creacion',
        descripcion: 'Registro directo en Oficina Central CEPS.',
        autor: 'Eunice Lira',
      },
      {
        fecha: '2026-09-06 10:15',
        tipo: 'evaluacion_razonamiento',
        descripcion: 'Razonamiento perfecto: 0 errores.',
        autor: 'Eunice Lira',
      },
      {
        fecha: '2026-09-06 11:00',
        tipo: 'asignacion_vacante',
        descripcion: 'Asignado a Lear Corporation La Cuesta.',
        autor: 'Dirección Operativa CEPS',
      },
    ],
  },
  {
    id: 'exp-1192',
    folio: 'CEPS-2026-1192',
    estatus: 'aprobado_servicio',
    fechaCreacion: '2026-09-07',
    abordaje: {
      nombre: 'Brayan Alexis',
      apellidoPaterno: 'Trejo',
      apellidoMaterno: 'Montes',
      telefono: '656 501 3498',
      edad: '22',
      escolaridad: 'Preparatoria / Bachillerato',
      puestoInteres: 'Guardia de Seguridad Industrial 12x12',
      moduloAbordaje: 'Módulo S-Mart Independencia',
      fecha: '2026-09-07',
    },
    examenRazonamiento: {
      respuestas: {
        dondeEncontroMochila: 'En el parque',
        queHabiaEnMochila: 'Una nota',
        queDeciaNota: '"Gracias por cuidar mis cosas. Mi nombre es Ana"',
        comoSeSentioAna: 'Agradecida',
        op1_40_mas: '40',
        op2_200_mas: '250',
        op3_20_mas: '25',
        op4_menos_60: '80',
        op5_menos_50: '200',
        op6_85_menos: '45',
        op7_32_mas: '0',
        op8_70_mas: '35',
        op9_78_mas: '22',
        op10_70_menos: '30',
        op11_96_menos: '60',
        op12_45_menos: '20',
        palabraAuto: 'No',
        pastorOvejas: '12',
        trenSobrevivientes: 'No se entierran',
        paradojaMentira: 'Paradoja',
        huevoGallo: 'No ponen',
      },
      evaluacion: {
        erroresLectura: 0,
        erroresAritmetica: 0,
        erroresLogica: 1,
        totalErrores: 1,
        aprobado: true,
        requiereComitePerfiles: false,
        observaciones: 'Aprobado con 1 solo error en lógica.',
      },
    },
    cuestionarioEntrevista: {
      respuestas: {
        p1_valores: 'Respeto, disciplina y ganas de salir adelante honradamente.',
        p2_experienciaSeguridad: 'no',
        p3_funcionesGuardia: 'Vigilar que nadie dañe las instalaciones ni robe material.',
        p4_reporteIncidente: 'jefe_grupo_ceps',
        p5_reaccionRobo: 'reporto_jefe',
        p6_motivoInteres: 'sueldo',
        p6_motivoInteresDetalle: 'Busco estabilidad y superación personal.',
        p7_motivoRenuncia: 'Terminación de contrato temporal en tienda de conveniencia.',
        p8_descripcionExperiencia: 'Cajero y acomodador en Oxxo durante 1 año.',
        p9_autorizaReferencias: 'si',
        p10_nivelTolerancia: 8,
      },
      auditoria: {
        riesgoRobo: 'bajo_confiable',
        apegoCadenaMando: 'optimo',
        calificacionTolerancia: 'optima',
        banderasRojas: [],
        dictamenReclutador: 'apto',
        notasConfidenciales: 'Joven con buena actitud, dispuesto a capacitarse. Apto para guardia en turno regular.',
        evaluadoPor: 'Juan Antonio Ramos',
        fechaEvaluacion: '7 de septiembre de 2026',
      },
    },
    solicitudEmpleo: {
      curp: 'TEMB040110HCHRN01',
      rfc: 'TEMB0401104V1',
      nss: '12220419021',
      fechaNacimiento: '2004-01-10',
      estadoCivil: 'Soltero',
      calleNumero: 'Calle Mesa Central 201',
      colonia: 'Olivia Espinoza',
      codigoPostal: '32690',
      entrecalles: 'Palo Blanco y Olmo',
      tiempoEnJuarez: 'Toda la vida (22 años)',
      ultimoEmpleoEmpresa: 'Cadena Comercial Oxxo',
      ultimoEmpleoPuesto: 'Empleado de Mostrador',
      ultimoEmpleoSueldo: '$2,100 semanales',
      nombreFamiliarReferencia: 'Carmen Montes (Madre)',
      telefonoFamiliarReferencia: '656 777 8899',
    },
    checklistPapeleria: {
      ineOriginalPresentada: true,
      curpPresentada: true,
      rfcPresentada: true,
      nssPresentada: true,
      comprobanteDomicilioPresentado: true,
      comprobanteEstudiosPresentado: true,
      actaNacimientoPresentada: true,
      cartaNoPenalesPresentada: false,
      papeleriaCompleta: false,
      documentosPendientes: ['Carta de No Antecedentes Penales (en trámite)'],
    },
    historialEventos: [
      {
        fecha: '2026-09-07 09:10',
        tipo: 'creacion',
        descripcion: 'Abordaje en Módulo S-Mart Independencia.',
        autor: 'Juan Antonio Ramos',
      },
      {
        fecha: '2026-09-07 09:40',
        tipo: 'evaluacion_razonamiento',
        descripcion: 'Aprobó Examen de Razonamiento VER5 con 1 error.',
        autor: 'Juan Antonio Ramos',
      },
      {
        fecha: '2026-09-07 10:10',
        tipo: 'entrevista_rh',
        descripcion: 'Cuestionario de entrevista aprobado sin banderas rojas. Listo para asignación en vacante operativa.',
        autor: 'Juan Antonio Ramos',
      },
    ],
  },
]

interface DossierStoreState {
  expedientes: ExpedienteGuardia[]
  expedienteSeleccionadoId: string | null
  filtroEstatus: 'todos' | EstatusExpediente
  busqueda: string
  filtroModulo: string
  modalEntrevistaAbierto: boolean

  // Acciones
  setExpedienteSeleccionadoId: (id: string | null) => void
  setFiltroEstatus: (estatus: 'todos' | EstatusExpediente) => void
  setBusqueda: (busqueda: string) => void
  setFiltroModulo: (modulo: string) => void
  setModalEntrevistaAbierto: (abierto: boolean) => void

  guardarNuevoExpediente: (nuevo: ExpedienteGuardia) => void
  actualizarNotasConfidenciales: (
    id: string,
    notas: string,
    dictamen?: 'apto' | 'reserva' | 'no_apto'
  ) => void
  asignarVacanteAExpediente: (
    expedienteId: string,
    vacante: {
      vacanteId: string
      empresa: string
      planta: string
      puesto: string
      turno: string
    }
  ) => void
  reiniciarDemoDossiers: () => void
}

export const useDossierStore = create<DossierStoreState>()(
  persist(
    (set) => ({
      expedientes: seedExpedientes,
      expedienteSeleccionadoId: seedExpedientes[0].id,
      filtroEstatus: 'todos',
      busqueda: '',
      filtroModulo: 'todos',
      modalEntrevistaAbierto: false,

      setExpedienteSeleccionadoId: (id) => set({ expedienteSeleccionadoId: id }),
      setFiltroEstatus: (estatus) => set({ filtroEstatus: estatus }),
      setBusqueda: (busqueda) => set({ busqueda }),
      setFiltroModulo: (filtroModulo) => set({ filtroModulo }),
      setModalEntrevistaAbierto: (modalEntrevistaAbierto) => set({ modalEntrevistaAbierto }),

      guardarNuevoExpediente: (nuevo) => {
        set((state) => ({
          expedientes: [nuevo, ...state.expedientes],
          expedienteSeleccionadoId: nuevo.id,
          modalEntrevistaAbierto: false,
        }))
      },

      actualizarNotasConfidenciales: (id, notas, dictamen) => {
        set((state) => ({
          expedientes: state.expedientes.map((exp) => {
            if (exp.id !== id) return exp
            const nuevaAuditoria = {
              ...exp.cuestionarioEntrevista.auditoria,
              notasConfidenciales: notas,
              dictamenReclutador: dictamen ?? exp.cuestionarioEntrevista.auditoria.dictamenReclutador,
            }
            let nuevoEstatus = exp.estatus
            if (dictamen === 'no_apto') nuevoEstatus = 'vetado_alerta'
            else if (dictamen === 'reserva') nuevoEstatus = 'en_reserva'
            else if (dictamen === 'apto' && exp.estatus === 'vetado_alerta') nuevoEstatus = 'aprobado_servicio'

            return {
              ...exp,
              estatus: nuevoEstatus,
              cuestionarioEntrevista: {
                ...exp.cuestionarioEntrevista,
                auditoria: nuevaAuditoria,
              },
              historialEventos: [
                ...exp.historialEventos,
                {
                  fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  tipo: 'nota_seguridad',
                  descripcion: `Actualización de notas y dictamen: ${dictamen ?? 'sin cambio'}.`,
                  autor: 'Supervisor RH',
                },
              ],
            }
          }),
        }))
      },

      asignarVacanteAExpediente: (expedienteId, vacante) => {
        const fechaActual = new Date().toISOString().substring(0, 10)
        set((state) => ({
          expedientes: state.expedientes.map((exp) => {
            if (exp.id !== expedienteId) return exp
            return {
              ...exp,
              estatus: 'asignado_planta',
              vacanteAsignada: {
                ...vacante,
                fechaAsignacion: fechaActual,
              },
              historialEventos: [
                ...exp.historialEventos,
                {
                  fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  tipo: 'asignacion_vacante',
                  descripcion: `Asignado a ${vacante.empresa} (${vacante.planta}) en ${vacante.puesto}.`,
                  autor: 'Gestor Operativo CEPS',
                },
              ],
            }
          }),
        }))
      },

      reiniciarDemoDossiers: () => {
        set({
          expedientes: seedExpedientes,
          expedienteSeleccionadoId: seedExpedientes[0].id,
          busqueda: '',
          filtroEstatus: 'todos',
          filtroModulo: 'todos',
        })
      },
    }),
    {
      name: 'ceps_dossiers_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
