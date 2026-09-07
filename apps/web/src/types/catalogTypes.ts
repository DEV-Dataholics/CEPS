export interface ClientePlantaCatalog {
  id: string
  empresa: string
  planta: string
  zona: string // Parque Industrial o Zona
  contactoEnlace?: string
  telefonoEnlace?: string
  estatus: 'activo' | 'inactivo'
  fechaRegistro: string
}

export interface TurnoCatalog {
  id: string
  nombre: string
  modalidad: '12x12' | '5x2' | '4x3' | 'nocturno' | 'rotativo' | 'otro'
  horarioEntrada: string // Ej. "06:00" o "07:00"
  horarioSalida: string // Ej. "15:30" o "19:00"
  diasLaborales: string // Ej. "Lunes a Viernes" o "4 días trabajo x 3 descanso"
  descripcion: string
  estatus: 'activo' | 'inactivo'
}

export interface PuestoCatalog {
  id: string
  titulo: string
  sueldoSemanalSugerido: string // Ej. "$3,600 netos"
  sueldoNumerico: number // Ej. 3600
  prestacionesSugeridas: string
  perfilMinimo: string
  estatus: 'activo' | 'inactivo'
}

export interface ModuloAbordajeCatalog {
  id: string
  nombre: string
  zonaJuarez: 'Suroriente' | 'Oriente' | 'Poniente' | 'Centro' | 'Norte' | 'Valle de Juárez'
  ubicacionDetalle: string // Ej. "Av. de las Torres y Blvd. Zaragoza, frente a Smart"
  coordenadasAprox?: string
  responsableModulo?: string
  telefonoModulo?: string
  estatus: 'activo' | 'inactivo'
}
