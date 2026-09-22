import React, { useState, useMemo } from 'react'
import {
  Briefcase,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Building2,
} from 'lucide-react'
import { useVacancyStore, type AspiranteSolicitud } from '../store/vacancyStore'
import { VacancyCard } from '../components/VacancyCard'
import { ApplicantInbox } from '../components/ApplicantInbox'
import { NewVacancyModal } from '../components/NewVacancyModal'
import { AssignCandidateModal } from '../components/AssignCandidateModal'
import { CandidateReviewModal } from '../components/CandidateReviewModal'

export const VacancyManagerView: React.FC = () => {
  const {
    vacantes,
    aspirantes,
    candidatoSeleccionadoId,
    setCandidatoSeleccionadoId,
    asignarAspiranteAVacante,
    reiniciarDatosDemo,
  } = useVacancyStore()

  const [modalNuevaVacanteOpen, setModalNuevaVacanteOpen] = useState(false)
  const [candidatoParaDecidir, setCandidatoParaDecidir] = useState<AspiranteSolicitud | null>(null)
  const [candidatoParaRevisar, setCandidatoParaRevisar] = useState<AspiranteSolicitud | null>(null)
  const [modoDecision, setModoDecision] = useState<'asignar' | 'espera' | null>(null)
  const [toastMensaje, setToastMensaje] = useState<string | null>(null)

  // Estados de Filtro y Paginación para el Tablero de Vacantes
  const [busquedaVacante, setBusquedaVacante] = useState('')
  const [filtroEstadoVacante, setFiltroEstadoVacante] = useState<'todas' | 'libres' | 'cubiertas'>('todas')
  const [filtroTurnoVacante, setFiltroTurnoVacante] = useState<string>('todos')
  const [vacantesPorPagina, setVacantesPorPagina] = useState<number>(4)
  const [paginaActual, setPaginaActual] = useState<number>(1)

  // Candidato enfocado actualmente para asignación directa
  const candidatoActivo = candidatoSeleccionadoId
    ? aspirantes.find((a) => a.id === candidatoSeleccionadoId) || null
    : null

  // Métricas operativas consolidadas
  const plazasTotales = vacantes.reduce((sum, v) => sum + v.plazasTotales, 0)
  const plazasCubiertas = vacantes.reduce((sum, v) => sum + v.aspirantesAsignadosIds.length, 0)
  const plazasLibres = Math.max(plazasTotales - plazasCubiertas, 0)
  const porcentajeCobertura = plazasTotales > 0 ? Math.round((plazasCubiertas / plazasTotales) * 100) : 0
  const totalEnEspera = aspirantes.filter((a) => a.estatus === 'en_espera').length

  // Filtrado de vacantes por búsqueda, cobertura y turno
  const vacantesFiltradas = useMemo(() => {
    return vacantes.filter((vac) => {
      // 1. Filtro por texto
      if (busquedaVacante.trim()) {
        const q = busquedaVacante.toLowerCase().trim()
        const coincide =
          vac.empresa.toLowerCase().includes(q) ||
          vac.planta.toLowerCase().includes(q) ||
          vac.puesto.toLowerCase().includes(q) ||
          vac.zona.toLowerCase().includes(q) ||
          vac.turno.toLowerCase().includes(q)
        if (!coincide) return false
      }

      // 2. Filtro por estado de cupo
      const cubierta = vac.aspirantesAsignadosIds.length >= vac.plazasTotales
      if (filtroEstadoVacante === 'libres' && cubierta) return false
      if (filtroEstadoVacante === 'cubiertas' && !cubierta) return false

      // 3. Filtro por turno
      if (filtroTurnoVacante !== 'todos') {
        const turnoLower = vac.turno.toLowerCase()
        if (filtroTurnoVacante === '12x12' && !turnoLower.includes('12x12')) return false
        if (filtroTurnoVacante === 'turno_1' && !turnoLower.includes('turno 1') && !turnoLower.includes('mañana')) return false
        if (filtroTurnoVacante === 'turno_2' && !turnoLower.includes('turno 2') && !turnoLower.includes('tarde')) return false
        if (filtroTurnoVacante === 'nocturno' && !turnoLower.includes('nocturno')) return false
      }

      return true
    })
  }, [vacantes, busquedaVacante, filtroEstadoVacante, filtroTurnoVacante])

  // Cálculo de Paginación
  const totalPaginas = Math.max(1, Math.ceil(vacantesFiltradas.length / vacantesPorPagina))
  const paginaSegura = Math.min(Math.max(1, paginaActual), totalPaginas)
  const inicioIndice = (paginaSegura - 1) * vacantesPorPagina
  const finIndice = inicioIndice + vacantesPorPagina
  const vacantesPaginadas = vacantesFiltradas.slice(inicioIndice, finIndice)

  // Indicador de filtros activos
  const hayFiltrosActivos =
    busquedaVacante.trim() !== '' ||
    filtroEstadoVacante !== 'todas' ||
    filtroTurnoVacante !== 'todos'

  const limpiarFiltros = () => {
    setBusquedaVacante('')
    setFiltroEstadoVacante('todas')
    setFiltroTurnoVacante('todos')
    setPaginaActual(1)
  }

  const handleDecidirCandidato = (candidato: AspiranteSolicitud, accion: 'asignar' | 'espera') => {
    setCandidatoParaDecidir(candidato)
    setModoDecision(accion)
  }

  const handleAsignarCandidatoActivoAVacante = (vacanteId: string) => {
    if (!candidatoActivo) return
    const vac = vacantes.find((v) => v.id === vacanteId)
    asignarAspiranteAVacante(candidatoActivo.id, vacanteId)
    setToastMensaje(
      `¡${candidatoActivo.nombre} asignado a ${vac?.empresa || 'la vacante'} exitosamente!`
    )
    setTimeout(() => setToastMensaje(null), 3500)
  }

  return (
    <div className="flex-1 flex flex-col font-sans bg-[#EDF2F7]">
      {/* HEADER DE MANDO OPERATIVO */}
      <header className="bg-[#0A162B] text-white py-4 px-4 sm:px-8 border-b-2 border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#060E1C] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-[#D4AF37] uppercase tracking-wider">
                  Operaciones &bull; Cobertura de Plantillas
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-white">
                Administrador de Vacantes &amp; Empate Operativo
              </h1>
            </div>
          </div>

          {/* ACCIONES Y BOTÓN NUEVA VACANTE */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                reiniciarDatosDemo()
                setToastMensaje('Catálogo y solicitudes reiniciadas con datos demo de Juárez.')
                setTimeout(() => setToastMensaje(null), 3000)
              }}
              title="Restablecer vacantes y solicitudes de prueba"
              className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restablecer Demo</span>
            </button>

            <button
              type="button"
              onClick={() => setModalNuevaVacanteOpen(true)}
              className="px-4 py-2 text-xs font-extrabold text-[#0A162B] bg-[#D4AF37] hover:bg-[#C59F2D] rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nueva Vacante</span>
            </button>
          </div>
        </div>

        {/* CINTA DE MÉTRICAS OPERATIVAS */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#060E1C]/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Plazas Requeridas</span>
              <span className="text-base font-extrabold text-white font-mono">{plazasTotales} guardias</span>
            </div>
          </div>

          <div className="bg-[#060E1C]/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Plazas Cubiertas</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {plazasCubiertas} ({porcentajeCobertura}%)
              </span>
            </div>
          </div>

          <div className="bg-[#060E1C]/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Plazas Pendientes</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">{plazasLibres} vacantes</span>
            </div>
          </div>

          <div className="bg-[#060E1C]/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Cartera en Espera</span>
              <span className="text-base font-extrabold text-[#D4AF37] font-mono">{totalEnEspera} aspirantes</span>
            </div>
          </div>
        </div>
      </header>

      {/* BANNER INFORMATIVO SI HAY UN CANDIDATO SELECCIONADO PARA EMPATE */}
      {candidatoActivo && (
        <div className="bg-amber-500 text-[#0A162B] px-6 py-2.5 flex items-center justify-between text-xs font-extrabold shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A162B] animate-ping"></span>
            <span>
              Asignando a: <strong>{candidatoActivo.nombre} {candidatoActivo.apellidoPaterno}</strong> ({candidatoActivo.folio}) &bull; Selecciona una vacante con plazas disponibles para vincularlo.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCandidatoSeleccionadoId(null)}
            className="px-2.5 py-0.5 rounded bg-[#0A162B] text-white hover:bg-slate-800 text-[11px] transition font-bold"
          >
            Cancelar Selección
          </button>
        </div>
      )}

      {/* CUERPO PRINCIPAL: DOBLE PANEL OPERATIVO */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
        {/* PANEL IZQUIERDO: BANDEJA DE SOLICITUDES */}
        <section className="w-full lg:w-[420px] xl:w-[450px] flex-shrink-0 flex flex-col">
          <ApplicantInbox
            onDecidirCandidato={handleDecidirCandidato}
            onRevisarCandidato={(c) => setCandidatoParaRevisar(c)}
          />
        </section>

        {/* PANEL DERECHO: TABLERO DE VACANTES POR EMPRESA */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0A162B]">
                Vacantes Operativas por Maquiladora / Empresa
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                {vacantes.length} vacantes registradas en parques industriales de Ciudad Juárez
              </p>
            </div>
          </div>

          {/* BARRA DE FILTROS Y BÚSQUEDA DE VACANTES */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-col gap-3">
            {/* FILA 1: BUSCADOR PRINCIPAL Y SELECTOR DE ELEMENTOS POR PÁGINA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busquedaVacante}
                  onChange={(e) => {
                    setBusquedaVacante(e.target.value)
                    setPaginaActual(1)
                  }}
                  placeholder="Buscar maquiladora, planta, puesto, parque industrial..."
                  className="w-full pl-10 pr-9 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0A162B] transition"
                />
                {busquedaVacante && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusquedaVacante('')
                      setPaginaActual(1)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* SELECTOR DE VACANTES POR PÁGINA */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                  Mostrar:
                </label>
                <select
                  value={vacantesPorPagina}
                  onChange={(e) => {
                    setVacantesPorPagina(Number(e.target.value))
                    setPaginaActual(1)
                  }}
                  className="py-1.5 px-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-extrabold text-[#0A162B] focus:outline-none focus:border-[#0A162B] cursor-pointer"
                >
                  <option value={4}>4 por pág.</option>
                  <option value={6}>6 por pág.</option>
                  <option value={8}>8 por pág.</option>
                  <option value={15}>15 por pág.</option>
                </select>
              </div>
            </div>

            {/* FILA 2: CHIPS DE ESTADO Y SELECTOR DE TURNO */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-100">
              {/* CHIPS DE ESTADO */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setFiltroEstadoVacante('todas')
                    setPaginaActual(1)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    filtroEstadoVacante === 'todas'
                      ? 'bg-[#0A162B] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Todas</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-black/20">
                    {vacantes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFiltroEstadoVacante('libres')
                    setPaginaActual(1)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    filtroEstadoVacante === 'libres'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Con Plazas Libres</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-black/10">
                    {vacantes.filter((v) => v.aspirantesAsignadosIds.length < v.plazasTotales).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFiltroEstadoVacante('cubiertas')
                    setPaginaActual(1)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    filtroEstadoVacante === 'cubiertas'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cubiertas al 100%</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-black/10">
                    {vacantes.filter((v) => v.aspirantesAsignadosIds.length >= v.plazasTotales).length}
                  </span>
                </button>
              </div>

              {/* FILTRO DE TURNO Y BOTÓN LIMPIAR */}
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                <select
                  value={filtroTurnoVacante}
                  onChange={(e) => {
                    setFiltroTurnoVacante(e.target.value)
                    setPaginaActual(1)
                  }}
                  className="py-1.5 px-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0A162B] cursor-pointer"
                >
                  <option value="todos">Todos los turnos</option>
                  <option value="12x12">Turnos 12x12</option>
                  <option value="turno_1">Turno 1 (Matutino)</option>
                  <option value="turno_2">Turno 2 (Vespertino)</option>
                  <option value="nocturno">Turno Nocturno</option>
                </select>

                {hayFiltrosActivos && (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 border border-red-300 transition flex items-center gap-1"
                    title="Restablecer todos los filtros"
                  >
                    <FilterX className="w-3.5 h-3.5" />
                    <span>Limpiar Filtros</span>
                  </button>
                )}
              </div>
            </div>

            {/* RESUMEN DE RESULTADOS */}
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between px-1">
              <span>
                Mostrando{' '}
                <strong className="text-slate-800 font-mono">
                  {vacantesFiltradas.length === 0 ? 0 : inicioIndice + 1}-
                  {Math.min(finIndice, vacantesFiltradas.length)}
                </strong>{' '}
                de <strong className="text-[#0A162B] font-mono">{vacantesFiltradas.length}</strong>{' '}
                vacantes encontradas
                {vacantesFiltradas.length !== vacantes.length && (
                  <span className="text-slate-400 font-normal"> (filtradas del catálogo de {vacantes.length})</span>
                )}
              </span>
              {totalPaginas > 1 && (
                <span className="font-mono text-slate-600">
                  Página <strong className="text-[#0A162B]">{paginaSegura}</strong> de{' '}
                  <strong className="text-[#0A162B]">{totalPaginas}</strong>
                </span>
              )}
            </div>
          </div>

          {/* GRID DE TARJETAS DE VACANTES PAGINADAS */}
          {vacantesPaginadas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vacantesPaginadas.map((vac) => {
                const aspirantesAsignados = aspirantes.filter((a) =>
                  vac.aspirantesAsignadosIds.includes(a.id)
                )
                return (
                  <VacancyCard
                    key={vac.id}
                    vacante={vac}
                    aspirantesAsignados={aspirantesAsignados}
                    candidatoActivo={candidatoActivo}
                    onAsignarCandidatoActivo={handleAsignarCandidatoActivoAVacante}
                  />
                )
              })}
            </div>
          ) : (
            /* EMPTY STATE SI NO HAY RESULTADOS */
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-300 flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0A162B]">
                No se encontraron vacantes con los filtros seleccionados
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mt-1">
                No hay coincidencias para los criterios actuales. Intenta buscando otra maquiladora o limpiando los filtros.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 px-4 py-2 bg-[#D4AF37] text-[#0A162B] hover:bg-[#C59F2D] rounded-xl text-xs font-extrabold transition shadow-sm"
              >
                Restablecer Filtros
              </button>
            </div>
          )}

          {/* PAGINACIÓN INFERIOR INTERACTIVA */}
          {vacantesFiltradas.length > 0 && totalPaginas > 1 && (
            <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 mt-1">
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span>Página</span>
                <span className="font-extrabold text-[#0A162B] font-mono">{paginaSegura}</span>
                <span>de</span>
                <span className="font-extrabold text-[#0A162B] font-mono">{totalPaginas}</span>
                <span className="text-slate-400">({vacantesFiltradas.length} vacantes)</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* BOTÓN ANTERIOR */}
                <button
                  type="button"
                  onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaSegura === 1}
                  className="px-3 py-1.5 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-extrabold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                {/* BOTONES NUMÉRICOS DE PÁGINA */}
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => {
                  const esActiva = num === paginaSegura
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPaginaActual(num)}
                      className={`min-w-[36px] h-9 px-2.5 rounded-xl font-mono text-xs font-extrabold transition shadow-xs flex items-center justify-center ${
                        esActiva
                          ? 'bg-[#0A162B] text-[#D4AF37] border-2 border-[#D4AF37]'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  )
                })}

                {/* BOTÓN SIGUIENTE */}
                <button
                  type="button"
                  onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaSegura === totalPaginas}
                  className="px-3 py-1.5 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-extrabold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-xs"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL NUEVA VACANTE */}
      <NewVacancyModal
        isOpen={modalNuevaVacanteOpen}
        onClose={() => setModalNuevaVacanteOpen(false)}
      />

      {/* MODAL DECISIÓN (APROBAR VS ESPERA) */}
      <AssignCandidateModal
        candidato={candidatoParaDecidir}
        modo={modoDecision}
        onClose={() => {
          setCandidatoParaDecidir(null)
          setModoDecision(null)
        }}
      />

      {/* MODAL AUDITORÍA Y REVISIÓN DETALLADA DE POSTULACIÓN */}
      <CandidateReviewModal
        candidato={candidatoParaRevisar}
        onClose={() => setCandidatoParaRevisar(null)}
        onDecidir={(c, accion) => {
          setCandidatoParaRevisar(null)
          handleDecidirCandidato(c, accion)
        }}
      />

      {/* TOAST DE FEEDBACK */}
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A162B] text-white px-4 py-3 rounded-xl border-2 border-[#D4AF37] shadow-xl text-xs font-extrabold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMensaje}</span>
        </div>
      )}
    </div>
  )
}
