import { z } from 'zod'

// Paso 1: Datos Personales y Contacto
export const candidateStep1Schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidoPaterno: z.string().min(2, 'El apellido paterno es obligatorio'),
  apellidoMaterno: z.string().min(2, 'El apellido materno es obligatorio'),
  telefono: z
    .string()
    .min(10, 'El teléfono celular debe tener al menos 10 dígitos')
    .regex(/^[0-9()\-\s+]+$/, 'Formato de teléfono no válido'),
  edad: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 18 && Number(val) <= 70, {
      message: 'La edad debe estar entre 18 y 70 años',
    }),
  sexo: z.enum(['Masculino', 'Femenino', 'Otro']),
  estadoCivil: z.string().min(1, 'Selecciona tu estado civil'),
  curp: z
    .string()
    .length(18, 'El CURP debe tener exactamente 18 caracteres')
    .regex(/^[A-Z0-9]{18}$/, 'CURP debe contener 18 letras mayúsculas y números'),
  rfc: z
    .string()
    .min(10, 'El RFC debe tener al menos 10 caracteres')
    .max(13, 'El RFC no debe exceder 13 caracteres')
    .regex(/^[A-Z0-9]{10,13}$/, 'RFC no válido'),
})

// Paso 2: Puesto y Módulo de Abordaje
export const candidateStep2Schema = z.object({
  modulo: z.string().min(2, 'Selecciona el módulo de abordaje'),
  puesto: z.string().min(2, 'Selecciona el puesto de interés'),
  turno: z.string().min(2, 'Selecciona la disponibilidad de turno'),
  comoSeEntero: z.string().optional(),
  experienciaPrevia: z.string().min(1, 'Indica tu experiencia previa'),
})

// Paso 3: Domicilio & Coordenadas
export const candidateStep3Schema = z.object({
  calleNumero: z.string().min(4, 'Ingresa la calle y número oficial'),
  colonia: z.string().min(3, 'Ingresa la colonia o fraccionamiento'),
  codigoPostal: z.string().min(4, 'Ingresa el código postal'),
  entrecalles: z.string().min(3, 'Ingresa las entrecalles'),
  referencias: z.string().min(5, 'Ingresa referencias visuales de tu fachada'),
  tiempoEnJuarez: z.string().min(1, 'Indica el tiempo de residencia en Juárez'),
  latitud: z.number().min(25).max(35, 'Coordenada de latitud fuera de rango'),
  longitud: z.number().min(-115).max(-100, 'Coordenada de longitud fuera de rango'),
})

// Paso 4: Fotos de Documentos
export const candidateStep4Schema = z.object({
  ine: z.string().nullable().optional(),
  rfc: z.string().nullable().optional(),
  noPenales: z.string().nullable().optional(),
})

// Paso 5: Declaración de Veracidad
export const candidateStep5Schema = z.object({
  confirmoVeracidad: z.literal(true, {
    message: 'Debes confirmar bajo protesta de decir verdad que los datos son verídicos',
  }),
})

// Tipo inferido completo
export type CandidateFormData = z.infer<typeof candidateStep1Schema> &
  z.infer<typeof candidateStep2Schema> & {
    domicilio: z.infer<typeof candidateStep3Schema>
    documentos: z.infer<typeof candidateStep4Schema>
    confirmoVeracidad: boolean
  }
