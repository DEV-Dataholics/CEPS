import { z } from 'zod'

export const vacancySchema = z.object({
  empresa: z.string().min(2, 'El nombre de la empresa cliente es obligatorio'),
  planta: z.string().min(2, 'La planta o instalación es obligatoria'),
  zona: z.string().min(2, 'La zona o parque industrial es obligatorio'),
  puesto: z.string().min(3, 'El puesto requerido es obligatorio'),
  turno: z.string().min(2, 'El turno y horario es obligatorio'),
  plazasTotales: z
    .number({ invalid_type_error: 'Debe ser un número válido' })
    .int('Debe ser un número entero')
    .min(1, 'Debe haber al menos 1 plaza requerida'),
  sueldoSemanal: z.string().min(2, 'Ingresa el sueldo o percepción semanal'),
  prestaciones: z.string().default('Prestaciones de Ley + Bono de Puntualidad + Transporte'),
  requisitos: z.string().optional(),
})

export type VacancyInput = z.infer<typeof vacancySchema>

// Motivos válidos de pase a lista de espera
export const MOTIVOS_ESPERA = [
  'Esperando vacante más cercana a su domicilio',
  'Preferencia por turno matutino (5x2)',
  'Pendiente de entrega de Carta de No Antecedentes Penales',
  'Pendiente de Constancia de Situación Fiscal (RFC con QR)',
  'En espera de vacante con transporte a su colonia',
  'Disponibilidad a partir de la próxima quincena',
  'Perfil sugerido para puesto de Supervisor o Custodio',
] as const

export type MotivoEspera = (typeof MOTIVOS_ESPERA)[number]
