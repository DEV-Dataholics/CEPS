import React from 'react'
import {
  FolderArchive,
  Briefcase,
  SlidersHorizontal,
  UserPlus,
  Search,
  Server,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Shield,
  PlusCircle,
  X,
  Lock,
} from 'lucide-react'
import {
  useAuthStore,
  METADATA_ROLES,
  type RolOperativo,
  type VistaId,
} from '../store/authStore'

interface AppSidebarProps {
  vistaActual: VistaId
  onCambiarVista: (vista: VistaId) => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  vistaActual,
  onCambiarVista,
}) => {
  const {
    rolActivo,
    setRolActivo,
    sidebarCollapsed,
    toggleSidebar,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    setModalEntrevistaGlobalAbierto,
  } = useAuthStore()

  const infoRol = METADATA_ROLES[rolActivo]

  // Definición unificada de navegación
  const navItems: Array<{
    id: VistaId
    label: string
    shortLabel: string
    icon: React.FC<{ className?: string }>
    departamento: string
  }> = [
    {
      id: 'dossiers',
      label: 'Expedientes de Guardias',
      shortLabel: 'Expedientes',
      icon: FolderArchive,
      departamento: 'Recursos Humanos',
    },
    {
      id: 'vacantes',
      label: 'Gestor de Vacantes',
      shortLabel: 'Vacantes',
      icon: Briefcase,
      departamento: 'Operaciones',
    },
    {
      id: 'catalogos',
      label: 'Catálogos del Sistema',
      shortLabel: 'Catálogos',
      icon: SlidersHorizontal,
      departamento: 'Operaciones',
    },
    {
      id: 'candidato',
      label: 'Portal del Candidato',
      shortLabel: 'Registro',
      icon: UserPlus,
      departamento: 'Público',
    },
    {
      id: 'tracking',
      label: 'Consultar Estatus (Folio)',
      shortLabel: 'Consultar',
      icon: Search,
      departamento: 'Público / Módulos',
    },
    {
      id: 'diagnostico',
      label: 'Diagnóstico Backend CI4',
      shortLabel: 'Diagnóstico',
      icon: Server,
      departamento: 'Sistemas TI',
    },
    {
      id: 'uikit',
      label: 'Guía Visual Demo',
      shortLabel: 'UI Kit',
      icon: LayoutDashboard,
      departamento: 'Sistemas TI',
    },
  ]

  // Filtrar estrictamente según la gobernanza de accesos (RBAC)
  const itemsAutorizados = navItems.filter((item) =>
    infoRol.vistasPermitidas.includes(item.id)
  )

  const handleSeleccionarVista = (id: VistaId) => {
    onCambiarVista(id)
    setMobileDrawerOpen(false)
  }

  const handleCambiarRol = (nuevoRol: RolOperativo) => {
    setRolActivo(nuevoRol)
    const nuevoInfo = METADATA_ROLES[nuevoRol]
    if (!nuevoInfo.vistasPermitidas.includes(vistaActual)) {
      onCambiarVista(nuevoInfo.vistaPorDefecto)
    }
  }

  const sidebarContenido = (
    <div className="flex flex-col h-full bg-[#060E1C] text-slate-200 border-r-2 border-slate-800 select-none">
      {/* 1. Cabecera Institucional */}
      <div className="p-4 border-b-2 border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-[#0A162B] border-2 border-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Shield className="w-6 h-6 text-[#D4AF37]" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <span className="font-black text-sm text-white tracking-wide block truncate">
                CEPS Paso del Norte
              </span>
              <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest uppercase block truncate">
                Seguridad Privada
              </span>
            </div>
          )}
        </div>

        {/* Botón cerrar en móvil */}
        <button
          onClick={() => setMobileDrawerOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Simulador de Gobernanza de Accesos (RBAC) */}
      <div className="p-3 border-b-2 border-slate-800/80 bg-[#0A162B]/60">
        {!sidebarCollapsed ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#D4AF37]" />
                Perfil RBAC Activo:
              </span>
            </div>

            <select
              value={rolActivo}
              onChange={(e) => handleCambiarRol(e.target.value as RolOperativo)}
              className="w-full px-2.5 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="reclutador_campo">⚡ Reclutador en Campo</option>
              <option value="supervision_rh">📋 Supervisora RH & Selección</option>
              <option value="direccion_operativa">🛡️ Dirección de Operaciones</option>
              <option value="candidato_externo">👤 Candidato Externo (Público)</option>
              <option value="admin_ti">⚙️ Administrador / TI</option>
            </select>

            <div className="text-[10px] text-slate-400 font-medium truncate pt-0.5">
              {infoRol.subtitulo}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-1 group relative">
            <span className="text-xl">{infoRol.icono}</span>
            <div className="hidden group-hover:block absolute left-full ml-2 top-0 z-50 bg-[#0A162B] border-2 border-[#D4AF37] p-2.5 rounded-xl shadow-2xl w-48 text-left">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Perfil Activo:
              </span>
              <span className="text-xs font-black text-white block">{infoRol.titulo}</span>
              <span className="text-[10px] text-[#D4AF37] block mt-0.5 font-semibold">
                {infoRol.departamento}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Botón Táctil de Acción Rápida (Si el rol lo permite) */}
      {infoRol.permiteEntrevistaEnTablet && (
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={() => {
              setModalEntrevistaGlobalAbierto(true)
              setMobileDrawerOpen(false)
            }}
            className={`w-full py-2.5 px-3 rounded-xl font-black text-xs bg-[#D4AF37] text-[#0A162B] hover:bg-amber-400 transition flex items-center gap-2 shadow-md hover:scale-102 ${
              sidebarCollapsed ? 'justify-center' : 'justify-start'
            }`}
            title="Nueva Entrevista en Tablet"
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Nueva Entrevista (Tablet)</span>}
          </button>
        </div>
      )}

      {/* 4. Lista de Módulos Autorizados según Gobernanza */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
        {!sidebarCollapsed && (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 block mb-1">
            Módulos Autorizados ({itemsAutorizados.length})
          </span>
        )}

        {itemsAutorizados.map((item) => {
          const Icon = item.icon
          const activo = vistaActual === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleSeleccionarVista(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition group relative ${
                activo
                  ? 'bg-[#D4AF37] text-[#0A162B] font-black shadow-lg ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  activo ? 'text-[#0A162B]' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}

              {/* Tooltip en modo colapsado */}
              {sidebarCollapsed && (
                <div className="hidden group-hover:block absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 bg-[#0A162B] border-2 border-[#D4AF37] px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap text-left">
                  <span className="text-xs font-extrabold text-white block">{item.label}</span>
                  <span className="text-[9px] text-[#D4AF37] font-semibold block">
                    {item.departamento}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 5. Pie del Sidebar: Botón Colapsar / Expandir en Desktop */}
      <div className="p-3 border-t-2 border-slate-800/80 hidden md:flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sistema Seguro</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ${
            sidebarCollapsed ? 'mx-auto' : ''
          }`}
          title={sidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar fijo en Desktop */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContenido}
      </aside>

      {/* Drawer desplegable en Móvil / Tablet */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop con desenfoque */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />
          {/* Contenedor del Drawer */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 flex flex-col">
            {sidebarContenido}
          </div>
        </div>
      )}
    </>
  )
}
