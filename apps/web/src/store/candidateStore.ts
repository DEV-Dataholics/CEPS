import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  type CandidateFormData,
  candidateStep1Schema,
  candidateStep2Schema,
  candidateStep3Schema,
  candidateStep5Schema,
} from '../schemas/candidateSchema'
import type { ExtractedCurpData } from '../lib/mexicanIdParser'

export interface CandidateStoreState {
  pasoActual: number
  formData: CandidateFormData
  folioAsignado: string | null
  guardando: boolean

  // Estado de Escaneo Oficial de Abordaje
  mostrarGateEscaneo: boolean
  curpVerificada: boolean
  datosExtraidosCurp: ExtractedCurpData | null
  esReingreso: boolean

  // Acciones
  setPaso: (paso: number) => void
  siguientePaso: () => void
  anteriorPaso: () => void
  actualizarPaso1: (datos: Partial<CandidateFormData>) => void
  actualizarPaso2: (datos: Partial<CandidateFormData>) => void
  actualizarDomicilio: (domicilio: CandidateFormData['domicilio']) => void
  actualizarDocumento: (tipo: 'ine' | 'rfc' | 'noPenales', base64: string | null) => void
  setConfirmoVeracidad: (valor: boolean) => void
  setGuardando: (valor: boolean) => void
  setFolioAsignado: (folio: string | null) => void
  setEsReingreso: (valor: boolean) => void
  reiniciarBorrador: () => void
  cargarDatosDemo: () => void

  // Acciones de Escáner
  setDatosExtraidosCurp: (datos: ExtractedCurpData | null) => void
  confirmarAbordajeEscaneo: (datos: ExtractedCurpData, esReingreso?: boolean) => void
  activarReescaneo: () => void
  setMostrarGateEscaneo: (mostrar: boolean) => void

  // Validaciones Zod por paso
  validarPaso1: () => { valido: boolean; errores: Record<string, string> }
  validarPaso2: () => { valido: boolean; errores: Record<string, string> }
  validarPaso3: () => { valido: boolean; errores: Record<string, string> }
  validarPaso5: () => { valido: boolean; errores: Record<string, string> }
}

export const formularioVacio: CandidateFormData = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  telefono: '',
  edad: '',
  sexo: 'Masculino',
  estadoCivil: 'Soltero',
  curp: '',
  rfc: '',
  puesto: 'Guardia de Seguridad Industrial 12x12',
  modulo: 'Módulo S-Mart Independencia',
  turno: 'Turno 1 (Mañana 5x2)',
  comoSeEntero: '',
  experienciaPrevia: '',
  domicilio: {
    calleNumero: '',
    colonia: '',
    codigoPostal: '',
    entrecalles: '',
    referencias: '',
    tiempoEnJuarez: '',
    latitud: 31.6904,
    longitud: -106.4245,
  },
  documentos: {
    ine: null,
    rfc: null,
    noPenales: null,
  },
  confirmoVeracidad: false,
}

export const datosDemo: CandidateFormData = {
  nombre: 'Jorge Alejandro',
  apellidoPaterno: 'Medina',
  apellidoMaterno: 'Castillo',
  telefono: '(656) 438-9210',
  edad: '34',
  sexo: 'Masculino',
  estadoCivil: 'Casado',
  curp: 'MECJ920514HCHDRR08',
  rfc: 'MECJ920514QR3',
  puesto: 'Guardia de Seguridad Industrial 12x12',
  modulo: 'Módulo S-Mart Independencia',
  turno: 'Turno 1 (Mañana 5x2)',
  comoSeEntero: 'Facebook / Grupos de Empleo Juárez',
  experienciaPrevia: 'Sí (3 años en maquiladora de autopartes)',
  domicilio: {
    calleNumero: 'Calle Puerto Lisboa #2140',
    colonia: 'Col. Tierra Nueva II',
    codigoPostal: '32580',
    entrecalles: 'Entre Puerto Dunquerque y Puerto Tarento',
    referencias: 'Casa de 1 piso color crema con cancel de herrería negro y árbol ficus al frente.',
    tiempoEnJuarez: '14 años',
    latitud: 31.6324,
    longitud: -106.3789,
  },
  documentos: {
    ine: null,
    rfc: null,
    noPenales: null,
  },
  confirmoVeracidad: true,
}

export const useCandidateStore = create<CandidateStoreState>()(
  persist(
    (set, get) => ({
      pasoActual: 1,
      formData: datosDemo,
      folioAsignado: null,
      guardando: false,

      // Estado de Escaneo Oficial de Abordaje
      mostrarGateEscaneo: true,
      curpVerificada: false,
      datosExtraidosCurp: null,
      esReingreso: false,

      setPaso: (paso) => set({ pasoActual: paso }),
      siguientePaso: () => set((state) => ({ pasoActual: Math.min(state.pasoActual + 1, 6) })),
      anteriorPaso: () => set((state) => ({ pasoActual: Math.max(state.pasoActual - 1, 1) })),

      setEsReingreso: (valor) => set({ esReingreso: valor }),

      // Acciones de Escáner
      setDatosExtraidosCurp: (datos) => set({ datosExtraidosCurp: datos }),

      confirmarAbordajeEscaneo: (datos, esReingreso = false) =>
        set((state) => ({
          curpVerificada: true,
          datosExtraidosCurp: datos,
          esReingreso,
          mostrarGateEscaneo: false,
          pasoActual: 1,
          formData: {
            ...state.formData,
            nombre: datos.nombre || state.formData.nombre,
            apellidoPaterno: datos.apellidoPaterno || state.formData.apellidoPaterno,
            apellidoMaterno: datos.apellidoMaterno || state.formData.apellidoMaterno,
            curp: datos.curp,
            edad: String(datos.edad),
            sexo: datos.sexo,
            rfc:
              datos.rfcCompleto ||
              (state.formData.rfc && state.formData.rfc.startsWith(datos.rfcBase)
                ? state.formData.rfc
                : datos.rfcBase),
            domicilio: datos.domicilio
              ? {
                  ...state.formData.domicilio,
                  calleNumero: datos.domicilio.calleNumero || state.formData.domicilio.calleNumero,
                  colonia: datos.domicilio.colonia || state.formData.domicilio.colonia,
                  codigoPostal: datos.domicilio.codigoPostal || state.formData.domicilio.codigoPostal,
                }
              : state.formData.domicilio,
          },
        })),

      activarReescaneo: () => set({ mostrarGateEscaneo: true }),
      setMostrarGateEscaneo: (mostrar) => set({ mostrarGateEscaneo: mostrar }),

      actualizarPaso1: (datos) =>
        set((state) => ({
          formData: { ...state.formData, ...datos },
        })),

      actualizarPaso2: (datos) =>
        set((state) => ({
          formData: { ...state.formData, ...datos },
        })),

      actualizarDomicilio: (domicilio) =>
        set((state) => ({
          formData: { ...state.formData, domicilio },
        })),

      actualizarDocumento: (tipo, base64) =>
        set((state) => ({
          formData: {
            ...state.formData,
            documentos: {
              ...state.formData.documentos,
              [tipo]: base64,
            },
          },
        })),

      setConfirmoVeracidad: (valor) =>
        set((state) => ({
          formData: {
            ...state.formData,
            confirmoVeracidad: valor,
          },
        })),

      setGuardando: (guardando) => set({ guardando }),
      setFolioAsignado: (folioAsignado) => set({ folioAsignado }),

      reiniciarBorrador: () => {
        try {
          localStorage.removeItem('ceps_candidate_draft_v1')
        } catch {
          // ignorar
        }
        set({
          pasoActual: 1,
          formData: { ...formularioVacio },
          folioAsignado: null,
          guardando: false,
          mostrarGateEscaneo: true,
          curpVerificada: false,
          datosExtraidosCurp: null,
        })
      },

      cargarDatosDemo: () =>
        set({
          pasoActual: 1,
          formData: { ...datosDemo },
          folioAsignado: null,
          guardando: false,
          mostrarGateEscaneo: false,
          curpVerificada: true,
          datosExtraidosCurp: {
            curp: datosDemo.curp,
            esValida: true,
            fechaNacimiento: '14/05/1992',
            fechaIso: '1992-05-14',
            edad: 34,
            sexo: 'Masculino',
            claveEntidad: 'CH',
            nombreEntidad: 'Chihuahua',
            rfcBase: 'MECJ920514',
            rfcCompleto: datosDemo.rfc,
          },
        }),

      validarPaso1: () => {
        const { formData } = get()
        const res = candidateStep1Schema.safeParse(formData)
        if (res.success) return { valido: true, errores: {} }
        const errores: Record<string, string> = {}
        for (const issue of res.error.issues) {
          if (issue.path[0]) errores[String(issue.path[0])] = issue.message
        }
        return { valido: false, errores }
      },

      validarPaso2: () => {
        const { formData } = get()
        const res = candidateStep2Schema.safeParse(formData)
        if (res.success) return { valido: true, errores: {} }
        const errores: Record<string, string> = {}
        for (const issue of res.error.issues) {
          if (issue.path[0]) errores[String(issue.path[0])] = issue.message
        }
        return { valido: false, errores }
      },

      validarPaso3: () => {
        const { formData } = get()
        const res = candidateStep3Schema.safeParse(formData.domicilio)
        if (res.success) return { valido: true, errores: {} }
        const errores: Record<string, string> = {}
        for (const issue of res.error.issues) {
          if (issue.path[0]) errores[String(issue.path[0])] = issue.message
        }
        return { valido: false, errores }
      },

      validarPaso5: () => {
        const { formData } = get()
        const res = candidateStep5Schema.safeParse({ confirmoVeracidad: formData.confirmoVeracidad })
        if (res.success) return { valido: true, errores: {} }
        const errores: Record<string, string> = {}
        for (const issue of res.error.issues) {
          if (issue.path[0]) errores[String(issue.path[0])] = issue.message
        }
        return { valido: false, errores }
      },
    }),
    {
      name: 'ceps_candidate_draft_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pasoActual: state.pasoActual,
        formData: state.formData,
        folioAsignado: state.folioAsignado,
        mostrarGateEscaneo: state.mostrarGateEscaneo,
        curpVerificada: state.curpVerificada,
        datosExtraidosCurp: state.datosExtraidosCurp,
      }),
    }
  )
)
