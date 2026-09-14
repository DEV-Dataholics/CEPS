import React from 'react'
import {
  Menu,
  FolderArchive,
  Briefcase,
  SlidersHorizontal,
  UserPlus,
  UserCheck,
  Search,
  Server,
  LayoutDashboard,
} from 'lucide-react'
import {
  useAuthStore,
  METADATA_ROLES,
  type VistaId,
} from '../store/authStore'

interface AppHeaderProps {
  vistaActual: VistaId
}

export const AppHeader: React.FC<AppHeaderProps> = ({ vistaActual }) => {
  const {
    rolActivo,
    toggleMobileDrawer,
  } = useAuthStore()

  const infoRol = METADATA_ROLES[rolActivo]

  const titulosVistas: Record<
    VistaId,
    { titulo: string; descripcion: string; icon: React.FC<{ className?: string }> }
  > = {
    gestion_candidatos: {
      titulo: 'Gestión y Evaluación de Candidatos',
      descripcion: 'Paso 2 &bull; Selección oficial, exámenes psicotécnicos, integridad y alta',
      icon: UserCheck,
    },
    dossiers: {
      titulo: 'Expedientes y Dossiers de Guardias',
      descripcion: 'Archivo clasificado &bull; Auditoría de integridad y antecedentes',
      icon: FolderArchive,
    },
    vacantes: {
      titulo: 'Gestor de Vacantes Operativas',
      descripcion: 'Cobertura de plazas por maquiladora &bull; Asignación y rol 12x12',
      icon: Briefcase,
    },
    catalogos: {
      titulo: 'Catálogos del Sistema',
      descripcion: 'Clientes, plantas maquiladoras, turnos y tabuladores salariales',
      icon: SlidersHorizontal,
    },
    candidato: {
      titulo: 'Portal del Candidato',
      descripcion: 'Solicitud digital de empleo &bull; Abordaje sin tachaduras',
      icon: UserPlus,
    },
    tracking: {
      titulo: 'Consulta de Estatus por Folio',
      descripcion: 'Seguimiento oficial de trámites &bull; CEPS-2026-XXXX',
      icon: Search,
    },
    diagnostico: {
      titulo: 'Diagnóstico de Backend (CodeIgniter 4)',
      descripcion: 'Estado de API y base de datos en Laragon',
      icon: Server,
    },
    uikit: {
      titulo: 'Guía de Componentes y Diseño',
      descripcion: 'Catálogo de estilos e identidad visual CEPS',
      icon: LayoutDashboard,
    },
  }

  const vistaInfo = titulosVistas[vistaActual] ?? {
    titulo: 'CEPS Paso del Norte',
    descripcion: 'Sistema de Seguridad Privada y Custodia Especializada',
    icon: Briefcase,
  }
  const VistaIcon = vistaInfo.icon

  return (
    <header className="bg-[#0A162B] text-white px-4 sm:px-6 py-3 border-b-2 border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-md">
      {/* Botón de Menú Móvil y Título de la Vista */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobileDrawer}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none"
          title="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-[#D4AF37]/50 flex items-center justify-center flex-shrink-0 text-[#D4AF37] shadow">
          <VistaIcon className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black text-white tracking-wide truncate">
              {vistaInfo.titulo}
            </h1>
          </div>
          <p
            className="text-[11px] text-slate-400 font-medium truncate hidden sm:block"
            dangerouslySetInnerHTML={{ __html: vistaInfo.descripcion }}
          />
        </div>
      </div>

      {/* Indicadores de Estado y Rol Activo a la Derecha */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Conexión Backend */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>CI4 Backend</span>
        </div>

        {/* Badge de Rol Activo */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-tight shadow-sm ${infoRol.badgeColor}`}
        >
          <span>{infoRol.icono}</span>
          <span className="hidden sm:inline">{infoRol.titulo}</span>
          <span className="sm:hidden">{infoRol.departamento}</span>
        </div>
      </div>
    </header>
  )
}
