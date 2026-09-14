import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type RolOperativo =
  | 'reclutador_campo'
  | 'supervision_rh'
  | 'direccion_operativa'
  | 'candidato_externo'
  | 'admin_ti'

export type VistaId =
  | 'gestion_candidatos'
  | 'vacantes'
  | 'dossiers'
  | 'candidato'
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
  reclutador_campo: {
    id: 'reclutador_campo',
    titulo: 'Reclutador en Campo',
    subtitulo: 'Módulos Urbanos (S-Mart / Sendero)',
    departamento: 'Atracción de Talento',
    icono: '⚡',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500',
    vistasPermitidas: ['gestion_candidatos', 'dossiers', 'tracking'],
    vistaPorDefecto: 'gestion_candidatos',
    permiteEntrevistaEnTablet: true,
  },
  supervision_rh: {
    id: 'supervision_rh',
    titulo: 'Supervisora RH & Contratación',
    subtitulo: 'Oficina Central CEPS (Eunice Lira / Jaqueline R.)',
    departamento: 'Recursos Humanos',
    icono: '📋',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500',
    vistasPermitidas: ['gestion_candidatos', 'vacantes', 'dossiers', 'tracking'],
    vistaPorDefecto: 'gestion_candidatos',
    permiteEntrevistaEnTablet: true,
  },
  direccion_operativa: {
    id: 'direccion_operativa',
    titulo: 'Dirección de Operaciones',
    subtitulo: 'Seguridad Industrial y Maquiladoras',
    departamento: 'Operaciones CEPS',
    icono: '🛡️',
    badgeColor: 'bg-amber-500/20 text-[#D4AF37] border-[#D4AF37]',
    vistasPermitidas: ['vacantes', 'gestion_candidatos', 'catalogos', 'dossiers'],
    vistaPorDefecto: 'vacantes',
    permiteEntrevistaEnTablet: true,
  },
  candidato_externo: {
    id: 'candidato_externo',
    titulo: 'Aspirante / Candidato Externo',
    subtitulo: 'Acceso Móvil Ciudadano (QR / Web)',
    departamento: 'Portal Público',
    icono: '👤',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500',
    vistasPermitidas: ['candidato', 'tracking'],
    vistaPorDefecto: 'candidato',
    permiteEntrevistaEnTablet: false,
  },
  admin_ti: {
    id: 'admin_ti',
    titulo: 'Administrador / TI',
    subtitulo: 'Superusuario de Infraestructura',
    departamento: 'Tecnologías de Información',
    icono: '⚙️',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500',
    vistasPermitidas: [
      'gestion_candidatos',
      'vacantes',
      'dossiers',
      'catalogos',
      'candidato',
      'tracking',
      'diagnostico',
      'uikit',
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
      rolActivo: 'supervision_rh',
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
      name: 'ceps_auth_role_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
