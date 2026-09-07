import React, { useState, useMemo } from 'react'
import {
  Building2,
  Clock,
  Briefcase,
  MapPin,
  Search,
  Plus,
  CheckCircle2,
  X,
  Edit2,
  Power,
  RotateCcw,
  DollarSign,
  Phone,
  User,
  SlidersHorizontal,
  Info,
} from 'lucide-react'
import { useCatalogStore } from '../store/catalogStore'

type TabCatalogo = 'clientes' | 'turnos' | 'puestos' | 'modulos'

export const CatalogManagerView: React.FC = () => {
  const {
    clientes,
    turnos,
    puestos,
    modulos,
    crearCliente,
    actualizarCliente,
    toggleEstatusCliente,
    crearTurno,
    actualizarTurno,
    toggleEstatusTurno,
    crearPuesto,
    actualizarPuesto,
    toggleEstatusPuesto,
    crearModulo,
    actualizarModulo,
    toggleEstatusModulo,
    restablecerCatalogosDemo,
  } = useCatalogStore()

  const [tabActiva, setTabActiva] = useState<TabCatalogo>('clientes')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstatus, setFiltroEstatus] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const [toastMensaje, setToastMensaje] = useState<string | null>(null)

  // Estado para modales de creación / edición
  const [modalOpen, setModalOpen] = useState(false)
  const [itemEnEdicion, setItemEnEdicion] = useState<any | null>(null)

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg)
    setTimeout(() => setToastMensaje(null), 3000)
  }

  // Filtrado reactivo según la pestaña activa
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const coincideTexto =
        !busqueda ||
        c.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.planta.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.zona.toLowerCase().includes(busqueda.toLowerCase())
      const coincideEstatus = filtroEstatus === 'todos' || c.estatus === filtroEstatus
      return coincideTexto && coincideEstatus
    })
  }, [clientes, busqueda, filtroEstatus])

  const turnosFiltrados = useMemo(() => {
    return turnos.filter((t) => {
      const coincideTexto =
        !busqueda ||
        t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.modalidad.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.diasLaborales.toLowerCase().includes(busqueda.toLowerCase())
      const coincideEstatus = filtroEstatus === 'todos' || t.estatus === filtroEstatus
      return coincideTexto && coincideEstatus
    })
  }, [turnos, busqueda, filtroEstatus])

  const puestosFiltrados = useMemo(() => {
    return puestos.filter((p) => {
      const coincideTexto =
        !busqueda ||
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sueldoSemanalSugerido.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.prestacionesSugeridas.toLowerCase().includes(busqueda.toLowerCase())
      const coincideEstatus = filtroEstatus === 'todos' || p.estatus === filtroEstatus
      return coincideTexto && coincideEstatus
    })
  }, [puestos, busqueda, filtroEstatus])

  const modulosFiltrados = useMemo(() => {
    return modulos.filter((m) => {
      const coincideTexto =
        !busqueda ||
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.zonaJuarez.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.ubicacionDetalle.toLowerCase().includes(busqueda.toLowerCase())
      const coincideEstatus = filtroEstatus === 'todos' || m.estatus === filtroEstatus
      return coincideTexto && coincideEstatus
    })
  }, [modulos, busqueda, filtroEstatus])

  // Abrir modal para crear
  const handleAbrirCrear = () => {
    setItemEnEdicion(null)
    setModalOpen(true)
  }

  // Abrir modal para editar
  const handleAbrirEditar = (item: any) => {
    setItemEnEdicion(item)
    setModalOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col font-sans bg-[#EDF2F7]">
      {/* HEADER DE MANDO INSTITUCIONAL */}
      <header className="bg-[#0A162B] text-white py-5 px-4 sm:px-8 border-b-2 border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#060E1C] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-inner flex-shrink-0">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-[#D4AF37] uppercase tracking-wider">
                  Configuración y Datos Maestros
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-white">
                Administrador de Catálogos Operativos
              </h1>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Central de control para Clientes, Plantas, Turnos, Puestos y Módulos de Reclutamiento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                restablecerCatalogosDemo()
                mostrarToast('Catálogos maestros restablecidos con datos demo de Ciudad Juárez.')
              }}
              className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
              title="Restablecer catálogos originales"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restablecer Catálogos</span>
            </button>
          </div>
        </div>
      </header>

      {/* MÉTRICAS DE RESUMEN DE LOS 4 CATÁLOGOS */}
      <section className="bg-white border-b-2 border-slate-200 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Clientes / Plantas</span>
              <span className="text-lg font-mono font-extrabold text-[#0A162B]">{clientes.length}</span>
              <span className="text-[10px] text-emerald-700 font-bold ml-1">({clientes.filter((c) => c.estatus === 'activo').length} activos)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Turnos de Trabajo</span>
              <span className="text-lg font-mono font-extrabold text-[#0A162B]">{turnos.length}</span>
              <span className="text-[10px] text-emerald-700 font-bold ml-1">({turnos.filter((t) => t.estatus === 'activo').length} activos)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Puestos y Tabuladores</span>
              <span className="text-lg font-mono font-extrabold text-[#0A162B]">{puestos.length}</span>
              <span className="text-[10px] text-emerald-700 font-bold ml-1">({puestos.filter((p) => p.estatus === 'activo').length} activos)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Módulos en Campo</span>
              <span className="text-lg font-mono font-extrabold text-[#0A162B]">{modulos.length}</span>
              <span className="text-[10px] text-emerald-700 font-bold ml-1">({modulos.filter((m) => m.estatus === 'activo').length} activos)</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col gap-6">
        {/* PESTAÑAS (TABS) SUPERIORES */}
        <div className="bg-white p-2 rounded-2xl border-2 border-slate-300 shadow-xs flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setTabActiva('clientes')
              setBusqueda('')
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              tabActiva === 'clientes'
                ? 'bg-[#0A162B] text-[#D4AF37] shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Clientes y Plantas</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-black/20 text-white">
              {clientes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTabActiva('turnos')
              setBusqueda('')
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              tabActiva === 'turnos'
                ? 'bg-[#0A162B] text-[#D4AF37] shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Configuración de Turnos</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-black/20 text-white">
              {turnos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTabActiva('puestos')
              setBusqueda('')
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              tabActiva === 'puestos'
                ? 'bg-[#0A162B] text-[#D4AF37] shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Puestos y Tabuladores</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-black/20 text-white">
              {puestos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTabActiva('modulos')
              setBusqueda('')
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              tabActiva === 'modulos'
                ? 'bg-[#0A162B] text-[#D4AF37] shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>4. Módulos de Abordaje</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-black/20 text-white">
              {modulos.length}
            </span>
          </button>
        </div>

        {/* BARRA DE BÚSQUEDA, FILTRO DE ESTATUS Y BOTÓN AGREGAR */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={`Buscar en ${
                  tabActiva === 'clientes'
                    ? 'maquiladoras, plantas o parques industriales...'
                    : tabActiva === 'turnos'
                    ? 'turnos, horarios o esquemas...'
                    : tabActiva === 'puestos'
                    ? 'puestos, salarios o requisitos...'
                    : 'módulos de abordaje o ubicaciones...'
                }`}
                className="w-full pl-10 pr-9 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0A162B] transition"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* FILTRO DE ESTATUS */}
            <select
              value={filtroEstatus}
              onChange={(e) => setFiltroEstatus(e.target.value as any)}
              className="py-2 px-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-extrabold text-[#0A162B] focus:outline-none focus:border-[#0A162B] cursor-pointer"
            >
              <option value="todos">Todos los estatus</option>
              <option value="activo">Solo Activos</option>
              <option value="inactivo">Solo Inactivos</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAbrirCrear}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C59F2D] text-[#0A162B] font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>
              {tabActiva === 'clientes'
                ? 'Nuevo Cliente / Planta'
                : tabActiva === 'turnos'
                ? 'Nuevo Turno'
                : tabActiva === 'puestos'
                ? 'Nuevo Puesto'
                : 'Nuevo Módulo'}
            </span>
          </button>
        </div>

        {/* TABLA: 1. CLIENTES Y PLANTAS */}
        {tabActiva === 'clientes' && (
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0A162B]">
                  Catálogo Maestro de Clientes &amp; Plantas Maquiladoras
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {clientesFiltrados.length} clientes encontrados en Ciudad Juárez
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0A162B] text-white uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                    <th className="p-3.5 pl-5">Empresa / Razón Social</th>
                    <th className="p-3.5">Planta / Sucursal</th>
                    <th className="p-3.5">Parque Industrial / Ubicación</th>
                    <th className="p-3.5">Contacto Enlace</th>
                    <th className="p-3.5 text-center">Estatus</th>
                    <th className="p-3.5 text-right pr-5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {clientesFiltrados.map((cli) => (
                    <tr key={cli.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 pl-5 font-extrabold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                        <span>{cli.empresa}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300">
                          {cli.planta}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 flex-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{cli.zona}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>
                          <span className="font-semibold block">{cli.contactoEnlace || 'Sin contacto registrado'}</span>
                          {cli.telefonoEnlace && (
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {cli.telefonoEnlace}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        {cli.estatus === 'activo' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200 text-slate-600 border border-slate-300">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right pr-5 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAbrirEditar(cli)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                          title="Editar información"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleEstatusCliente(cli.id)
                            mostrarToast(
                              `Cliente ${cli.empresa} marcado como ${
                                cli.estatus === 'activo' ? 'INACTIVO' : 'ACTIVO'
                              }`
                            )
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                            cli.estatus === 'activo'
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                          }`}
                          title={cli.estatus === 'activo' ? 'Desactivar cliente' : 'Activar cliente'}
                        >
                          <Power className="w-3.5 h-3.5 inline mr-1" />
                          {cli.estatus === 'activo' ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clientesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No se encontraron clientes o plantas con los filtros indicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLA: 2. CONFIGURACIÓN DE TURNOS */}
        {tabActiva === 'turnos' && (
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0A162B]">
                  Catálogo Maestro de Turnos &amp; Horarios Operativos
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {turnosFiltrados.length} esquemas de trabajo configurados
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0A162B] text-white uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                    <th className="p-3.5 pl-5">Nombre del Turno</th>
                    <th className="p-3.5">Modalidad</th>
                    <th className="p-3.5">Horario Entrada / Salida</th>
                    <th className="p-3.5">Esquema de Días</th>
                    <th className="p-3.5 text-center">Estatus</th>
                    <th className="p-3.5 text-right pr-5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {turnosFiltrados.map((tur) => (
                    <tr key={tur.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 pl-5 font-extrabold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>{tur.nombre}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">{tur.descripcion}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 uppercase">
                          {tur.modalidad}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 font-bold">
                        {tur.horarioEntrada} &bull; {tur.horarioSalida}
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {tur.diasLaborales}
                      </td>
                      <td className="p-3.5 text-center">
                        {tur.estatus === 'activo' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200 text-slate-600 border border-slate-300">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right pr-5 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAbrirEditar(tur)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleEstatusTurno(tur.id)
                            mostrarToast(
                              `Turno ${tur.nombre} marcado como ${
                                tur.estatus === 'activo' ? 'INACTIVO' : 'ACTIVO'
                              }`
                            )
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                            tur.estatus === 'activo'
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5 inline mr-1" />
                          {tur.estatus === 'activo' ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {turnosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No se encontraron turnos con los filtros indicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLA: 3. PUESTOS Y TABULADORES */}
        {tabActiva === 'puestos' && (
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0A162B]">
                  Catálogo Maestro de Puestos Operativos &amp; Tabulador Salarial
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {puestosFiltrados.length} puestos vigentes con tabulador semanal en Ciudad Juárez
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0A162B] text-white uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                    <th className="p-3.5 pl-5">Puesto Operativo</th>
                    <th className="p-3.5">Sueldo Semanal Neto</th>
                    <th className="p-3.5">Prestaciones Sugeridas</th>
                    <th className="p-3.5">Perfil y Requisitos</th>
                    <th className="p-3.5 text-center">Estatus</th>
                    <th className="p-3.5 text-right pr-5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {puestosFiltrados.map((pue) => (
                    <tr key={pue.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 pl-5 font-extrabold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{pue.titulo}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono text-xs inline-flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                          {pue.sueldoSemanalSugerido}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium max-w-xs">
                        {pue.prestacionesSugeridas}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs text-[11px]">
                        {pue.perfilMinimo}
                      </td>
                      <td className="p-3.5 text-center">
                        {pue.estatus === 'activo' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200 text-slate-600 border border-slate-300">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right pr-5 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAbrirEditar(pue)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleEstatusPuesto(pue.id)
                            mostrarToast(
                              `Puesto ${pue.titulo} marcado como ${
                                pue.estatus === 'activo' ? 'INACTIVO' : 'ACTIVO'
                              }`
                            )
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                            pue.estatus === 'activo'
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5 inline mr-1" />
                          {pue.estatus === 'activo' ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {puestosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No se encontraron puestos con los filtros indicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLA: 4. MÓDULOS DE ABORDAJE */}
        {tabActiva === 'modulos' && (
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0A162B]">
                  Catálogo Maestro de Puntos de Captación &amp; Módulos en Campo
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {modulosFiltrados.length} ubicaciones de abordaje y oficinas registradas
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0A162B] text-white uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                    <th className="p-3.5 pl-5">Nombre del Módulo</th>
                    <th className="p-3.5">Zona Juárez</th>
                    <th className="p-3.5">Ubicación y Referencia</th>
                    <th className="p-3.5">Responsable / Teléfono</th>
                    <th className="p-3.5 text-center">Estatus</th>
                    <th className="p-3.5 text-right pr-5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {modulosFiltrados.map((mod) => (
                    <tr key={mod.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 pl-5 font-extrabold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span>{mod.nombre}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-900">
                          {mod.zonaJuarez}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-sm">
                        <span>{mod.ubicacionDetalle}</span>
                        {mod.coordenadasAprox && (
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            Coordenadas: {mod.coordenadasAprox}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{mod.responsableModulo || 'Sin responsable asignado'}</span>
                        </div>
                        {mod.telefonoModulo && (
                          <span className="text-[11px] text-slate-400 font-mono block ml-5">
                            {mod.telefonoModulo}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {mod.estatus === 'activo' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200 text-slate-600 border border-slate-300">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right pr-5 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAbrirEditar(mod)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleEstatusModulo(mod.id)
                            mostrarToast(
                              `Módulo ${mod.nombre} marcado como ${
                                mod.estatus === 'activo' ? 'INACTIVO' : 'ACTIVO'
                              }`
                            )
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                            mod.estatus === 'activo'
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5 inline mr-1" />
                          {mod.estatus === 'activo' ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {modulosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No se encontraron módulos de abordaje con los filtros indicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL PARA CREAR / EDITAR SEGÚN LA PESTAÑA ACTIVA */}
      {modalOpen && (
        <ModalFormularioCatalogo
          tabActiva={tabActiva}
          item={itemEnEdicion}
          onClose={() => setModalOpen(false)}
          onGuardar={(datos) => {
            if (tabActiva === 'clientes') {
              if (itemEnEdicion) {
                actualizarCliente(itemEnEdicion.id, datos)
                mostrarToast(`Cliente ${datos.empresa} actualizado con éxito.`)
              } else {
                crearCliente({ ...datos, estatus: 'activo' })
                mostrarToast(`Cliente ${datos.empresa} registrado exitosamente.`)
              }
            } else if (tabActiva === 'turnos') {
              if (itemEnEdicion) {
                actualizarTurno(itemEnEdicion.id, datos)
                mostrarToast(`Turno ${datos.nombre} actualizado con éxito.`)
              } else {
                crearTurno({ ...datos, estatus: 'activo' })
                mostrarToast(`Turno ${datos.nombre} creado exitosamente.`)
              }
            } else if (tabActiva === 'puestos') {
              if (itemEnEdicion) {
                actualizarPuesto(itemEnEdicion.id, datos)
                mostrarToast(`Puesto ${datos.titulo} actualizado con éxito.`)
              } else {
                crearPuesto({ ...datos, estatus: 'activo' })
                mostrarToast(`Puesto ${datos.titulo} creado exitosamente.`)
              }
            } else if (tabActiva === 'modulos') {
              if (itemEnEdicion) {
                actualizarModulo(itemEnEdicion.id, datos)
                mostrarToast(`Módulo ${datos.nombre} actualizado con éxito.`)
              } else {
                crearModulo({ ...datos, estatus: 'activo' })
                mostrarToast(`Módulo ${datos.nombre} creado exitosamente.`)
              }
            }
            setModalOpen(false)
          }}
        />
      )}

      {/* TOAST FLOTANTE */}
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A162B] text-white px-4 py-3 rounded-xl border-2 border-[#D4AF37] shadow-xl text-xs font-extrabold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMensaje}</span>
        </div>
      )}
    </div>
  )
}

// SUBCOMPONENTE DE FORMULARIO MODAL
interface ModalFormularioCatalogoProps {
  tabActiva: TabCatalogo
  item: any | null
  onClose: () => void
  onGuardar: (datos: any) => void
}

const ModalFormularioCatalogo: React.FC<ModalFormularioCatalogoProps> = ({
  tabActiva,
  item,
  onClose,
  onGuardar,
}) => {
  // Estado para Clientes
  const [empresa, setEmpresa] = useState(item?.empresa || '')
  const [planta, setPlanta] = useState(item?.planta || '')
  const [zona, setZona] = useState(item?.zona || '')
  const [contactoEnlace, setContactoEnlace] = useState(item?.contactoEnlace || '')
  const [telefonoEnlace, setTelefonoEnlace] = useState(item?.telefonoEnlace || '')

  // Estado para Turnos
  const [nombreTurno, setNombreTurno] = useState(item?.nombre || '')
  const [modalidad, setModalidad] = useState(item?.modalidad || '12x12')
  const [horarioEntrada, setHorarioEntrada] = useState(item?.horarioEntrada || '07:00')
  const [horarioSalida, setHorarioSalida] = useState(item?.horarioSalida || '19:00')
  const [diasLaborales, setDiasLaborales] = useState(item?.diasLaborales || '4x3 Rotativo')
  const [descripcionTurno, setDescripcionTurno] = useState(item?.descripcion || '')

  // Estado para Puestos
  const [tituloPuesto, setTituloPuesto] = useState(item?.titulo || '')
  const [sueldoSemanal, setSueldoSemanal] = useState(item?.sueldoSemanalSugerido || '$3,500 netos')
  const [prestaciones, setPrestaciones] = useState(item?.prestacionesSugeridas || '')
  const [perfilMinimo, setPerfilMinimo] = useState(item?.perfilMinimo || '')

  // Estado para Módulos
  const [nombreModulo, setNombreModulo] = useState(item?.nombre || '')
  const [zonaJuarez, setZonaJuarez] = useState(item?.zonaJuarez || 'Suroriente')
  const [ubicacionDetalle, setUbicacionDetalle] = useState(item?.ubicacionDetalle || '')
  const [responsableModulo, setResponsableModulo] = useState(item?.responsableModulo || '')
  const [telefonoModulo, setTelefonoModulo] = useState(item?.telefonoModulo || '')

  const [errorValidacion, setErrorValidacion] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorValidacion(null)

    if (tabActiva === 'clientes') {
      if (!empresa.trim() || !planta.trim() || !zona.trim()) {
        setErrorValidacion('Por favor completa los campos obligatorios: Empresa, Planta y Zona.')
        return
      }
      onGuardar({ empresa, planta, zona, contactoEnlace, telefonoEnlace })
    } else if (tabActiva === 'turnos') {
      if (!nombreTurno.trim() || !horarioEntrada.trim() || !horarioSalida.trim()) {
        setErrorValidacion('Por favor completa el nombre del turno y sus horarios.')
        return
      }
      onGuardar({
        nombre: nombreTurno,
        modalidad,
        horarioEntrada,
        horarioSalida,
        diasLaborales,
        descripcion: descripcionTurno,
      })
    } else if (tabActiva === 'puestos') {
      if (!tituloPuesto.trim() || !sueldoSemanal.trim()) {
        setErrorValidacion('Por favor completa el título del puesto y el sueldo semanal.')
        return
      }
      onGuardar({
        titulo: tituloPuesto,
        sueldoSemanalSugerido: sueldoSemanal,
        sueldoNumerico: Number(sueldoSemanal.replace(/\D/g, '')) || 3500,
        prestacionesSugeridas: prestaciones,
        perfilMinimo,
      })
    } else if (tabActiva === 'modulos') {
      if (!nombreModulo.trim() || !ubicacionDetalle.trim()) {
        setErrorValidacion('Por favor completa el nombre del módulo y la ubicación.')
        return
      }
      onGuardar({
        nombre: nombreModulo,
        zonaJuarez,
        ubicacionDetalle,
        responsableModulo,
        telefonoModulo,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 flex flex-col">
        {/* CABECERA DEL MODAL */}
        <div className="p-5 bg-[#0A162B] text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#060E1C] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {item ? 'Editar Registro' : 'Nuevo Registro'} &bull;{' '}
                {tabActiva === 'clientes'
                  ? 'Cliente / Planta'
                  : tabActiva === 'turnos'
                  ? 'Turno Operativo'
                  : tabActiva === 'puestos'
                  ? 'Puesto y Tabulador'
                  : 'Módulo de Abordaje'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs font-semibold">
          {errorValidacion && (
            <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-900 text-xs font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorValidacion}</span>
            </div>
          )}

          {/* CAMPOS CLIENTES */}
          {tabActiva === 'clientes' && (
            <>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">
                  Empresa / Maquiladora *
                </label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej. Lear Corporation, Foxconn México"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Planta o Sucursal *</label>
                  <input
                    type="text"
                    value={planta}
                    onChange={(e) => setPlanta(e.target.value)}
                    placeholder="Ej. Planta San Lorenzo"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Parque Industrial / Zona *</label>
                  <input
                    type="text"
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                    placeholder="Ej. Parque Industrial Bermúdez"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Contacto de Enlace</label>
                  <input
                    type="text"
                    value={contactoEnlace}
                    onChange={(e) => setContactoEnlace(e.target.value)}
                    placeholder="Ej. Ing. Roberto Mesta"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Teléfono Enlace</label>
                  <input
                    type="text"
                    value={telefonoEnlace}
                    onChange={(e) => setTelefonoEnlace(e.target.value)}
                    placeholder="Ej. (656) 629-1000"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
              </div>
            </>
          )}

          {/* CAMPOS TURNOS */}
          {tabActiva === 'turnos' && (
            <>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Nombre Descriptivo del Turno *</label>
                <input
                  type="text"
                  value={nombreTurno}
                  onChange={(e) => setNombreTurno(e.target.value)}
                  placeholder="Ej. 12x12 Rol de Turnos (4x3)"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Modalidad</label>
                  <select
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  >
                    <option value="12x12">12x12</option>
                    <option value="5x2">5x2</option>
                    <option value="4x3">4x3</option>
                    <option value="nocturno">Nocturno</option>
                    <option value="rotativo">Rotativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Entrada *</label>
                  <input
                    type="text"
                    value={horarioEntrada}
                    onChange={(e) => setHorarioEntrada(e.target.value)}
                    placeholder="07:00"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Salida *</label>
                  <input
                    type="text"
                    value={horarioSalida}
                    onChange={(e) => setHorarioSalida(e.target.value)}
                    placeholder="19:00"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Días Laborales y Descanso</label>
                <input
                  type="text"
                  value={diasLaborales}
                  onChange={(e) => setDiasLaborales(e.target.value)}
                  placeholder="Ej. 4 días trabajo x 3 descanso rotativo"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Notas / Descripción</label>
                <textarea
                  rows={2}
                  value={descripcionTurno}
                  onChange={(e) => setDescripcionTurno(e.target.value)}
                  placeholder="Detalles sobre cobertura de hora pico o rol nocturno..."
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
            </>
          )}

          {/* CAMPOS PUESTOS */}
          {tabActiva === 'puestos' && (
            <>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Título del Puesto Operativo *</label>
                <input
                  type="text"
                  value={tituloPuesto}
                  onChange={(e) => setTituloPuesto(e.target.value)}
                  placeholder="Ej. Guardia de Seguridad Industrial 12x12"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Sueldo Semanal Neto Sugerido *</label>
                <input
                  type="text"
                  value={sueldoSemanal}
                  onChange={(e) => setSueldoSemanal(e.target.value)}
                  placeholder="Ej. $3,600 netos"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-emerald-800 outline-none focus:border-[#0A162B]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Prestaciones Estándar</label>
                <input
                  type="text"
                  value={prestaciones}
                  onChange={(e) => setPrestaciones(e.target.value)}
                  placeholder="Ej. Transporte gratuito + Comedor subsidiado + Bono puntualidad"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Perfil y Requisitos Mínimos</label>
                <textarea
                  rows={2}
                  value={perfilMinimo}
                  onChange={(e) => setPerfilMinimo(e.target.value)}
                  placeholder="Requisitos de escolaridad, cartas de recomendación o antidoping..."
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
            </>
          )}

          {/* CAMPOS MÓDULOS */}
          {tabActiva === 'modulos' && (
            <>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Nombre Oficial del Módulo *</label>
                <input
                  type="text"
                  value={nombreModulo}
                  onChange={(e) => setNombreModulo(e.target.value)}
                  placeholder="Ej. Módulo S-Mart Independencia"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Zona Juárez</label>
                  <select
                    value={zonaJuarez}
                    onChange={(e) => setZonaJuarez(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  >
                    <option value="Suroriente">Suroriente</option>
                    <option value="Centro">Centro</option>
                    <option value="Oriente">Oriente</option>
                    <option value="Poniente">Poniente</option>
                    <option value="Norte">Norte</option>
                    <option value="Valle de Juárez">Valle de Juárez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Teléfono Módulo</label>
                  <input
                    type="text"
                    value={telefonoModulo}
                    onChange={(e) => setTelefonoModulo(e.target.value)}
                    placeholder="Ej. (656) 438-9210"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Ubicación y Referencia *</label>
                <input
                  type="text"
                  value={ubicacionDetalle}
                  onChange={(e) => setUbicacionDetalle(e.target.value)}
                  placeholder="Ej. Estacionamiento S-Mart, Blvd. Independencia y Paseo del Sur"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Responsable o Líder de Módulo</label>
                <input
                  type="text"
                  value={responsableModulo}
                  onChange={(e) => setResponsableModulo(e.target.value)}
                  placeholder="Ej. Juan Antonio Ramos Toledo"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-[#0A162B]"
                />
              </div>
            </>
          )}

          {/* BOTONES DE ACCIÓN DEL MODAL */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0A162B] hover:bg-slate-800 text-[#D4AF37] font-extrabold rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{item ? 'Guardar Cambios' : 'Registrar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
