import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type RolOperativo =
  | 'candidato'
  | 'reclutador_campo'
  | 'admin_vacantes'
  | 'admin_general'
  // Compatibilidad hacia atrás:
  | 'candidato_externo'
  | 'supervision_rh'
  | 'direccion_operativa'
  | 'admin_ti'

export type VistaId =
  | 'gestion_candidatos'
  | 'vacantes'
  | 'dossiers'
  | 'candidato'
  | 'examen_tablet'
  | 'tracking'
  | 'catalogos'
  | 'uikit'
  | 'diagnostico'

export interface InfoRol {
  id: RolOperativo
  titulo: string
  subtitulo: string
  departamento: string
  icono: string
  badgeColor: string
  vistasPermitidas: VistaId[]
  vistaPorDefecto: VistaId
  permiteEntrevistaEnTablet: boolean
}

export const METADATA_ROLES: Record<RolOperativo, InfoRol> = {
  candidato: {
    id: 'candidato',
    titulo: 'Candidato (Público)',
    subtitulo: 'Autoservicio & Evaluación en Tablet',
    departamento: 'Portal Público',
    icono: '👤',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500',
    vistasPermitidas: ['candidato', 'examen_tablet', 'tracking'],
    vistaPorDefecto: 'candidato',
    permiteEntrevistaEnTablet: false,
  },
  candidato_externo: {
    id: 'candidato',
    titulo: 'Candidato (Público)',
    subtitulo: 'Autoservicio & Evaluación en Tablet',
    departamento: 'Portal Público',
    icono: '👤',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500',
    vistasPermitidas: ['candidato', 'examen_tablet', 'tracking'],
    vistaPorDefecto: 'candidato',
    permiteEntrevistaEnTablet: false,
  },
  reclutador_campo: {
    id: 'reclutador_campo',
    titulo: 'Reclutador en Campo',
    subtitulo: 'Módulos Urbanos (S-Mart / Sendero)',
    departamento: 'Atracción de Talento',
    icono: '⚡',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500',
    vistasPermitidas: ['candidato', 'tracking'],
    vistaPorDefecto: 'candidato',
    permiteEntrevistaEnTablet: true,
  },
  admin_vacantes: {
    id: 'admin_vacantes',
    titulo: 'Administrador de Vacantes',
    subtitulo: 'Gestión de Aspirantes y Despliegue',
    departamento: 'Operaciones & RH',
    icono: '📋',
    badgeColor: 'bg-amber-500/20 text-[#D4AF37] border-[#D4AF37]',
    vistasPermitidas: ['gestion_candidatos', 'vacantes', 'dossiers'],
    vistaPorDefecto: 'gestion_candidatos',
    permiteEntrevistaEnTablet: true,
  },
  supervision_rh: {
    id: 'admin_vacantes',
    titulo: 'Administrador de Vacantes',
    subtitulo: 'Gestión de Aspirantes y Despliegue',
    departamento: 'Operaciones & RH',
    icono: '📋',
    badgeColor: 'bg-amber-500/20 text-[#D4AF37] border-[#D4AF37]',
    vistasPermitidas: ['gestion_candidatos', 'vacantes', 'dossiers'],
    vistaPorDefecto: 'gestion_candidatos',
    permiteEntrevistaEnTablet: true,
  },
  direccion_operativa: {
    id: 'admin_vacantes',
    titulo: 'Administrador de Vacantes',
    subtitulo: 'Gestión de Aspirantes y Despliegue',
    departamento: 'Operaciones & RH',
    icono: '📋',
    badgeColor: 'bg-amber-500/20 text-[#D4AF37] border-[#D4AF37]',
    vistasPermitidas: ['gestion_candidatos', 'vacantes', 'dossiers'],
    vistaPorDefecto: 'gestion_candidatos',
    permiteEntrevistaEnTablet: true,
  },
  admin_general: {
    id: 'admin_general',
    titulo: 'Administrador General',
    subtitulo: 'Gobierno de Sistema, Bajas y Backend',
    departamento: 'Dirección & TI',
    icono: '🛡️',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500',
    vistasPermitidas: [
      'gestion_candidatos',
      'vacantes',
      'dossiers',
      'catalogos',
      'diagnostico',
      'uikit',
      'candidato',
      'examen_tablet',
      'tracking',
    ],
    vistaPorDefecto: 'gestion_candidatos',
    permiteEntrevistaEnTablet: true,
  },
  admin_ti: {
    id: 'admin_general',
    titulo: 'Administrador General',
    subtitulo: 'Gobierno de Sistema, Bajas y Backend',
    departamento: 'Dirección & TI',
    icono: '🛡️',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500',
    vistasPermitidas: [
      'gestion_candidatos',
      'vacantes',
      'dossiers',
      'catalogos',
      'diagnostico',
      'uikit',
      'candidato',
      'examen_tablet',
      'tracking',
    ],
    vistaPorDefecto: 'gestion_candidatos',
    permiteEntrevistaEnTablet: true,
  },
}

interface AuthStoreState {
  rolActivo: RolOperativo
  sidebarCollapsed: boolean
  mobileDrawerOpen: boolean
  modalEntrevistaGlobalAbierto: boolean

  // Acciones
  setRolActivo: (rol: RolOperativo) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileDrawer: () => void
  setMobileDrawerOpen: (open: boolean) => void
  setModalEntrevistaGlobalAbierto: (abierto: boolean) => void
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      rolActivo: 'admin_vacantes',
      sidebarCollapsed: false,
      mobileDrawerOpen: false,
      modalEntrevistaGlobalAbierto: false,

      setRolActivo: (rolActivo) => set({ rolActivo }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleMobileDrawer: () => set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen })),
      setMobileDrawerOpen: (mobileDrawerOpen) => set({ mobileDrawerOpen }),
      setModalEntrevistaGlobalAbierto: (modalEntrevistaGlobalAbierto) =>
        set({ modalEntrevistaGlobalAbierto }),
    }),
    {
      name: 'ceps_auth_role_v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

