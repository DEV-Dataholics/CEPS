import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type VacancyInput, type MotivoEspera } from '../schemas/vacancySchema'

export interface AspiranteSolicitud {
  id: string
  folio: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  telefono: string
  edad: string
  curp: string
  rfc: string
  puestoDeseado: string
  moduloAbordaje: string
  fechaCaptura: string // 'hoy' | 'ayer' | 'semana' | string ISO
  fechaEtiqueta: string
  colonia: string
  zonaJuarez: string
  latitud: number
  longitud: number
  estatus: 'nuevo' | 'asignado' | 'en_espera'
  vacanteAsignadaId?: string
  motivoEspera?: MotivoEspera | string
  documentosAdjuntos: string[]
}

export interface Vacante {
  id: string
  empresa: string
  planta: string
  zona: string
  puesto: string
  turno: string
  plazasTotales: number
  sueldoSemanal: string
  prestaciones: string
  requisitos?: string
  aspirantesAsignadosIds: string[]
  fechaCreacion: string
  estado: 'abierta' | 'cubierta' | 'pausada'
}

export interface VacancyStoreState {
  vacantes: Vacante[]
  aspirantes: AspiranteSolicitud[]
  filtroModulo: string
  filtroFecha: string
  pestañaBandeja: 'nuevas' | 'espera' | 'asignadas'
  busqueda: string
  candidatoSeleccionadoId: string | null

  // Acciones
  setFiltroModulo: (modulo: string) => void
  setFiltroFecha: (fecha: string) => void
  setPestañaBandeja: (pestaña: 'nuevas' | 'espera' | 'asignadas') => void
  setBusqueda: (busqueda: string) => void
  setCandidatoSeleccionadoId: (id: string | null) => void

  // Gestión de Vacantes
  crearVacante: (input: VacancyInput) => void
  editarVacante: (id: string, input: Partial<Vacante>) => void
  eliminarVacante: (id: string) => void

  // Empate y Asignación
  asignarAspiranteAVacante: (aspiranteId: string, vacanteId: string) => void
  desasignarAspirante: (aspiranteId: string) => void
  ponerAspiranteEnEspera: (aspiranteId: string, motivo: MotivoEspera | string) => void
  reactivarAspiranteDeEspera: (aspiranteId: string) => void

  // Ingesta desde Portal Candidato
  registrarAspiranteDesdePortal: (aspirante: Omit<AspiranteSolicitud, 'id'>) => void
  reiniciarDatosDemo: () => void
}

// Vacantes iniciales representativas de maquilas de Ciudad Juárez
const vacantesIniciales: Vacante[] = [
  {
    id: 'vac-1',
    empresa: 'Lear Corporation',
    planta: 'Planta San Lorenzo',
    zona: 'Parque Industrial San Jerónimo',
    puesto: 'Guardia de Seguridad Industrial 12x12',
    turno: '12x12 Rol de Turnos (4x3)',
    plazasTotales: 5,
    sueldoSemanal: '$3,450 netos',
    prestaciones: 'Transporte gratuito + Comedor subsidiado + Bono puntualidad',
    requisitos: 'Experiencia mínima 1 año en maquila, cartas laborales legibles.',
    aspirantesAsignadosIds: ['sol-201', 'sol-202'],
    fechaCreacion: '2026-09-01',
    estado: 'abierta',
  },
  {
    id: 'vac-2',
    empresa: 'Foxconn México',
    planta: 'Campus Las Lomas',
    zona: 'Carretera a Casas Grandes',
    puesto: 'Custodia Intramuros Maquiladora',
    turno: 'Turno 1 (Mañana 5x2 de 06:00 a 15:30)',
    plazasTotales: 8,
    sueldoSemanal: '$3,600 netos',
    prestaciones: 'Fondo de ahorro + Vales de despensa + Bono asistencia',
    requisitos: 'Manejo básico de bitácora y control de accesos vehiculares.',
    aspirantesAsignadosIds: ['sol-203', 'sol-204', 'sol-205'],
    fechaCreacion: '2026-09-02',
    estado: 'abierta',
  },
  {
    id: 'vac-3',
    empresa: 'Flex Internacional',
    planta: 'Planta Río Bravo',
    zona: 'Parque Industrial Bermúdez',
    puesto: 'Vigilancia y Control de Andenes',
    turno: 'Turno 2 (Tarde 5x2 de 15:30 a 23:00)',
    plazasTotales: 3,
    sueldoSemanal: '$3,300 netos',
    prestaciones: 'Prestaciones de ley + Seguro de vida + Uniforme completo',
    requisitos: 'Revisión de gafetes y control de proveedores.',
    aspirantesAsignadosIds: ['sol-206', 'sol-207', 'sol-208'],
    fechaCreacion: '2026-09-03',
    estado: 'cubierta',
  },
  {
    id: 'vac-4',
    empresa: 'BRP México',
    planta: 'Planta 2 Juárez',
    zona: 'Parque Industrial Intermex',
    puesto: 'Guardia Industrial 12x12 Especializado',
    turno: '12x12 Nocturno',
    plazasTotales: 6,
    sueldoSemanal: '$3,750 netos',
    prestaciones: 'Transporte directo + Bono nocturno + Apoyo escolar',
    requisitos: 'Sin antecedentes penales, prueba antidoping negativa.',
    aspirantesAsignadosIds: ['sol-209'],
    fechaCreacion: '2026-09-04',
    estado: 'abierta',
  },
  {
    id: 'vac-5',
    empresa: 'Fracc. Campos Elíseos',
    planta: 'Caseta Monumental Norte',
    zona: 'Zona Campos Elíseos',
    puesto: 'Seguridad Residencial y Control de Acceso',
    turno: 'Turno 12x12 Mixto',
    plazasTotales: 3,
    sueldoSemanal: '$3,400 netos',
    prestaciones: 'Prestaciones superiores + Capacitación continua',
    requisitos: 'Excelente trato al cliente y presentación ejecutiva.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-05',
    estado: 'abierta',
  },
  {
    id: 'vac-6',
    empresa: 'Aptiv México',
    planta: 'Planta Los Aztecas',
    zona: 'Parque Industrial Río Bravo',
    puesto: 'Guardia de Control de Accesos y Andenes',
    turno: 'Turno 1 (Mañana 5x2 de 06:00 a 15:30)',
    plazasTotales: 5,
    sueldoSemanal: '$3,500 netos',
    prestaciones: 'Transporte de personal + Vales de despensa + Bono mensual',
    requisitos: 'Manejo de equipo de radiocomunicación y revisión de mercancías.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-05',
    estado: 'abierta',
  },
  {
    id: 'vac-7',
    empresa: 'Bosch Rexroth',
    planta: 'Planta Electrónica Juárez',
    zona: 'Parque Industrial Juárez',
    puesto: 'Guardia de Seguridad Patrimonial',
    turno: '12x12 Rotativo',
    plazasTotales: 4,
    sueldoSemanal: '$3,800 netos',
    prestaciones: 'Seguro de vida + Fondo de ahorro + Comedor 100% subsidiado',
    requisitos: 'Experiencia en plantas automotrices o electrónicas.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-05',
    estado: 'abierta',
  },
  {
    id: 'vac-8',
    empresa: 'Yazaki Components',
    planta: 'Planta Torres',
    zona: 'Av. de las Torres',
    puesto: 'Custodia de Embarques y Andén de Carga',
    turno: 'Turno 2 (Tarde 5x2 de 15:30 a 23:00)',
    plazasTotales: 6,
    sueldoSemanal: '$3,450 netos',
    prestaciones: 'Bono de puntualidad + Uniformes completos + Apoyo de transporte',
    requisitos: 'Inspección de tractocamiones y sellos de seguridad C-TPAT.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-06',
    estado: 'abierta',
  },
  {
    id: 'vac-9',
    empresa: 'CommScope Juárez',
    planta: 'Planta Prados del Norte',
    zona: 'Parque Industrial Bermúdez',
    puesto: 'Vigilante Monitorista CCTV & Accesos',
    turno: '12x12 Diurno',
    plazasTotales: 3,
    sueldoSemanal: '$4,100 netos',
    prestaciones: 'Seguro médico mayor + Vales de despensa + Bono trimestral',
    requisitos: 'Conocimiento intermedio de monitoreo de cámaras y alarmas.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-06',
    estado: 'abierta',
  },
  {
    id: 'vac-10',
    empresa: 'Wistron México',
    planta: 'Planta Zaragoza',
    zona: 'Blvd. Zaragoza',
    puesto: 'Guardia Industrial de Patio y Perímetro',
    turno: '12x12 Nocturno',
    plazasTotales: 5,
    sueldoSemanal: '$3,650 netos',
    prestaciones: 'Bono nocturno + Servicio de comedor + Transporte garantizado',
    requisitos: 'Disponibilidad para turno nocturno fijo.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-06',
    estado: 'abierta',
  },
  {
    id: 'vac-11',
    empresa: 'Honeywell Aerospace',
    planta: 'Planta AeroJuárez',
    zona: 'Parque Industrial AeroJuárez',
    puesto: 'Oficial de Seguridad Industrial Especializado',
    turno: 'Turno 12x12 Mixto (4x3)',
    plazasTotales: 4,
    sueldoSemanal: '$4,200 netos',
    prestaciones: 'Prestaciones superiores + Fondo de ahorro + Seguro de vida',
    requisitos: 'Cartilla militar liberada, cartas de recomendación comprobables.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-06',
    estado: 'abierta',
  },
  {
    id: 'vac-12',
    empresa: 'Pegatron México',
    planta: 'Campus Panamericana',
    zona: 'Panamericana Sur',
    puesto: 'Custodio Intramuros de Alta Rotación',
    turno: 'Turno 1 (Mañana 5x2 de 06:00 a 15:30)',
    plazasTotales: 7,
    sueldoSemanal: '$3,550 netos',
    prestaciones: 'Comedor gratuito + Transporte exprés + Bono de contratación',
    requisitos: 'Excelente condición física y trato cordial con operadores.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-07',
    estado: 'abierta',
  },
  {
    id: 'vac-13',
    empresa: 'Electrolux México',
    planta: 'Planta Electro Sur',
    zona: 'Parque Industrial Independencia',
    puesto: 'Control de Acceso Vehicular y Estacionamiento',
    turno: 'Turno 2 (Tarde 5x2 de 15:30 a 23:00)',
    plazasTotales: 4,
    sueldoSemanal: '$3,400 netos',
    prestaciones: 'Vales de despensa + Seguro de vida + Uniforme táctico',
    requisitos: 'Revisión y registro de automóviles en caseta principal.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-07',
    estado: 'abierta',
  },
  {
    id: 'vac-14',
    empresa: 'Johnson Controls',
    planta: 'Planta Automotriz Juárez',
    zona: 'Parque Industrial Río Bravo',
    puesto: 'Supervisor Operativo de Turno en Caseta',
    turno: '12x12 Rotativo',
    plazasTotales: 2,
    sueldoSemanal: '$4,500 netos',
    prestaciones: 'Prestaciones ejecutivas + Vales + Capacitación en primeros auxilios',
    requisitos: 'Experiencia mínima 2 años como jefe de turno o líder de seguridad.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-07',
    estado: 'abierta',
  },
  {
    id: 'vac-15',
    empresa: 'The Toro Company',
    planta: 'Planta Maquinaria Juárez',
    zona: 'Parque Industrial Américas',
    puesto: 'Guardia de Prevención de Pérdidas y Vigilancia',
    turno: '12x12 Diurno',
    plazasTotales: 4,
    sueldoSemanal: '$3,700 netos',
    prestaciones: 'Comedor subsidiado + Bono por no incidencias + Transporte',
    requisitos: 'Conocimiento de protocolos de evacuación y rondines perimetrales.',
    aspirantesAsignadosIds: [],
    fechaCreacion: '2026-09-07',
    estado: 'abierta',
  },
]

// Solicitudes iniciales representativas capturadas en módulos de abordaje
const aspirantesIniciales: AspiranteSolicitud[] = [
  {
    id: 'sol-101',
    folio: 'CEPS-2026-4892',
    nombre: 'Jorge Alejandro',
    apellidoPaterno: 'Medina',
    apellidoMaterno: 'Castillo',
    telefono: '(656) 438-9210',
    edad: '34',
    curp: 'MECJ920514HCHDRR08',
    rfc: 'MECJ920514QR3',
    puestoDeseado: 'Guardia de Seguridad Industrial 12x12',
    moduloAbordaje: 'Módulo S-Mart Independencia',
    fechaCaptura: 'hoy',
    fechaEtiqueta: 'Hoy, 10:15 AM',
    colonia: 'Col. Tierra Nueva II',
    zonaJuarez: 'Suroriente / Las Torres',
    latitud: 31.6324,
    longitud: -106.3789,
    estatus: 'nuevo',
    documentosAdjuntos: ['INE', 'RFC', 'No Penales'],
  },
  {
    id: 'sol-102',
    folio: 'CEPS-2026-3114',
    nombre: 'Rosa María',
    apellidoPaterno: 'Hinojosa',
    apellidoMaterno: 'Valles',
    telefono: '(656) 291-0482',
    edad: '29',
    curp: 'HIVR970822MCHNL02',
    rfc: 'HIVR970822PL9',
    puestoDeseado: 'Custodia Intramuros Maquiladora',
    moduloAbordaje: 'Módulo Monumento Benito Juárez',
    fechaCaptura: 'hoy',
    fechaEtiqueta: 'Hoy, 09:40 AM',
    colonia: 'Col. Bellavista',
    zonaJuarez: 'Zona Centro',
    latitud: 31.7381,
    longitud: -106.4891,
    estatus: 'nuevo',
    documentosAdjuntos: ['INE', 'RFC'],
  },
  {
    id: 'sol-103',
    folio: 'CEPS-2026-5819',
    nombre: 'Carlos Alberto',
    apellidoPaterno: 'Domínguez',
    apellidoMaterno: 'Sáenz',
    telefono: '(656) 193-8472',
    edad: '41',
    curp: 'DOSC850311HCHMN04',
    rfc: 'DOSC850311KJ1',
    puestoDeseado: 'Guardia Industrial 12x12 Especializado',
    moduloAbordaje: 'Módulo Sendero Las Torres',
    fechaCaptura: 'ayer',
    fechaEtiqueta: 'Ayer, 04:20 PM',
    colonia: 'Col. Praderas del Sol',
    zonaJuarez: 'Suroriente',
    latitud: 31.6198,
    longitud: -106.3812,
    estatus: 'nuevo',
    documentosAdjuntos: ['INE', 'RFC', 'No Penales'],
  },
  {
    id: 'sol-104',
    folio: 'CEPS-2026-2290',
    nombre: 'Brenda Yazmín',
    apellidoPaterno: 'Ontiveros',
    apellidoMaterno: 'Chávez',
    telefono: '(656) 304-9128',
    edad: '31',
    curp: 'OICB950103MCHTRR05',
    rfc: 'OICB950103TR4',
    puestoDeseado: 'Vigilancia Comercial y Retail',
    moduloAbordaje: 'Módulo S-Mart Independencia',
    fechaCaptura: 'ayer',
    fechaEtiqueta: 'Ayer, 11:30 AM',
    colonia: 'Col. Morelos III',
    zonaJuarez: 'Las Torres',
    latitud: 31.6355,
    longitud: -106.3921,
    estatus: 'en_espera',
    motivoEspera: 'Preferencia por turno matutino (5x2)',
    documentosAdjuntos: ['INE'],
  },
  {
    id: 'sol-105',
    folio: 'CEPS-2026-6401',
    nombre: 'Edgar Fernando',
    apellidoPaterno: 'Soto',
    apellidoMaterno: 'Morales',
    telefono: '(656) 512-8873',
    edad: '38',
    curp: 'SOME880719HCHNL09',
    rfc: 'SOME880719LK2',
    puestoDeseado: 'Supervisor de Turno / Patrulla',
    moduloAbordaje: 'Oficina Central CEPS (Ciudad Juárez)',
    fechaCaptura: 'semana',
    fechaEtiqueta: '04/Sep/2026',
    colonia: 'Col. Melchor Ocampo',
    zonaJuarez: 'Poniente',
    latitud: 31.7212,
    longitud: -106.4718,
    estatus: 'en_espera',
    motivoEspera: 'Pendiente de entrega de Carta de No Antecedentes Penales',
    documentosAdjuntos: ['INE', 'RFC'],
  },
  // Asignados a vacantes para reflejar cupos existentes
  {
    id: 'sol-201',
    folio: 'CEPS-2026-1001',
    nombre: 'Martín',
    apellidoPaterno: 'López',
    apellidoMaterno: 'Gómez',
    telefono: '(656) 612-4019',
    edad: '36',
    curp: 'LOGM900101HCH',
    rfc: 'LOGM900101',
    puestoDeseado: 'Guardia Industrial',
    moduloAbordaje: 'Módulo S-Mart Independencia',
    fechaCaptura: 'semana',
    fechaEtiqueta: '01/Sep/2026',
    colonia: 'Col. Parajes del Sol',
    zonaJuarez: 'Suroriente',
    latitud: 31.6255,
    longitud: -106.3755,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-1',
    documentosAdjuntos: ['INE', 'RFC', 'No Penales'],
  },
  {
    id: 'sol-202',
    folio: 'CEPS-2026-1002',
    nombre: 'Ramón',
    apellidoPaterno: 'Estrada',
    apellidoMaterno: 'Pérez',
    telefono: '(656) 781-9023',
    edad: '40',
    curp: 'EAPR860202HCH',
    rfc: 'EAPR860202',
    puestoDeseado: 'Guardia Industrial',
    moduloAbordaje: 'Módulo Monumento Benito Juárez',
    fechaCaptura: 'semana',
    fechaEtiqueta: '02/Sep/2026',
    colonia: 'Col. Chaveña',
    zonaJuarez: 'Centro',
    latitud: 31.7312,
    longitud: -106.4789,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-1',
    documentosAdjuntos: ['INE', 'RFC', 'No Penales'],
  },
  {
    id: 'sol-203',
    folio: 'CEPS-2026-1003',
    nombre: 'Guadalupe',
    apellidoPaterno: 'Reyes',
    apellidoMaterno: 'Hernández',
    telefono: '(656) 590-2134',
    edad: '33',
    curp: 'REHG930303MCH',
    rfc: 'REHG930303',
    puestoDeseado: 'Custodia Intramuros',
    moduloAbordaje: 'Módulo Sendero Las Torres',
    fechaCaptura: 'semana',
    fechaEtiqueta: '02/Sep/2026',
    colonia: 'Col. Infonavit Casas Grandes',
    zonaJuarez: 'Oriente',
    latitud: 31.6789,
    longitud: -106.3989,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-2',
    documentosAdjuntos: ['INE', 'RFC'],
  },
  {
    id: 'sol-204',
    folio: 'CEPS-2026-1004',
    nombre: 'Jesús',
    apellidoPaterno: 'Armendáriz',
    apellidoMaterno: 'Cano',
    telefono: '(656) 412-8877',
    edad: '45',
    curp: 'ARCJ810404HCH',
    rfc: 'ARCJ810404',
    puestoDeseado: 'Custodia Intramuros',
    moduloAbordaje: 'Módulo S-Mart Independencia',
    fechaCaptura: 'semana',
    fechaEtiqueta: '02/Sep/2026',
    colonia: 'Col. Las Aztecas',
    zonaJuarez: 'Poniente',
    latitud: 31.6899,
    longitud: -106.4421,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-2',
    documentosAdjuntos: ['INE', 'RFC', 'No Penales'],
  },
  {
    id: 'sol-205',
    folio: 'CEPS-2026-1005',
    nombre: 'Daniel',
    apellidoPaterno: 'Corral',
    apellidoMaterno: 'Vega',
    telefono: '(656) 321-9988',
    edad: '27',
    curp: 'COVD990505HCH',
    rfc: 'COVD990505',
    puestoDeseado: 'Custodia Intramuros',
    moduloAbordaje: 'Oficina Central CEPS',
    fechaCaptura: 'semana',
    fechaEtiqueta: '03/Sep/2026',
    colonia: 'Col. Anapra',
    zonaJuarez: 'Norponiente',
    latitud: 31.7511,
    longitud: -106.5312,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-2',
    documentosAdjuntos: ['INE', 'RFC'],
  },
  {
    id: 'sol-206',
    folio: 'CEPS-2026-1006',
    nombre: 'Víctor Hugo',
    apellidoPaterno: 'Treviño',
    apellidoMaterno: 'Salas',
    telefono: '(656) 555-1234',
    edad: '39',
    curp: 'TRSV870606HCH',
    rfc: 'TRSV870606',
    puestoDeseado: 'Vigilancia Andenes',
    moduloAbordaje: 'Módulo Sendero Las Torres',
    fechaCaptura: 'semana',
    fechaEtiqueta: '03/Sep/2026',
    colonia: 'Col. Campestre Virreyes',
    zonaJuarez: 'Oriente',
    latitud: 31.6544,
    longitud: -106.4123,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-3',
    documentosAdjuntos: ['INE', 'RFC', 'No Penales'],
  },
  {
    id: 'sol-207',
    folio: 'CEPS-2026-1007',
    nombre: 'Salvador',
    apellidoPaterno: 'Rios',
    apellidoMaterno: 'Navarro',
    telefono: '(656) 444-5678',
    edad: '43',
    curp: 'RINS830707HCH',
    rfc: 'RINS830707',
    puestoDeseado: 'Vigilancia Andenes',
    moduloAbordaje: 'Módulo Monumento Benito Juárez',
    fechaCaptura: 'semana',
    fechaEtiqueta: '03/Sep/2026',
    colonia: 'Col. Salvárcar',
    zonaJuarez: 'Suroriente',
    latitud: 31.6412,
    longitud: -106.3689,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-3',
    documentosAdjuntos: ['INE', 'RFC'],
  },
  {
    id: 'sol-208',
    folio: 'CEPS-2026-1008',
    nombre: 'Luis Ángel',
    apellidoPaterno: 'Barraza',
    apellidoMaterno: 'Meza',
    telefono: '(656) 333-9012',
    edad: '30',
    curp: 'BAML960808HCH',
    rfc: 'BAML960808',
    puestoDeseado: 'Vigilancia Andenes',
    moduloAbordaje: 'Módulo S-Mart Independencia',
    fechaCaptura: 'semana',
    fechaEtiqueta: '03/Sep/2026',
    colonia: 'Col. Granjas de Chapultepec',
    zonaJuarez: 'Sur',
    latitud: 31.6388,
    longitud: -106.4322,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-3',
    documentosAdjuntos: ['INE', 'RFC', 'No Penales'],
  },
  {
    id: 'sol-209',
    folio: 'CEPS-2026-1009',
    nombre: 'Felipe',
    apellidoPaterno: 'Orozco',
    apellidoMaterno: 'Pacheco',
    telefono: '(656) 222-3344',
    edad: '37',
    curp: 'OOPF890909HCH',
    rfc: 'OOPF890909',
    puestoDeseado: 'Guardia Industrial',
    moduloAbordaje: 'Oficina Central CEPS',
    fechaCaptura: 'semana',
    fechaEtiqueta: '04/Sep/2026',
    colonia: 'Col. Postal',
    zonaJuarez: 'Poniente',
    latitud: 31.7102,
    longitud: -106.4801,
    estatus: 'asignado',
    vacanteAsignadaId: 'vac-4',
    documentosAdjuntos: ['INE', 'RFC', 'No Penales'],
  },
]

export const useVacancyStore = create<VacancyStoreState>()(
  persist(
    (set) => ({
      vacantes: vacantesIniciales,
      aspirantes: aspirantesIniciales,
      filtroModulo: 'todos',
      filtroFecha: 'todos',
      pestañaBandeja: 'nuevas',
      busqueda: '',
      candidatoSeleccionadoId: null,

      setFiltroModulo: (filtroModulo) => set({ filtroModulo }),
      setFiltroFecha: (filtroFecha) => set({ filtroFecha }),
      setPestañaBandeja: (pestañaBandeja) => set({ pestañaBandeja }),
      setBusqueda: (busqueda) => set({ busqueda }),
      setCandidatoSeleccionadoId: (candidatoSeleccionadoId) => set({ candidatoSeleccionadoId }),

      crearVacante: (input) =>
        set((state) => {
          const nueva: Vacante = {
            id: `vac-${Date.now()}`,
            empresa: input.empresa,
            planta: input.planta,
            zona: input.zona,
            puesto: input.puesto,
            turno: input.turno,
            plazasTotales: input.plazasTotales,
            sueldoSemanal: input.sueldoSemanal,
            prestaciones: input.prestaciones,
            requisitos: input.requisitos,
            aspirantesAsignadosIds: [],
            fechaCreacion: new Date().toISOString().split('T')[0],
            estado: 'abierta',
          }
          return { vacantes: [nueva, ...state.vacantes] }
        }),

      editarVacante: (id, input) =>
        set((state) => ({
          vacantes: state.vacantes.map((v) => (v.id === id ? { ...v, ...input } : v)),
        })),

      eliminarVacante: (id) =>
        set((state) => ({
          vacantes: state.vacantes.filter((v) => v.id !== id),
          // Si tenía asignados, pasarlos a nuevo
          aspirantes: state.aspirantes.map((a) =>
            a.vacanteAsignadaId === id ? { ...a, estatus: 'nuevo', vacanteAsignadaId: undefined } : a
          ),
        })),

      asignarAspiranteAVacante: (aspiranteId, vacanteId) =>
        set((state) => {
          const vacante = state.vacantes.find((v) => v.id === vacanteId)
          if (!vacante) return state

          // Verificar si ya estaba asignado a otra
          const vacantesActualizadas = state.vacantes.map((v) => {
            let asignados = v.aspirantesAsignadosIds.filter((id) => id !== aspiranteId)
            if (v.id === vacanteId) {
              asignados = [...asignados, aspiranteId]
            }
            const cubiertas = asignados.length >= v.plazasTotales
            return {
              ...v,
              aspirantesAsignadosIds: asignados,
              estado: cubiertas ? ('cubierta' as const) : ('abierta' as const),
            }
          })

          const aspirantesActualizados = state.aspirantes.map((a) =>
            a.id === aspiranteId
              ? {
                  ...a,
                  estatus: 'asignado' as const,
                  vacanteAsignadaId: vacanteId,
                  motivoEspera: undefined,
                }
              : a
          )

          return {
            vacantes: vacantesActualizadas,
            aspirantes: aspirantesActualizados,
            candidatoSeleccionadoId: null,
          }
        }),

      desasignarAspirante: (aspiranteId) =>
        set((state) => ({
          vacantes: state.vacantes.map((v) => ({
            ...v,
            aspirantesAsignadosIds: v.aspirantesAsignadosIds.filter((id) => id !== aspiranteId),
            estado: 'abierta' as const,
          })),
          aspirantes: state.aspirantes.map((a) =>
            a.id === aspiranteId
              ? { ...a, estatus: 'nuevo' as const, vacanteAsignadaId: undefined }
              : a
          ),
        })),

      ponerAspiranteEnEspera: (aspiranteId, motivo) =>
        set((state) => ({
          // Remover de cualquier vacante si estaba asignado
          vacantes: state.vacantes.map((v) => ({
            ...v,
            aspirantesAsignadosIds: v.aspirantesAsignadosIds.filter((id) => id !== aspiranteId),
            estado: 'abierta' as const,
          })),
          aspirantes: state.aspirantes.map((a) =>
            a.id === aspiranteId
              ? {
                  ...a,
                  estatus: 'en_espera' as const,
                  motivoEspera: motivo,
                  vacanteAsignadaId: undefined,
                }
              : a
          ),
          candidatoSeleccionadoId: null,
        })),

      reactivarAspiranteDeEspera: (aspiranteId) =>
        set((state) => ({
          aspirantes: state.aspirantes.map((a) =>
            a.id === aspiranteId
              ? {
                  ...a,
                  estatus: 'nuevo' as const,
                  motivoEspera: undefined,
                }
              : a
          ),
        })),

      registrarAspiranteDesdePortal: (aspiranteData) =>
        set((state) => {
          // Evitar duplicados por folio
          const existe = state.aspirantes.some((a) => a.folio === aspiranteData.folio)
          if (existe) return state

          const nuevoAspirante: AspiranteSolicitud = {
            ...aspiranteData,
            id: `sol-${Date.now()}`,
          }

          return {
            aspirantes: [nuevoAspirante, ...state.aspirantes],
          }
        }),

      reiniciarDatosDemo: () =>
        set({
          vacantes: vacantesIniciales,
          aspirantes: aspirantesIniciales,
          filtroModulo: 'todos',
          filtroFecha: 'todos',
          pestañaBandeja: 'nuevas',
          busqueda: '',
          candidatoSeleccionadoId: null,
        }),
    }),
    {
      name: 'ceps_vacancies_v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        vacantes: state.vacantes,
        aspirantes: state.aspirantes,
      }),
    }
  )
)
