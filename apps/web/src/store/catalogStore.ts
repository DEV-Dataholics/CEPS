import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ClientePlantaCatalog,
  TurnoCatalog,
  PuestoCatalog,
  ModuloAbordajeCatalog,
} from '../types/catalogTypes'

interface CatalogStoreState {
  clientes: ClientePlantaCatalog[]
  turnos: TurnoCatalog[]
  puestos: PuestoCatalog[]
  modulos: ModuloAbordajeCatalog[]

  // Acciones Clientes
  crearCliente: (cliente: Omit<ClientePlantaCatalog, 'id' | 'fechaRegistro'>) => void
  actualizarCliente: (id: string, cliente: Partial<ClientePlantaCatalog>) => void
  toggleEstatusCliente: (id: string) => void

  // Acciones Turnos
  crearTurno: (turno: Omit<TurnoCatalog, 'id'>) => void
  actualizarTurno: (id: string, turno: Partial<TurnoCatalog>) => void
  toggleEstatusTurno: (id: string) => void

  // Acciones Puestos
  crearPuesto: (puesto: Omit<PuestoCatalog, 'id'>) => void
  actualizarPuesto: (id: string, puesto: Partial<PuestoCatalog>) => void
  toggleEstatusPuesto: (id: string) => void

  // Acciones Módulos
  crearModulo: (modulo: Omit<ModuloAbordajeCatalog, 'id'>) => void
  actualizarModulo: (id: string, modulo: Partial<ModuloAbordajeCatalog>) => void
  toggleEstatusModulo: (id: string) => void

  // Restablecer catálogo demo
  restablecerCatalogosDemo: () => void
}

// 1. Datos iniciales de Clientes y Plantas (Maquiladoras de Ciudad Juárez)
const clientesIniciales: ClientePlantaCatalog[] = [
  {
    id: 'cli-1',
    empresa: 'Lear Corporation',
    planta: 'Planta San Lorenzo',
    zona: 'Parque Industrial San Jerónimo',
    contactoEnlace: 'Ing. Roberto Mesta (Seguridad Patrimonial)',
    telefonoEnlace: '(656) 629-1000',
    estatus: 'activo',
    fechaRegistro: '2026-01-10',
  },
  {
    id: 'cli-2',
    empresa: 'Foxconn México',
    planta: 'Campus Las Lomas',
    zona: 'Carretera a Casas Grandes',
    contactoEnlace: 'Lic. Laura Cordero (Recursos Humanos)',
    telefonoEnlace: '(656) 692-2000',
    estatus: 'activo',
    fechaRegistro: '2026-01-15',
  },
  {
    id: 'cli-3',
    empresa: 'Flex Internacional',
    planta: 'Planta Río Bravo',
    zona: 'Parque Industrial Bermúdez',
    contactoEnlace: 'Lic. Miguel Ángel Treviño (Seguridad)',
    telefonoEnlace: '(656) 649-3000',
    estatus: 'activo',
    fechaRegistro: '2026-02-01',
  },
  {
    id: 'cli-4',
    empresa: 'BRP México',
    planta: 'Planta 2 Juárez',
    zona: 'Parque Industrial Intermex',
    contactoEnlace: 'Lic. Fernando Chavarría',
    telefonoEnlace: '(656) 688-4000',
    estatus: 'activo',
    fechaRegistro: '2026-02-12',
  },
  {
    id: 'cli-5',
    empresa: 'Fracc. Campos Elíseos',
    planta: 'Caseta Monumental Norte',
    zona: 'Zona Campos Elíseos',
    contactoEnlace: 'Comité de Colonos / Arq. Salgado',
    telefonoEnlace: '(656) 617-5000',
    estatus: 'activo',
    fechaRegistro: '2026-02-20',
  },
  {
    id: 'cli-6',
    empresa: 'Aptiv México',
    planta: 'Planta Los Aztecas',
    zona: 'Parque Industrial Río Bravo',
    contactoEnlace: 'Lic. Sergio Almanza',
    telefonoEnlace: '(656) 629-6000',
    estatus: 'activo',
    fechaRegistro: '2026-03-01',
  },
  {
    id: 'cli-7',
    empresa: 'Bosch Rexroth',
    planta: 'Planta Electrónica Juárez',
    zona: 'Parque Industrial Juárez',
    contactoEnlace: 'Ing. Dieter Schmidt',
    telefonoEnlace: '(656) 692-7000',
    estatus: 'activo',
    fechaRegistro: '2026-03-10',
  },
  {
    id: 'cli-8',
    empresa: 'Yazaki Components',
    planta: 'Planta Torres',
    zona: 'Av. de las Torres',
    contactoEnlace: 'Lic. Mario Estrada',
    telefonoEnlace: '(656) 648-8000',
    estatus: 'activo',
    fechaRegistro: '2026-03-15',
  },
  {
    id: 'cli-9',
    empresa: 'CommScope Juárez',
    planta: 'Planta Prados del Norte',
    zona: 'Parque Industrial Bermúdez',
    contactoEnlace: 'Lic. Claudia Holguín',
    telefonoEnlace: '(656) 639-9000',
    estatus: 'activo',
    fechaRegistro: '2026-03-20',
  },
  {
    id: 'cli-10',
    empresa: 'Wistron México',
    planta: 'Planta Zaragoza',
    zona: 'Blvd. Zaragoza',
    contactoEnlace: 'Ing. Alex Chen',
    telefonoEnlace: '(656) 694-1010',
    estatus: 'activo',
    fechaRegistro: '2026-04-01',
  },
  {
    id: 'cli-11',
    empresa: 'Honeywell Aerospace',
    planta: 'Planta AeroJuárez',
    zona: 'Parque Industrial AeroJuárez',
    contactoEnlace: 'Lic. Raúl Perea',
    telefonoEnlace: '(656) 690-1111',
    estatus: 'activo',
    fechaRegistro: '2026-04-05',
  },
  {
    id: 'cli-12',
    empresa: 'Pegatron México',
    planta: 'Campus Panamericana',
    zona: 'Panamericana Sur',
    contactoEnlace: 'Lic. Ana Gabriela Domínguez',
    telefonoEnlace: '(656) 681-1212',
    estatus: 'activo',
    fechaRegistro: '2026-04-12',
  },
  {
    id: 'cli-13',
    empresa: 'Electrolux México',
    planta: 'Planta Electro Sur',
    zona: 'Parque Industrial Independencia',
    contactoEnlace: 'Ing. Gustavo Mariscal',
    telefonoEnlace: '(656) 678-1313',
    estatus: 'activo',
    fechaRegistro: '2026-04-18',
  },
  {
    id: 'cli-14',
    empresa: 'Johnson Controls',
    planta: 'Planta Automotriz Juárez',
    zona: 'Parque Industrial Río Bravo',
    contactoEnlace: 'Lic. Carlos Luján',
    telefonoEnlace: '(656) 689-1414',
    estatus: 'activo',
    fechaRegistro: '2026-05-02',
  },
  {
    id: 'cli-15',
    empresa: 'The Toro Company',
    planta: 'Planta Maquinaria Juárez',
    zona: 'Parque Industrial Américas',
    contactoEnlace: 'Lic. Paola Morales',
    telefonoEnlace: '(656) 691-1515',
    estatus: 'activo',
    fechaRegistro: '2026-05-10',
  },
]

// 2. Datos iniciales de Turnos y Horarios
const turnosIniciales: TurnoCatalog[] = [
  {
    id: 'tur-1',
    nombre: '12x12 Rol de Turnos (4x3)',
    modalidad: '12x12',
    horarioEntrada: '07:00',
    horarioSalida: '19:00',
    diasLaborales: '4 días laborados por 3 días de descanso rotativo',
    descripcion: 'Esquema tradicional de seguridad en maquiladoras con rol de guardias diurno/nocturno.',
    estatus: 'activo',
  },
  {
    id: 'tur-2',
    nombre: 'Turno 1 (Mañana 5x2 de 06:00 a 15:30)',
    modalidad: '5x2',
    horarioEntrada: '06:00',
    horarioSalida: '15:30',
    diasLaborales: 'Lunes a Viernes (Descanso Sábado y Domingo)',
    descripcion: 'Horario matutino industrial con cobertura en hora pico de entrada de personal operativo.',
    estatus: 'activo',
  },
  {
    id: 'tur-3',
    nombre: 'Turno 2 (Tarde 5x2 de 15:30 a 23:00)',
    modalidad: '5x2',
    horarioEntrada: '15:30',
    horarioSalida: '23:00',
    diasLaborales: 'Lunes a Viernes (Descanso Sábado y Domingo)',
    descripcion: 'Vigilancia en turno vespertino y control de salidas de personal y proveedores.',
    estatus: 'activo',
  },
  {
    id: 'tur-4',
    nombre: '12x12 Nocturno Fijo',
    modalidad: 'nocturno',
    horarioEntrada: '19:00',
    horarioSalida: '07:00',
    diasLaborales: '4 noches laboradas por 3 de descanso',
    descripcion: 'Vigilancia perimetral nocturna, rondines de patio y revisión de accesos.',
    estatus: 'activo',
  },
  {
    id: 'tur-5',
    nombre: 'Turno 12x12 Mixto Residencial',
    modalidad: '12x12',
    horarioEntrada: '08:00',
    horarioSalida: '20:00',
    diasLaborales: 'Rol de turnos programado semanalmente',
    descripcion: 'Control de accesos y vigilancia para casetas de fraccionamientos residenciales.',
    estatus: 'activo',
  },
]

// 3. Datos iniciales de Puestos y Tabuladores
const puestosIniciales: PuestoCatalog[] = [
  {
    id: 'pue-1',
    titulo: 'Guardia de Seguridad Industrial 12x12',
    sueldoSemanalSugerido: '$3,450 netos',
    sueldoNumerico: 3450,
    prestacionesSugeridas: 'Transporte gratuito + Comedor subsidiado + Bono puntualidad',
    perfilMinimo: 'Secundaria concluida, experiencia mínima 6 meses en maquila o corporación.',
    estatus: 'activo',
  },
  {
    id: 'pue-2',
    titulo: 'Custodia Intramuros Maquiladora',
    sueldoSemanalSugerido: '$3,600 netos',
    sueldoNumerico: 3600,
    prestacionesSugeridas: 'Fondo de ahorro + Vales de despensa + Bono asistencia',
    perfilMinimo: 'Manejo básico de bitácora y control de accesos peatonales y vehiculares.',
    estatus: 'activo',
  },
  {
    id: 'pue-3',
    titulo: 'Vigilancia y Control de Andenes',
    sueldoSemanalSugerido: '$3,300 netos',
    sueldoNumerico: 3300,
    prestacionesSugeridas: 'Prestaciones de ley + Seguro de vida + Uniforme completo',
    perfilMinimo: 'Revisión de gafetes de contratistas y control de proveedores.',
    estatus: 'activo',
  },
  {
    id: 'pue-4',
    titulo: 'Guardia Industrial 12x12 Especializado',
    sueldoSemanalSugerido: '$3,750 netos',
    sueldoNumerico: 3750,
    prestacionesSugeridas: 'Transporte directo + Bono nocturno + Apoyo escolar',
    perfilMinimo: 'Cartilla liberada (deseable), sin antecedentes, antidoping negativo 5 parámetros.',
    estatus: 'activo',
  },
  {
    id: 'pue-5',
    titulo: 'Seguridad Residencial y Control de Acceso',
    sueldoSemanalSugerido: '$3,400 netos',
    sueldoNumerico: 3400,
    prestacionesSugeridas: 'Prestaciones superiores + Capacitación continua',
    perfilMinimo: 'Excelente trato cordial al visitante y presentación ejecutiva.',
    estatus: 'activo',
  },
  {
    id: 'pue-6',
    titulo: 'Vigilante Monitorista CCTV & Accesos',
    sueldoSemanalSugerido: '$4,100 netos',
    sueldoNumerico: 4100,
    prestacionesSugeridas: 'Seguro médico mayor + Vales de despensa + Bono trimestral',
    perfilMinimo: 'Conocimiento intermedio de monitoreo de cámaras IP y sistemas de alarma.',
    estatus: 'activo',
  },
  {
    id: 'pue-7',
    titulo: 'Supervisor Operativo de Turno en Caseta',
    sueldoSemanalSugerido: '$4,500 netos',
    sueldoNumerico: 4500,
    prestacionesSugeridas: 'Prestaciones ejecutivas + Vales + Capacitación en primeros auxilios',
    perfilMinimo: 'Experiencia comprobable mínima 2 años coordinando guardias en planta.',
    estatus: 'activo',
  },
]

// 4. Datos iniciales de Módulos de Abordaje en Campo
const modulosIniciales: ModuloAbordajeCatalog[] = [
  {
    id: 'mod-1',
    nombre: 'Módulo S-Mart Independencia',
    zonaJuarez: 'Suroriente',
    ubicacionDetalle: 'Estacionamiento S-Mart Independencia, Blvd. Independencia y Paseo del Sur',
    coordenadasAprox: '31.6215, -106.3987',
    responsableModulo: 'Juan Antonio Ramos Toledo',
    telefonoModulo: '(656) 438-9210',
    estatus: 'activo',
  },
  {
    id: 'mod-2',
    nombre: 'Módulo Monumento Benito Juárez',
    zonaJuarez: 'Centro',
    ubicacionDetalle: 'Plaza del Monumento, Av. Vicente Guerrero y Ramón Corona',
    coordenadasAprox: '31.7410, -106.4835',
    responsableModulo: 'Rosa María Hinojosa',
    telefonoModulo: '(656) 291-0482',
    estatus: 'activo',
  },
  {
    id: 'mod-3',
    nombre: 'Módulo Sendero Las Torres',
    zonaJuarez: 'Suroriente',
    ubicacionDetalle: 'Plaza Sendero Las Torres, Av. de las Torres y Blvd. Manuel Gómez Morín',
    coordenadasAprox: '31.6480, -106.4120',
    responsableModulo: 'Carlos Alberto Domínguez',
    telefonoModulo: '(656) 312-5819',
    estatus: 'activo',
  },
  {
    id: 'mod-4',
    nombre: 'Oficina Central CEPS',
    zonaJuarez: 'Poniente',
    ubicacionDetalle: 'Oficinas Centrales CEPS Paso del Norte, Av. 16 de Septiembre, Partido Romero',
    coordenadasAprox: '31.7380, -106.4710',
    responsableModulo: 'Jaqueline Rentería (Coordinación)',
    telefonoModulo: '(656) 612-3040',
    estatus: 'activo',
  },
]

export const useCatalogStore = create<CatalogStoreState>()(
  persist(
    (set) => ({
      clientes: clientesIniciales,
      turnos: turnosIniciales,
      puestos: puestosIniciales,
      modulos: modulosIniciales,

      // ACCIONES CLIENTES
      crearCliente: (clienteData) =>
        set((state) => ({
          clientes: [
            {
              ...clienteData,
              id: `cli-${Date.now()}`,
              fechaRegistro: new Date().toISOString().split('T')[0],
            },
            ...state.clientes,
          ],
        })),

      actualizarCliente: (id, data) =>
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      toggleEstatusCliente: (id) =>
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, estatus: c.estatus === 'activo' ? 'inactivo' : 'activo' } : c
          ),
        })),

      // ACCIONES TURNOS
      crearTurno: (turnoData) =>
        set((state) => ({
          turnos: [
            {
              ...turnoData,
              id: `tur-${Date.now()}`,
            },
            ...state.turnos,
          ],
        })),

      actualizarTurno: (id, data) =>
        set((state) => ({
          turnos: state.turnos.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      toggleEstatusTurno: (id) =>
        set((state) => ({
          turnos: state.turnos.map((t) =>
            t.id === id ? { ...t, estatus: t.estatus === 'activo' ? 'inactivo' : 'activo' } : t
          ),
        })),

      // ACCIONES PUESTOS
      crearPuesto: (puestoData) =>
        set((state) => ({
          puestos: [
            {
              ...puestoData,
              id: `pue-${Date.now()}`,
            },
            ...state.puestos,
          ],
        })),

      actualizarPuesto: (id, data) =>
        set((state) => ({
          puestos: state.puestos.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      toggleEstatusPuesto: (id) =>
        set((state) => ({
          puestos: state.puestos.map((p) =>
            p.id === id ? { ...p, estatus: p.estatus === 'activo' ? 'inactivo' : 'activo' } : p
          ),
        })),

      // ACCIONES MÓDULOS
      crearModulo: (moduloData) =>
        set((state) => ({
          modulos: [
            {
              ...moduloData,
              id: `mod-${Date.now()}`,
            },
            ...state.modulos,
          ],
        })),

      actualizarModulo: (id, data) =>
        set((state) => ({
          modulos: state.modulos.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      toggleEstatusModulo: (id) =>
        set((state) => ({
          modulos: state.modulos.map((m) =>
            m.id === id ? { ...m, estatus: m.estatus === 'activo' ? 'inactivo' : 'activo' } : m
          ),
        })),

      // RESTABLECER DATOS DEMO
      restablecerCatalogosDemo: () =>
        set({
          clientes: clientesIniciales,
          turnos: turnosIniciales,
          puestos: puestosIniciales,
          modulos: modulosIniciales,
        }),
    }),
    {
      name: 'ceps_catalogs_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
