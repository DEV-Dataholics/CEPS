import React from 'react'
import {
  Search,
  Filter,
  Calendar,
  Phone,
  MapPin,
  Clock,
  UserCheck,
  PauseCircle,
  PlayCircle,
  FileCheck2,
  Building,
  Tag,
  Eye,
} from 'lucide-react'
import { useVacancyStore, type AspiranteSolicitud } from '../store/vacancyStore'

interface ApplicantInboxProps {
  onDecidirCandidato: (candidato: AspiranteSolicitud, accion: 'asignar' | 'espera') => void
  onRevisarCandidato?: (candidato: AspiranteSolicitud) => void
}

export const ApplicantInbox: React.FC<ApplicantInboxProps> = ({
  onDecidirCandidato,
  onRevisarCandidato,
}) => {
  const {
    aspirantes,
    vacantes,
    filtroModulo,
    filtroFecha,
    pestañaBandeja,
    busqueda,
    candidatoSeleccionadoId,
    setFiltroModulo,
    setFiltroFecha,
    setPestañaBandeja,
    setBusqueda,
    setCandidatoSeleccionadoId,
    reactivarAspiranteDeEspera,
  } = useVacancyStore()

  // Filtrado reactivo de aspirantes: en Gestor de Vacantes SOLO se muestran aprobados/activos
  const aspirantesFiltrados = aspirantes.filter((asp) => {
    // Filtro por pestaña: en 'nuevas' mostramos exclusivamente los guardias dados de alta ('activo')
    if (pestañaBandeja === 'nuevas' && asp.estatus !== 'activo') return false
    if (pestañaBandeja === 'espera' && asp.estatus !== 'en_espera') return false
    if (pestañaBandeja === 'asignadas' && asp.estatus !== 'asignado') return false

    // Filtro por módulo
    if (filtroModulo !== 'todos' && asp.moduloAbordaje !== filtroModulo) return false

    // Filtro por fecha
    if (filtroFecha !== 'todos') {
      if (filtroFecha === 'hoy' && asp.fechaCaptura !== 'hoy') return false
      if (filtroFecha === 'ayer' && asp.fechaCaptura !== 'ayer') return false
      if (filtroFecha === 'semana' && asp.fechaCaptura !== 'semana') return false
    }

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      const match =
        asp.nombre.toLowerCase().includes(q) ||
        asp.apellidoPaterno.toLowerCase().includes(q) ||
        asp.folio.toLowerCase().includes(q) ||
        asp.curp.toLowerCase().includes(q) ||
        asp.colonia.toLowerCase().includes(q)
      if (!match) return false
    }

    return true
  })

  const totalActivos = aspirantes.filter((a) => a.estatus === 'activo').length
  const totalEspera = aspirantes.filter((a) => a.estatus === 'en_espera').length
  const totalAsignadas = aspirantes.filter((a) => a.estatus === 'asignado').length

  const getNombreVacante = (vacanteId?: string) => {
    if (!vacanteId) return 'Vacante no identificada'
    const vac = vacantes.find((v) => v.id === vacanteId)
    return vac ? `${vac.empresa} (${vac.planta})` : 'Planta asignada'
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col h-full">
      {/* CABECERA Y FILTROS */}
      <div className="p-4 bg-[#F8FAFC] border-b-2 border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0A162B] text-[#D4AF37] flex items-center justify-center font-extrabold text-sm shadow-sm">
              🛡️
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0A162B]">Guardias Activos Disponibles</h2>
              <p className="text-[11px] font-semibold text-slate-500">
                Aprobados en evaluación oficial y listos para asignar a servicio
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-extrabold px-2.5 py-1 bg-slate-200 border border-slate-300 rounded-lg text-slate-800">
            {aspirantesFiltrados.length} listados
          </span>
        </div>

        {/* SELECTORES DE FILTRO: MÓDULO Y FECHA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="todos">Todos los Módulos</option>
              <option value="Módulo S-Mart Independencia">S-Mart Independencia</option>
              <option value="Módulo Monumento Benito Juárez">Monumento Benito Juárez</option>
              <option value="Módulo Sendero Las Torres">Sendero Las Torres</option>
              <option value="Oficina Central CEPS (Ciudad Juárez)">Oficina Central CEPS</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="todos">Cualquier Fecha</option>
              <option value="hoy">Capturados Hoy</option>
              <option value="ayer">Capturados Ayer</option>
              <option value="semana">Últimos 7 días</option>
            </select>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA POR FOLIO O NOMBRE */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar guardia por Folio (ej. CEPS-2026-4892), nombre, colonia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
          />
        </div>

        {/* PESTAÑAS DE ESTADO CON BADGES */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setPestañaBandeja('nuevas')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              pestañaBandeja === 'nuevas'
                ? 'bg-white text-[#0A162B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Activos</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                pestañaBandeja === 'nuevas' ? 'bg-[#D4AF37] text-[#0A162B]' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {totalActivos}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPestañaBandeja('espera')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              pestañaBandeja === 'espera'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>En Espera</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                pestañaBandeja === 'espera' ? 'bg-amber-400 text-amber-950' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {totalEspera}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPestañaBandeja('asignadas')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              pestañaBandeja === 'asignadas'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Asignadas</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                pestañaBandeja === 'asignadas' ? 'bg-emerald-300 text-emerald-950' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {totalAsignadas}
            </span>
          </button>
        </div>
      </div>

      {/* LISTA DE FICHAS DE ASPIRANTES */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-280px)]">
        {aspirantesFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-semibold flex flex-col items-center justify-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span>No hay guardias en esta categoría. Los nuevos aspirantes se evalúan y dan de alta en <strong>Gestión de Candidatos</strong>.</span>
          </div>
        ) : (
          aspirantesFiltrados.map((asp) => {
            const esSeleccionado = candidatoSeleccionadoId === asp.id
            return (
              <div
                key={asp.id}
                className={`p-3.5 rounded-xl border-2 transition flex flex-col gap-2.5 bg-white shadow-2xs ${
                  esSeleccionado
                    ? 'border-[#0A162B] ring-2 ring-[#0A162B]/20 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* PLACA INSIGNIA DE FOLIO DESTACADA */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg bg-[#0A162B] text-[#D4AF37] border-2 border-[#D4AF37]/60 shadow-xs flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {asp.folio}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {asp.fechaEtiqueta}
                  </span>
                </div>

                {/* NOMBRE Y PUESTO */}
                <div
                  className={onRevisarCandidato ? 'cursor-pointer group' : ''}
                  onClick={() => onRevisarCandidato && onRevisarCandidato(asp)}
                >
                  <h4 className="text-sm font-extrabold text-[#0A162B] group-hover:text-blue-800 transition leading-tight">
                    {asp.nombre} {asp.apellidoPaterno} {asp.apellidoMaterno}
                  </h4>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {asp.puestoDeseado} &bull; {asp.edad} años
                  </p>
                </div>

                {/* MÓDULO, COLONIA Y TELÉFONO */}
                <div className="space-y-1 text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{asp.moduloAbordaje}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{asp.colonia}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {asp.telefono}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <FileCheck2 className="w-3 h-3 text-emerald-600" />
                      {asp.documentosAdjuntos.length} docs
                    </span>
                  </div>
                </div>

                {/* MOTIVO DE ESPERA SI APLICA */}
                {asp.estatus === 'en_espera' && asp.motivoEspera && (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900 leading-tight">
                    <span className="block text-[10px] uppercase tracking-wider text-amber-700">
                      Motivo de Espera:
                    </span>
                    {asp.motivoEspera}
                  </div>
                )}

                {/* VACANTE ASIGNADA SI APLICA */}
                {asp.estatus === 'asignado' && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 leading-tight">
                    <span className="block text-[10px] uppercase tracking-wider text-emerald-700">
                      Asignado en Planta:
                    </span>
                    {getNombreVacante(asp.vacanteAsignadaId)}
                  </div>
                )}

                {/* BOTONES DE DECISIÓN OPERATIVA */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  {onRevisarCandidato && (
                    <button
                      type="button"
                      onClick={() => onRevisarCandidato(asp)}
                      title="Revisar expediente completo del aspirante"
                      className="py-1.5 px-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer flex-shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-700" />
                      <span>Revisar</span>
                    </button>
                  )}

                  {asp.estatus === 'nuevo' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setCandidatoSeleccionadoId(esSeleccionado ? null : asp.id)
                          onDecidirCandidato(asp, 'asignar')
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#0A162B] hover:bg-slate-800 text-white text-xs font-extrabold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Aprobar / Asignar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDecidirCandidato(asp, 'espera')}
                        title="Mover a Cartera en Espera"
                        className="py-1.5 px-2.5 rounded-lg border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Espera</span>
                      </button>
                    </>
                  )}

                  {asp.estatus === 'en_espera' && (
                    <button
                      type="button"
                      onClick={() => reactivarAspiranteDeEspera(asp.id)}
                      className="w-full py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Reactivar a Nuevas Solicitudes</span>
                    </button>
                  )}

                  {asp.estatus === 'asignado' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCandidatoSeleccionadoId(esSeleccionado ? null : asp.id)
                        onDecidirCandidato(asp, 'asignar')
                      }}
                      className="w-full py-1 px-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>Reubicar a otra vacante</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
