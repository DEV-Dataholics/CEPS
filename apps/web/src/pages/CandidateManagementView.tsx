import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Brain,
  FileText,
  CheckSquare,
  Sparkles,
  UserCheck,
  Smartphone,
  Eye,
  ArrowRight,
  Save,
  Clock,
  Tag,
  MapPin,
  Phone,
  User,
  Award,
  X,
  ChevronRight,
  Lock,
  RotateCcw,
  Check,
  ExternalLink,
} from 'lucide-react'
import {
  useVacancyStore,
  type AspiranteSolicitud,
  type EvaluacionRazonamientoData,
  type CuestionarioIntegridadData,
  type AltaDispensaData,
} from '../store/vacancyStore'
import { evaluarRazonamiento, calcularAuditoriaIntegridad } from '../store/dossierStore'
import { useAuthStore } from '../store/authStore'
import type {
  ExamenRazonamientoRespuestas,
  CuestionarioEntrevistaRespuestas,
  ChecklistPapeleriaOriginal,
} from '../types/dossierTypes'

const defaultRazonamientoRespuestas: ExamenRazonamientoRespuestas = {
  dondeEncontroMochila: '',
  queHabiaEnMochila: '',
  queDeciaNota: '',
  comoSeSentioAna: '',
  op1_40_mas: '',
  op2_200_mas: '',
  op3_20_mas: '',
  op4_menos_60: '',
  op5_menos_50: '',
  op6_85_menos: '',
  op7_32_mas: '',
  op8_70_mas: '',
  op9_78_mas: '',
  op10_70_menos: '',
  op11_96_menos: '',
  op12_45_menos: '',
  palabraAuto: '',
  pastorOvejas: '',
  trenSobrevivientes: '',
  paradojaMentira: '',
  huevoGallo: '',
}

const defaultCuestionarioRespuestas: CuestionarioEntrevistaRespuestas = {
  p1_valores: '',
  p2_experienciaSeguridad: 'no',
  p3_funcionesGuardia: '',
  p4_reporteIncidente: 'jefe_grupo_ceps',
  p5_reaccionRobo: 'reporto_jefe',
  p6_motivoInteres: 'sueldo',
  p6_motivoInteresDetalle: '',
  p7_motivoRenuncia: '',
  p8_descripcionExperiencia: '',
  p9_autorizaReferencias: 'si',
  p10_nivelTolerancia: 8,
}

const defaultChecklist: ChecklistPapeleriaOriginal = {
  ineOriginalPresentada: false,
  curpPresentada: false,
  rfcPresentada: false,
  nssPresentada: false,
  comprobanteDomicilioPresentado: false,
  comprobanteEstudiosPresentado: false,
  actaNacimientoPresentada: false,
  cartaNoPenalesPresentada: false,
  papeleriaCompleta: false,
  documentosPendientes: [
    'INE Original',
    'CURP',
    'RFC',
    'NSS',
    'Comprobante de Domicilio',
    'Comprobante de Estudios',
    'Acta de Nacimiento',
    'Carta de No Antecedentes Penales',
  ],
}

interface CandidateManagementViewProps {
  onNavegarAVacantes?: () => void
}

export const CandidateManagementView: React.FC<CandidateManagementViewProps> = ({
  onNavegarAVacantes,
}) => {
  const {
    aspirantes,
    guardarExamenRazonamiento,
    guardarCuestionarioIntegridad,
    actualizarChecklistPapeleria,
    darDeAltaCandidato,
  } = useVacancyStore()

  const { rolActivo } = useAuthStore()

  // Estados de interfaz y filtrado
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstatus, setFiltroEstatus] = useState<'todos' | 'nuevo' | 'en_evaluacion' | 'activo'>('todos')
  const [candidatoIdSeleccionado, setCandidatoIdSeleccionado] = useState<string | null>(null)
  const [pestañaActiva, setPestañaActiva] = useState<'solicitud' | 'razonamiento' | 'integridad' | 'papeleria'>('solicitud')
  const [modoQuiosco, setModoQuiosco] = useState(false)
  const [modalDispensaAbierto, setModalDispensaAbierto] = useState(false)
  const [motivoDispensa, setMotivoDispensa] = useState('')
  const [autorizadorDispensa, setAutorizadorDispensa] = useState('Eunice Lira (Supervisora RH)')
  const [toastMensaje, setToastMensaje] = useState<string | null>(null)
  const [modalExitoAlta, setModalExitoAlta] = useState<AspiranteSolicitud | null>(null)

  // Estados temporales de edición para el candidato seleccionado
  const [tempRazonamiento, setTempRazonamiento] = useState<ExamenRazonamientoRespuestas>(defaultRazonamientoRespuestas)
  const [tempCuestionario, setTempCuestionario] = useState<CuestionarioEntrevistaRespuestas>(defaultCuestionarioRespuestas)
  const [tempChecklist, setTempChecklist] = useState<ChecklistPapeleriaOriginal>(defaultChecklist)

  // Filtrado reactivo de candidatos
  const candidatosFiltrados = useMemo(() => {
    return aspirantes.filter((a) => {
      if (filtroEstatus === 'todos') {
        // En esta vista priorizamos a los que están en proceso ('nuevo' o 'en_evaluacion')
        // o si busca por texto muestra a cualquiera
        if (!busqueda.trim() && a.estatus === 'asignado') return false
      } else if (a.estatus !== filtroEstatus) {
        return false
      }

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const matchFolio = a.folio.toLowerCase().includes(q)
        const matchNombre = `${a.nombre} ${a.apellidoPaterno} ${a.apellidoMaterno}`.toLowerCase().includes(q)
        const matchCurp = a.curp.toLowerCase().includes(q)
        const matchRfc = a.rfc.toLowerCase().includes(q)
        const matchTel = a.telefono.includes(q)
        const matchModulo = a.moduloAbordaje.toLowerCase().includes(q)
        return matchFolio || matchNombre || matchCurp || matchRfc || matchTel || matchModulo
      }

      return true
    })
  }, [aspirantes, filtroEstatus, busqueda])

  // Candidato activo seleccionado
  const candidatoActivo = useMemo(() => {
    if (candidatoIdSeleccionado) {
      const found = aspirantes.find((a) => a.id === candidatoIdSeleccionado)
      if (found) return found
    }
    return candidatosFiltrados[0] || null
  }, [aspirantes, candidatoIdSeleccionado, candidatosFiltrados])

  // Cargar datos temporales cada vez que cambia el candidato activo
  React.useEffect(() => {
    if (candidatoActivo) {
      setTempRazonamiento(candidatoActivo.evaluacionRazonamiento?.respuestas ?? defaultRazonamientoRespuestas)
      setTempCuestionario(candidatoActivo.cuestionarioIntegridad?.respuestas ?? defaultCuestionarioRespuestas)
      setTempChecklist(candidatoActivo.checklistPapeleria ?? defaultChecklist)
    }
  }, [candidatoActivo?.id])

  // Cálculos reactivos en tiempo real
  const evaluacionRazonamientoActual = useMemo(() => {
    return evaluarRazonamiento(tempRazonamiento)
  }, [tempRazonamiento])

  const auditoriaIntegridadActual = useMemo(() => {
    return calcularAuditoriaIntegridad(
      tempCuestionario,
      evaluacionRazonamientoActual,
      'Supervisión RH CEPS'
    )
  }, [tempCuestionario, evaluacionRazonamientoActual])

  // Métricas para tarjetas superiores
  const totalNuevos = aspirantes.filter((a) => a.estatus === 'nuevo').length
  const totalEnEvaluacion = aspirantes.filter((a) => a.estatus === 'en_evaluacion').length
  const totalActivos = aspirantes.filter((a) => a.estatus === 'activo').length
  const totalListos = aspirantes.filter((a) => {
    const razOk = a.evaluacionRazonamiento?.evaluacion.aprobado
    const intOk = a.cuestionarioIntegridad?.auditoria.dictamenReclutador !== 'no_apto'
    const papOk = a.checklistPapeleria?.papeleriaCompleta
    return a.estatus !== 'activo' && a.estatus !== 'asignado' && razOk && intOk && papOk
  }).length

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg)
    setTimeout(() => setToastMensaje(null), 3500)
  }

  // Guardar Examen de Razonamiento
  const handleGuardarRazonamiento = () => {
    if (!candidatoActivo) return
    const data: EvaluacionRazonamientoData = {
      respuestas: tempRazonamiento,
      evaluacion: evaluacionRazonamientoActual,
      fechaEvaluacion: new Date().toISOString().substring(0, 10),
      evaluador: 'Supervisión RH / Evaluador CEPS',
    }
    guardarExamenRazonamiento(candidatoActivo.id, data)
    mostrarToast(`Examen de Razonamiento guardado. Errores: ${evaluacionRazonamientoActual.totalErrores} (${evaluacionRazonamientoActual.aprobado ? 'Aprobado' : 'Requiere Comité'})`)
  }

  // Guardar Cuestionario de Integridad RH
  const handleGuardarIntegridad = () => {
    if (!candidatoActivo) return
    const data: CuestionarioIntegridadData = {
      respuestas: tempCuestionario,
      auditoria: auditoriaIntegridadActual,
      fechaEvaluacion: new Date().toISOString().substring(0, 10),
      evaluador: 'Supervisión RH CEPS',
    }
    guardarCuestionarioIntegridad(candidatoActivo.id, data)
    mostrarToast(`Cuestionario de Integridad guardado. Dictamen: ${auditoriaIntegridadActual.dictamenReclutador.toUpperCase()}`)
  }

  // Guardar Checklist de Papelería
  const handleToggleDocumento = (docKey: keyof ChecklistPapeleriaOriginal, label: string) => {
    const nuevoValor = !tempChecklist[docKey]
    const updated = { ...tempChecklist, [docKey]: nuevoValor }

    const documentos = [
      { key: 'ineOriginalPresentada', label: 'INE Original' },
      { key: 'curpPresentada', label: 'CURP' },
      { key: 'rfcPresentada', label: 'RFC' },
      { key: 'nssPresentada', label: 'NSS' },
      { key: 'comprobanteDomicilioPresentado', label: 'Comprobante de Domicilio' },
      { key: 'comprobanteEstudiosPresentado', label: 'Comprobante de Estudios' },
      { key: 'actaNacimientoPresentada', label: 'Acta de Nacimiento' },
      { key: 'cartaNoPenalesPresentada', label: 'Carta de No Antecedentes Penales' },
    ]

    const pendientes = documentos
      .filter((d) => (d.key === docKey ? !nuevoValor : !updated[d.key as keyof ChecklistPapeleriaOriginal]))
      .map((d) => d.label)

    const checklistFinal: ChecklistPapeleriaOriginal = {
      ...updated,
      documentosPendientes: pendientes,
      papeleriaCompleta: pendientes.length === 0,
    }

    setTempChecklist(checklistFinal)
    if (candidatoActivo) {
      actualizarChecklistPapeleria(candidatoActivo.id, checklistFinal)
    }
  }

  // Validación para Alta Oficial
  const estadoRazonamientoOk = candidatoActivo?.evaluacionRazonamiento?.evaluacion.aprobado
  const estadoIntegridadOk = candidatoActivo?.cuestionarioIntegridad?.auditoria.dictamenReclutador !== 'no_apto'
  const estadoPapeleriaOk = candidatoActivo?.checklistPapeleria?.papeleriaCompleta

  const esElegibleAltaOficial = estadoRazonamientoOk && estadoIntegridadOk && estadoPapeleriaOk

  const handleDarDeAltaOficial = () => {
    if (!candidatoActivo) return
    darDeAltaCandidato(candidatoActivo.id)
    setModalExitoAlta(candidatoActivo)
    mostrarToast(`¡${candidatoActivo.nombre} fue dado de alta exitosamente como Guardia Activo!`)
  }

  const handleConfirmarDispensa = () => {
    if (!candidatoActivo) return
    if (!motivoDispensa.trim()) {
      alert('Por favor capture el motivo justificado de la dispensa.')
      return
    }
    const dispensa: AltaDispensaData = {
      autorizadaPor: autorizadorDispensa,
      motivo: motivoDispensa.trim(),
      fecha: new Date().toISOString().substring(0, 10),
    }
    darDeAltaCandidato(candidatoActivo.id, dispensa)
    setModalDispensaAbierto(false)
    setMotivoDispensa('')
    setModalExitoAlta(candidatoActivo)
    mostrarToast(`Alta con dispensa autorizada para ${candidatoActivo.nombre}.`)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EDF2F7] overflow-hidden">
      {/* TOAST FLOTANTE */}
      {toastMensaje && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0A162B] text-white px-5 py-3 rounded-xl border-2 border-[#D4AF37] shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold">{toastMensaje}</span>
        </div>
      )}

      {/* CABECERA SUPERIOR Y MÉTRICAS */}
      <div className="bg-white border-b-2 border-slate-300 p-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0A162B] text-[#D4AF37] flex items-center justify-center font-extrabold shadow-sm">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-[#0A162B] tracking-tight flex items-center gap-2">
                  Gestión y Evaluación de Candidatos
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Paso 2 &bull; Selección Oficial CEPS
                  </span>
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Identificación por folio, captura de exámenes psicotécnicos, integridad y alta oficial al servicio
                </p>
              </div>
            </div>
          </div>

          {/* TARJETAS RESUMEN EJECUTIVO */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500">Nuevos</div>
                <div className="text-sm font-extrabold text-[#0A162B] leading-none">{totalNuevos}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500">En Examen</div>
                <div className="text-sm font-extrabold text-amber-900 leading-none">{totalEnEvaluacion}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500">Listos Alta</div>
                <div className="text-sm font-extrabold text-purple-900 leading-none">{totalListos}</div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Activos Hoy</div>
                <div className="text-sm font-extrabold text-emerald-950 leading-none">{totalActivos}</div>
              </div>
            </div>

            {/* BOTÓN MODO QUIOSCO TABLET */}
            <button
              onClick={() => setModoQuiosco(!modoQuiosco)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-xs ${
                modoQuiosco
                  ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400/50'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
              title="Modo Quiosco para que el aspirante conteste directamente en pantalla"
            >
              <Smartphone className="w-4 h-4" />
              <span>{modoQuiosco ? 'Salir de Quiosco' : 'Modo Quiosco Tablet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL EN DOS COLUMNAS */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* COLUMNA IZQUIERDA: LISTA Y BÚSQUEDA POR FOLIO */}
        {!modoQuiosco && (
          <div className="w-full md:w-80 lg:w-96 bg-white border-r-2 border-slate-300 flex flex-col shrink-0">
            {/* BUSCADOR POR FOLIO / QR */}
            <div className="p-3.5 border-b border-slate-200 bg-[#F8FAFC] flex flex-col gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por Folio (ej. CEPS-2026-4892), CURP..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
                />
              </div>

              {/* FILTROS DE ESTADO */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-xl text-[11px] font-bold text-center">
                <button
                  onClick={() => setFiltroEstatus('todos')}
                  className={`py-1 rounded-lg transition ${
                    filtroEstatus === 'todos' ? 'bg-white text-[#0A162B] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroEstatus('nuevo')}
                  className={`py-1 rounded-lg transition ${
                    filtroEstatus === 'nuevo' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Nuevos
                </button>
                <button
                  onClick={() => setFiltroEstatus('en_evaluacion')}
                  className={`py-1 rounded-lg transition ${
                    filtroEstatus === 'en_evaluacion' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Examen
                </button>
                <button
                  onClick={() => setFiltroEstatus('activo')}
                  className={`py-1 rounded-lg transition ${
                    filtroEstatus === 'activo' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Activos
                </button>
              </div>
            </div>

            {/* LISTA DE CANDIDATOS */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {candidatosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold flex flex-col items-center gap-2">
                  <User className="w-8 h-8 text-slate-300" />
                  <span>No hay candidatos con los criterios buscados.</span>
                </div>
              ) : (
                candidatosFiltrados.map((c) => {
                  const seleccionado = candidatoActivo?.id === c.id
                  const razHecho = !!c.evaluacionRazonamiento
                  const intHecho = !!c.cuestionarioIntegridad
                  const papHecha = !!c.checklistPapeleria?.papeleriaCompleta

                  return (
                    <div
                      key={c.id}
                      onClick={() => setCandidatoIdSeleccionado(c.id)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer flex flex-col gap-1.5 ${
                        seleccionado
                          ? 'border-[#0A162B] bg-slate-50 ring-2 ring-[#0A162B]/15 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-[#0A162B] text-[#D4AF37] border border-[#D4AF37]/40 shadow-2xs flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#D4AF37]" />
                          {c.folio}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            c.estatus === 'activo'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : c.estatus === 'en_evaluacion'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {c.estatus === 'activo' ? 'Activo' : c.estatus === 'en_evaluacion' ? 'En Examen' : 'Nuevo'}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {c.nombre} {c.apellidoPaterno} {c.apellidoMaterno}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.colonia} &bull; {c.telefono}
                        </div>
                      </div>

                      {/* SEMÁFORO DE AVANCE DE EVALUACIONES */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 text-[10px] font-bold text-slate-600">
                        <span
                          className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            razHecho ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Brain className="w-2.5 h-2.5" /> Razonamiento
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            intHecho ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <ShieldCheck className="w-2.5 h-2.5" /> Integridad
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            papHecha ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <CheckSquare className="w-2.5 h-2.5" /> Papelería
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* COLUMNA DERECHA: PANEL DE EVALUACIÓN Y QUIOSCO */}
        <div className="flex-1 flex flex-col bg-[#EDF2F7] overflow-hidden">
          {candidatoActivo ? (
            <>
              {/* BARRA SUPERIOR DEL CANDIDATO SELECCIONADO */}
              <div className="bg-white border-b-2 border-slate-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A162B] text-[#D4AF37] flex items-center justify-center font-extrabold text-lg border-2 border-[#D4AF37]/50 shadow-md">
                    {candidatoActivo.nombre.charAt(0)}
                    {candidatoActivo.apellidoPaterno.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-[#0A162B]">
                        {candidatoActivo.nombre} {candidatoActivo.apellidoPaterno} {candidatoActivo.apellidoMaterno}
                      </h2>
                      <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-[#0A162B] text-[#D4AF37] border border-[#D4AF37]/60">
                        {candidatoActivo.folio}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      Puesto deseado: <span className="font-bold text-slate-900">{candidatoActivo.puestoDeseado}</span> &bull; Teléfono: {candidatoActivo.telefono} &bull; CURP: {candidatoActivo.curp}
                    </p>
                  </div>
                </div>

                {/* ACCIONES DE ALTA RÁPIDA */}
                {!modoQuiosco && (
                  <div className="flex items-center gap-2">
                    {candidatoActivo.estatus === 'activo' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-900 border-2 border-emerald-400 flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Guardia Activo en Sistema
                        </span>
                        {onNavegarAVacantes && (
                          <button
                            onClick={onNavegarAVacantes}
                            className="px-3 py-2 rounded-xl text-xs font-extrabold bg-[#0A162B] text-[#D4AF37] hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
                          >
                            <span>Ir a Asignar en Vacantes</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* BOTÓN DISPENSA RH */}
                        <button
                          onClick={() => setModalDispensaAbierto(true)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border-2 border-amber-300 hover:bg-amber-100 transition flex items-center gap-1 shadow-xs"
                          title="Permite dar de alta con autorización de Supervisión RH si falta papelería"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Alta con Dispensa RH</span>
                        </button>

                        {/* BOTÓN ALTA OFICIAL ESTRICTA */}
                        <button
                          onClick={handleDarDeAltaOficial}
                          disabled={!esElegibleAltaOficial}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-md ${
                            esElegibleAltaOficial
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ring-2 ring-emerald-400/40'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Dar de Alta Oficial</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* NAVEGACIÓN DE PESTAÑAS DE EVALUACIÓN */}
              <div className="bg-[#F8FAFC] border-b-2 border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setPestañaActiva('solicitud')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                    pestañaActiva === 'solicitud'
                      ? 'bg-[#0A162B] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>1. Solicitud y Contacto</span>
                </button>

                <button
                  onClick={() => setPestañaActiva('razonamiento')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                    pestañaActiva === 'razonamiento'
                      ? 'bg-[#0A162B] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>2. Examen de Razonamiento (VER5)</span>
                  {candidatoActivo.evaluacionRazonamiento && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                <button
                  onClick={() => setPestañaActiva('integridad')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                    pestañaActiva === 'integridad'
                      ? 'bg-[#0A162B] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>3. Cuestionario de Integridad RH</span>
                  {candidatoActivo.cuestionarioIntegridad && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                <button
                  onClick={() => setPestañaActiva('papeleria')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                    pestañaActiva === 'papeleria'
                      ? 'bg-[#0A162B] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>4. Checklist de Papelería</span>
                  {candidatoActivo.checklistPapeleria?.papeleriaCompleta && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              </div>

              {/* CUERPO PRINCIPAL DE LA PESTAÑA ACTIVA */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* 1. PESTAÑA SOLICITUD Y CONTACTO */}
                {pestañaActiva === 'solicitud' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
                      <h3 className="text-sm font-extrabold text-[#0A162B] pb-2 border-b border-slate-200 flex items-center justify-between">
                        <span>Ficha Técnica de Identificación Ciudad Juárez</span>
                        <span className="text-xs font-mono font-bold text-slate-500">Folio: {candidatoActivo.folio}</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1">Nombre Completo:</span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {candidatoActivo.nombre} {candidatoActivo.apellidoPaterno} {candidatoActivo.apellidoMaterno}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1">CURP:</span>
                          <span className="font-mono font-extrabold text-slate-900">{candidatoActivo.curp}</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1">RFC Oficial:</span>
                          <span className="font-mono font-extrabold text-slate-900">{candidatoActivo.rfc}</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1">Teléfono Directo:</span>
                          <span className="font-extrabold text-slate-900">{candidatoActivo.telefono}</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1">Edad:</span>
                          <span className="font-extrabold text-slate-900">{candidatoActivo.edad} años</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1">Módulo de Captación:</span>
                          <span className="font-extrabold text-slate-900">{candidatoActivo.moduloAbordaje}</span>
                        </div>

                        <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1">Domicilio Registrado:</span>
                          <span className="font-extrabold text-slate-900">
                            {candidatoActivo.colonia}, {candidatoActivo.zonaJuarez} (Cd. Juárez, Chih.)
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1">Coordenadas GPS:</span>
                          <span className="font-mono text-xs text-slate-700 font-semibold">
                            {candidatoActivo.latitud}, {candidatoActivo.longitud}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SEMÁFORO RESUMEN PARA ALTA */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-3">
                      <h3 className="text-sm font-extrabold text-[#0A162B] flex items-center justify-between">
                        <span>Checklist Integral de Reclutamiento &bull; Requisitos para Alta</span>
                        <span className="text-xs font-bold text-slate-500">Gobernanza CEPS</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div
                          className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                            estadoRazonamientoOk
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50 border-amber-300 text-amber-950'
                          }`}
                        >
                          <Brain className={`w-6 h-6 shrink-0 ${estadoRazonamientoOk ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <div>
                            <div className="font-extrabold text-xs">1. Razonamiento (VER5)</div>
                            <div className="text-[11px] font-semibold">
                              {estadoRazonamientoOk ? 'Aprobado (≤ 8 errores)' : 'Pendiente o con observaciones'}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                            estadoIntegridadOk
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50 border-amber-300 text-amber-950'
                          }`}
                        >
                          <ShieldCheck className={`w-6 h-6 shrink-0 ${estadoIntegridadOk ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <div>
                            <div className="font-extrabold text-xs">2. Integridad RH</div>
                            <div className="text-[11px] font-semibold">
                              {estadoIntegridadOk ? 'Apto / Sin banderas rojas' : 'Pendiente o no apto'}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                            estadoPapeleriaOk
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50 border-amber-300 text-amber-950'
                          }`}
                        >
                          <CheckSquare className={`w-6 h-6 shrink-0 ${estadoPapeleriaOk ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <div>
                            <div className="font-extrabold text-xs">3. Papelería Original</div>
                            <div className="text-[11px] font-semibold">
                              {estadoPapeleriaOk ? '100% Presentada (8/8)' : `${candidatoActivo.checklistPapeleria?.documentosPendientes.length ?? 8} pendientes`}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          {esElegibleAltaOficial
                            ? '✅ Todos los requisitos están satisfechos. Puede proceder a dar de alta al guardia.'
                            : '⚠️ Faltan requisitos obligatorios para alta directa. Puede autorizar una dispensa si cuenta con permiso de Supervisión RH.'}
                        </span>

                        <button
                          onClick={() => setPestañaActiva('razonamiento')}
                          className="px-4 py-2 bg-[#0A162B] text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5"
                        >
                          <span>Iniciar Evaluación</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PESTAÑA EXAMEN DE RAZONAMIENTO (VER5 OFICIAL) */}
                {pestañaActiva === 'razonamiento' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    {/* BANNER DE STATUS DEL EXAMEN */}
                    <div
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                        evaluacionRazonamientoActual.aprobado
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Brain className="w-7 h-7 text-[#0A162B]" />
                        <div>
                          <div className="text-sm font-extrabold">
                            Examen de Razonamiento Oficial VER5 &bull; {evaluacionRazonamientoActual.totalErrores} errores registrados
                          </div>
                          <div className="text-xs font-medium text-slate-700">
                            {evaluacionRazonamientoActual.observaciones}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleGuardarRazonamiento}
                        className="px-4 py-2.5 bg-[#0A162B] text-[#D4AF37] hover:bg-slate-800 font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-md shrink-0"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Examen</span>
                      </button>
                    </div>

                    {/* BLOQUE A: LECTURA COMPRENSIVA */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
                      <div className="pb-2 border-b border-slate-200">
                        <h4 className="text-xs font-black uppercase text-[#0A162B] tracking-wider">
                          Bloque 1: Lectura Comprensiva (&quot;La mochila de Ana&quot;)
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          &quot;Ayer por la tarde, Juan encontró una mochila en el parque. Al abrirla, vio libros, unos lentes y una nota que decía: &apos;Gracias por cuidar mis cosas. Mi nombre es Ana&apos;. Juan llevó la mochila a la caseta de policía. Más tarde, Ana llegó a recogerla muy agradecida.&quot;
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-800">1. ¿Dónde encontró Juan la mochila?</label>
                          <select
                            value={tempRazonamiento.dondeEncontroMochila}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, dondeEncontroMochila: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          >
                            <option value="">Seleccione respuesta...</option>
                            <option value="En el parque">En el parque (Correcta)</option>
                            <option value="En la caseta">En la caseta</option>
                            <option value="En la escuela">En la escuela</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-800">2. ¿Qué había dentro de la mochila?</label>
                          <select
                            value={tempRazonamiento.queHabiaEnMochila}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, queHabiaEnMochila: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          >
                            <option value="">Seleccione respuesta...</option>
                            <option value="Una nota">Una nota (Correcta)</option>
                            <option value="Dinero">Dinero</option>
                            <option value="Un celular">Un celular</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-800">3. ¿Qué decía la nota?</label>
                          <input
                            type="text"
                            placeholder="Ej. Gracias por cuidar mis cosas..."
                            value={tempRazonamiento.queDeciaNota}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, queDeciaNota: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-800">4. ¿Cómo se sintió Ana al recuperar sus cosas?</label>
                          <select
                            value={tempRazonamiento.comoSeSentioAna}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, comoSeSentioAna: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          >
                            <option value="">Seleccione respuesta...</option>
                            <option value="Agradecida">Agradecida (Correcta)</option>
                            <option value="Enojada">Enojada</option>
                            <option value="Preocupada">Preocupada</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* BLOQUE B: ARITMÉTICA BÁSICA OPERATIVA */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#0A162B] tracking-wider pb-2 border-b border-slate-200">
                        Bloque 2: Aritmética Operativa Rápida (Cálculo de bitácora y horas)
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">40 + [ ] = 80</label>
                          <input
                            type="text"
                            placeholder="Resp: 40"
                            value={tempRazonamiento.op1_40_mas}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, op1_40_mas: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">200 + [ ] = 450</label>
                          <input
                            type="text"
                            placeholder="Resp: 250"
                            value={tempRazonamiento.op2_200_mas}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, op2_200_mas: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">20 + [ ] = 45</label>
                          <input
                            type="text"
                            placeholder="Resp: 25"
                            value={tempRazonamiento.op3_20_mas}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, op3_20_mas: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">[ ] - 60 = 20</label>
                          <input
                            type="text"
                            placeholder="Resp: 80"
                            value={tempRazonamiento.op4_menos_60}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, op4_menos_60: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">[ ] - 50 = 150</label>
                          <input
                            type="text"
                            placeholder="Resp: 200"
                            value={tempRazonamiento.op5_menos_50}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, op5_menos_50: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">85 - [ ] = 40</label>
                          <input
                            type="text"
                            placeholder="Resp: 45"
                            value={tempRazonamiento.op6_85_menos}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, op6_85_menos: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">32 + [ ] = 32</label>
                          <input
                            type="text"
                            placeholder="Resp: 0"
                            value={tempRazonamiento.op7_32_mas}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, op7_32_mas: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">70 + [ ] = 105</label>
                          <input
                            type="text"
                            placeholder="Resp: 35"
                            value={tempRazonamiento.op8_70_mas}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, op8_70_mas: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BLOQUE C: LÓGICA Y AGUDEZA */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#0A162B] tracking-wider pb-2 border-b border-slate-200">
                        Bloque 3: Lógica, Preguntas Capciosas y Atención al Detalle
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-800">
                            1. &quot;La palabra AUTO empieza con A y termina con T.&quot; ¿Es correcto?
                          </label>
                          <input
                            type="text"
                            placeholder="Respuesta esperada: No, termina con O (o termina con T si es trampa de letras)"
                            value={tempRazonamiento.palabraAuto}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, palabraAuto: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-800">
                            2. &quot;Un pastor tiene 15 ovejas y se le mueren todas menos 12. ¿Cuántas le quedan vivas?&quot;
                          </label>
                          <input
                            type="text"
                            placeholder="Respuesta esperada: 12"
                            value={tempRazonamiento.pastorOvejas}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, pastorOvejas: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-800">
                            3. &quot;Si un tren eléctrico choca en la frontera entre México y EE.UU., ¿dónde se entierran a los sobrevivientes?&quot;
                          </label>
                          <input
                            type="text"
                            placeholder="Respuesta esperada: A los sobrevivientes no se les entierra"
                            value={tempRazonamiento.trenSobrevivientes}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, trenSobrevivientes: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-800">
                            4. &quot;Si un gallo pone un huevo en la punta de un tejado, ¿hacia qué lado rodaría?&quot;
                          </label>
                          <input
                            type="text"
                            placeholder="Respuesta esperada: Los gallos no ponen huevos"
                            value={tempRazonamiento.huevoGallo}
                            onChange={(e) => setTempRazonamiento({ ...tempRazonamiento, huevoGallo: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={handleGuardarRazonamiento}
                        className="px-6 py-2.5 bg-[#0A162B] text-[#D4AF37] hover:bg-slate-800 font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Examen de Razonamiento</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. PESTAÑA CUESTIONARIO DE INTEGRIDAD RH */}
                {pestañaActiva === 'integridad' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    {/* BANNER DE AUDITORÍA Y BANDERAS ROJAS */}
                    <div
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                        auditoriaIntegridadActual.dictamenReclutador === 'apto'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : auditoriaIntegridadActual.dictamenReclutador === 'reserva'
                          ? 'bg-amber-50 border-amber-300 text-amber-950'
                          : 'bg-red-50 border-red-300 text-red-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-[#0A162B]" />
                        <div>
                          <div className="text-sm font-extrabold">
                            Dictamen Sugerido: {auditoriaIntegridadActual.dictamenReclutador.toUpperCase()}
                          </div>
                          <div className="text-xs font-medium text-slate-700">
                            {auditoriaIntegridadActual.notasConfidenciales}
                          </div>
                          {auditoriaIntegridadActual.banderasRojas.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {auditoriaIntegridadActual.banderasRojas.map((b, i) => (
                                <span key={i} className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 text-[10px] font-bold mr-2">
                                  🚩 {b}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleGuardarIntegridad}
                        className="px-4 py-2.5 bg-[#0A162B] text-[#D4AF37] hover:bg-slate-800 font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-md shrink-0"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Cuestionario</span>
                      </button>
                    </div>

                    {/* FORMULARIO DE 10 PREGUNTAS OFICIALES RH */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#0A162B] tracking-wider pb-2 border-b border-slate-200">
                        Cuestionario Estructurado de Integridad y Ética Operativa CEPS (10 Reactivos)
                      </h4>

                      <div className="space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-800">1. ¿Cuáles valores consideras fundamentales en tu vida y trabajo?</label>
                          <input
                            type="text"
                            placeholder="Ej. Honestidad, disciplina, puntualidad..."
                            value={tempCuestionario.p1_valores}
                            onChange={(e) => setTempCuestionario({ ...tempCuestionario, p1_valores: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-800">2. ¿Tienes experiencia en seguridad privada?</label>
                            <select
                              value={tempCuestionario.p2_experienciaSeguridad}
                              onChange={(e) => setTempCuestionario({ ...tempCuestionario, p2_experienciaSeguridad: e.target.value as 'si' | 'no' })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                            >
                              <option value="no">No, es mi primera vez</option>
                              <option value="si">Sí, cuento con experiencia</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-800">3. ¿Qué funciones realiza un guardia en caseta?</label>
                            <input
                              type="text"
                              placeholder="Ej. Control de accesos, revisión de gafetes..."
                              value={tempCuestionario.p3_funcionesGuardia}
                              onChange={(e) => setTempCuestionario({ ...tempCuestionario, p3_funcionesGuardia: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                            />
                          </div>
                        </div>

                        {/* REACTIVO CRÍTICO 1: REPORTE DE INCIDENTE Y CADENA DE MANDO */}
                        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
                          <label className="font-extrabold text-[#0A162B] flex items-center gap-1.5">
                            <span>4. Ante una anomalía grave o emergencia en turno, ¿a quién le reportas de inmediato?</span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Protocolo CEPS</span>
                          </label>
                          <select
                            value={tempCuestionario.p4_reporteIncidente}
                            onChange={(e) => setTempCuestionario({ ...tempCuestionario, p4_reporteIncidente: e.target.value as any })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                          >
                            <option value="jefe_grupo_ceps">A mi Jefe de Grupo / Supervisor CEPS en turno (Óptimo)</option>
                            <option value="supervisor_ceps">Directo a la Central de Radio CEPS</option>
                            <option value="seguridad_interna">A la gerencia de planta de la maquila antes que a CEPS (Desvío de mando)</option>
                          </select>
                        </div>

                        {/* REACTIVO CRÍTICO 2: INTEGRIDAD PATRIMONIAL Y ROBO */}
                        <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 space-y-1.5">
                          <label className="font-extrabold text-red-950 flex items-center gap-1.5">
                            <span>5. Si descubres que un compañero de caseta sustrae mercancía o material de la maquila, ¿qué haces?</span>
                            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Filtro Antirrobo</span>
                          </label>
                          <select
                            value={tempCuestionario.p5_reaccionRobo}
                            onChange={(e) => setTempCuestionario({ ...tempCuestionario, p5_reaccionRobo: e.target.value as any })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-red-950"
                          >
                            <option value="reporto_jefe">Reporto formalmente a mi supervisor de inmediato (Bajo riesgo / Confiable)</option>
                            <option value="ayudo">Hablo primero con mi compañero para que lo devuelva (Riesgo / Desvío)</option>
                            <option value="no_digo_nada">No me meto en problemas ni digo nada (ALTO RIESGO / BANDERA ROJA CRÍTICA)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-800">6. ¿Qué te motivó a postularte a CEPS?</label>
                            <select
                              value={tempCuestionario.p6_motivoInteres}
                              onChange={(e) => setTempCuestionario({ ...tempCuestionario, p6_motivoInteres: e.target.value as any })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                            >
                              <option value="sueldo">Sueldo puntual y prestaciones</option>
                              <option value="experiencia">Ganar experiencia y desarrollo</option>
                              <option value="otros">Cercanía a mi domicilio en Juárez</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-800">7. ¿Cuál fue el motivo de renuncia de tu último empleo?</label>
                            <input
                              type="text"
                              placeholder="Ej. Búsqueda de mejores prestaciones, turno 12x12..."
                              value={tempCuestionario.p7_motivoRenuncia}
                              onChange={(e) => setTempCuestionario({ ...tempCuestionario, p7_motivoRenuncia: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-800">9. ¿Nos autorizas a llamar a tus empleos anteriores para pedir referencias?</label>
                            <select
                              value={tempCuestionario.p9_autorizaReferencias}
                              onChange={(e) => setTempCuestionario({ ...tempCuestionario, p9_autorizaReferencias: e.target.value as any })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                            >
                              <option value="si">Sí, totalmente autorizado</option>
                              <option value="no">No autorizo (Genera observación)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-800">
                              10. Nivel de tolerancia al estrés y trato con operadores (1 al 10): <span className="font-extrabold text-[#0A162B]">{tempCuestionario.p10_nivelTolerancia}</span>
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={tempCuestionario.p10_nivelTolerancia}
                              onChange={(e) => setTempCuestionario({ ...tempCuestionario, p10_nivelTolerancia: parseInt(e.target.value) || 8 })}
                              className="w-full accent-[#0A162B]"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                              <span>1 (Baja tolerancia)</span>
                              <span>5 (Moderada)</span>
                              <span>10 (Excelente templanza)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={handleGuardarIntegridad}
                        className="px-6 py-2.5 bg-[#0A162B] text-[#D4AF37] hover:bg-slate-800 font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Cuestionario de Integridad</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. PESTAÑA CHECKLIST DE PAPELERÍA ORIGINAL */}
                {pestañaActiva === 'papeleria' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <h4 className="text-sm font-extrabold text-[#0A162B]">
                            Revisión y Cotejo de Papelería Original en Módulo
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Verifique físicamente cada documento original entregado por el aspirante en Juárez
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                              tempChecklist.papeleriaCompleta
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                : 'bg-amber-100 text-amber-900 border-amber-400'
                            }`}
                          >
                            {tempChecklist.papeleriaCompleta ? 'Completa (8/8)' : `${8 - tempChecklist.documentosPendientes.length}/8 Cotejados`}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {[
                          { key: 'ineOriginalPresentada', label: '1. INE Original Vigente' },
                          { key: 'curpPresentada', label: '2. Clave CURP Certificada' },
                          { key: 'rfcPresentada', label: '3. Constancia de Situación Fiscal (RFC)' },
                          { key: 'nssPresentada', label: '4. Número de Seguro Social (NSS / IMSS)' },
                          { key: 'comprobanteDomicilioPresentado', label: '5. Comprobante de Domicilio (Agua/Luz < 3 meses)' },
                          { key: 'comprobanteEstudiosPresentado', label: '6. Comprobante de Estudios (Secundaria o sup.)' },
                          { key: 'actaNacimientoPresentada', label: '7. Acta de Nacimiento Original' },
                          { key: 'cartaNoPenalesPresentada', label: '8. Carta de No Antecedentes Penales de Chihuahua' },
                        ].map((doc) => {
                          const presentado = !!tempChecklist[doc.key as keyof ChecklistPapeleriaOriginal]
                          return (
                            <div
                              key={doc.key}
                              onClick={() => handleToggleDocumento(doc.key as keyof ChecklistPapeleriaOriginal, doc.label)}
                              className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                                presentado
                                  ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-bold'
                                  : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                              }`}
                            >
                              <span>{doc.label}</span>
                              <div
                                className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                                  presentado
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : 'bg-white border-slate-300'
                                }`}
                              >
                                {presentado && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {tempChecklist.documentosPendientes.length > 0 && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950">
                          <span className="font-bold block mb-1">Documentos pendientes para completar expediente:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-amber-900 font-medium">
                            {tempChecklist.documentosPendientes.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <UserCheck className="w-16 h-16 text-slate-300 mb-3" />
              <h3 className="text-base font-extrabold text-[#0A162B]">Ningún candidato seleccionado</h3>
              <p className="text-xs font-medium text-slate-600 max-w-sm mt-1">
                Busca un folio en el buscador o selecciona un candidato de la lista lateral para aplicar sus exámenes y checklist.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE DISPENSA RH */}
      {modalDispensaAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border-2 border-amber-400 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black">Autorización de Alta con Dispensa RH</h3>
              </div>
              <button
                onClick={() => setModalDispensaAbierto(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              El candidato <strong>{candidatoActivo?.nombre} {candidatoActivo?.apellidoPaterno}</strong> cuenta con requisitos o papelería pendiente. Para habilitarlo en el Gestor de Vacantes, se requiere el aval formal de Supervisión RH.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Supervisor que Autoriza:</label>
                <input
                  type="text"
                  value={autorizadorDispensa}
                  onChange={(e) => setAutorizadorDispensa(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Motivo y Compromiso de Regularización:</label>
                <textarea
                  rows={3}
                  placeholder="Ej. Carta de no antecedentes penales en trámite, entrega el próximo martes. Aprobado para capacitación inicial."
                  value={motivoDispensa}
                  onChange={(e) => setMotivoDispensa(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalDispensaAbierto(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDispensa}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Autorizar y Dar de Alta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO AL DAR DE ALTA */}
      {modalExitoAlta && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border-2 border-emerald-400 shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-[#0A162B]">¡Guardia Dado de Alta con Éxito!</h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                <strong>{modalExitoAlta.nombre} {modalExitoAlta.apellidoPaterno}</strong> ({modalExitoAlta.folio}) ha sido registrado como <strong>Guardia Activo Oficial</strong> en CEPS Paso del Norte.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Expediente Oficial:</span>
                <span className="text-slate-900">Generado en Dossiers</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Disponibilidad:</span>
                <span className="text-emerald-700">Listo en Gestor de Vacantes</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setModalExitoAlta(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-50"
              >
                Continuar Evaluando
              </button>
              {onNavegarAVacantes && (
                <button
                  onClick={() => {
                    setModalExitoAlta(null)
                    onNavegarAVacantes()
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-[#0A162B] text-[#D4AF37] hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Ir a Vacantes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
