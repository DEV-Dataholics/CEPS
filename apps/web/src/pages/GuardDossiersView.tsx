import React, { useState } from 'react'
import {
  FolderArchive,
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  Brain,
  FileText,
  Lock,
  PlusCircle,
  FileSpreadsheet,
  Building2,
  Check,
  RotateCcw,
} from 'lucide-react'
import { useDossierStore } from '../store/dossierStore'
import { FieldInterviewWizard } from '../components/FieldInterviewWizard'
import type { EstatusExpediente } from '../types/dossierTypes'

export const GuardDossiersView: React.FC = () => {
  const {
    expedientes,
    expedienteSeleccionadoId,
    filtroEstatus,
    busqueda,
    filtroModulo,
    modalEntrevistaAbierto,
    setExpedienteSeleccionadoId,
    setFiltroEstatus,
    setBusqueda,
    setFiltroModulo,
    setModalEntrevistaAbierto,
    actualizarNotasConfidenciales,
    reiniciarDemoDossiers,
  } = useDossierStore()

  const [pestañaExpediente, setPestañaExpediente] = useState<
    'caratula' | 'razonamiento' | 'entrevista' | 'solicitud' | 'papeleria' | 'bitacora'
  >('caratula')

  const [editandoNotas, setEditandoNotas] = useState(false)
  const [notasTemp, setNotasTemp] = useState('')
  const [dictamenTemp, setDictamenTemp] = useState<'apto' | 'reserva' | 'no_apto'>('apto')
  const [toastMensaje, setToastMensaje] = useState<string | null>(null)

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg)
    setTimeout(() => setToastMensaje(null), 3500)
  }

  // Filtrado reactivo de expedientes
  const expedientesFiltrados = expedientes.filter((exp) => {
    if (filtroEstatus !== 'todos' && exp.estatus !== filtroEstatus) return false
    if (filtroModulo !== 'todos' && exp.abordaje.moduloAbordaje !== filtroModulo) return false
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      const matchFolio = exp.folio.toLowerCase().includes(q)
      const matchNombre = `${exp.abordaje.nombre} ${exp.abordaje.apellidoPaterno} ${exp.abordaje.apellidoMaterno}`
        .toLowerCase()
        .includes(q)
      const matchCurp = exp.solicitudEmpleo.curp.toLowerCase().includes(q)
      const matchTel = exp.abordaje.telefono.includes(q)
      const matchPuesto = exp.abordaje.puestoInteres.toLowerCase().includes(q)
      return matchFolio || matchNombre || matchCurp || matchTel || matchPuesto
    }
    return true
  })

  const expedienteActivo =
    expedientes.find((e) => e.id === expedienteSeleccionadoId) || expedientesFiltrados[0] || null

  const iniciarEdicionNotas = () => {
    if (!expedienteActivo) return
    setNotasTemp(expedienteActivo.cuestionarioEntrevista.auditoria.notasConfidenciales)
    setDictamenTemp(expedienteActivo.cuestionarioEntrevista.auditoria.dictamenReclutador)
    setEditandoNotas(true)
  }

  const guardarNotas = () => {
    if (!expedienteActivo) return
    actualizarNotasConfidenciales(expedienteActivo.id, notasTemp, dictamenTemp)
    setEditandoNotas(false)
    mostrarToast('Dictamen confidencial actualizado correctamente en el expediente.')
  }

  // Módulos únicos para filtro
  const modulosDisponibles = Array.from(
    new Set(expedientes.map((e) => e.abordaje.moduloAbordaje))
  )

  return (
    <div className="h-full flex-1 flex flex-col bg-[#EDF2F7] overflow-hidden">
      {/* Toast Notificación */}
      {toastMensaje && (
        <div className="fixed top-14 right-6 z-50 bg-[#0A162B] text-white border-2 border-[#D4AF37] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
          {toastMensaje}
        </div>
      )}

      {/* Barra de Subtítulo / Acciones Rápidas */}
      <div className="bg-[#0A162B] text-white px-5 py-2.5 border-b-2 border-[#D4AF37] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-[#D4AF37] px-2 py-0.5 rounded">
            Archivo Confidencial
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {expedientesFiltrados.length} Expedientes Listados
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalEntrevistaAbierto(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#D4AF37] text-[#0A162B] hover:bg-amber-400 transition flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Nueva Entrevista
          </button>
          <button
            onClick={reiniciarDemoDossiers}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Restablecer expedientes demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Disposición Dividida (Split Screen) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ========================================================================= */}
        {/* PANEL IZQUIERDO: ARCHIVADOR DE CARPETAS CLASIFICADAS                      */}
        {/* ========================================================================= */}
        <div className="w-full md:w-[380px] lg:w-[420px] bg-slate-100 border-r-2 border-slate-300 flex flex-col overflow-hidden flex-shrink-0">
          {/* Buscador de Inteligencia */}
          <div className="p-3.5 bg-white border-b border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por Folio, Nombre, CURP..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#0A162B]"
              />
            </div>

            {/* Selector de Módulo */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-slate-600 text-[11px] whitespace-nowrap">
                Módulo:
              </span>
              <select
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="todos">Todos los puntos de abordaje</option>
                {modulosDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Pestañas de Estado (Cejillas estilo archivero) */}
            <div className="flex flex-wrap items-center gap-1 pb-1 text-[11px] font-bold">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'aprobado_servicio', label: 'Aptos' },
                { id: 'en_reserva', label: 'Reserva' },
                { id: 'vetado_alerta', label: 'Banderas Rojas' },
                { id: 'asignado_planta', label: 'En Planta' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFiltroEstatus(tab.id as 'todos' | EstatusExpediente)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    filtroEstatus === tab.id
                      ? 'bg-[#0A162B] text-[#D4AF37] font-black'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Carpetas / Folders */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {expedientesFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <FolderArchive className="w-10 h-10 mx-auto text-slate-400" />
                <p className="text-xs font-bold">No se encontraron expedientes con los criterios indicados.</p>
              </div>
            ) : (
              expedientesFiltrados.map((exp) => {
                const seleccionado = expedienteActivo?.id === exp.id
                const tieneBanderas = exp.cuestionarioEntrevista.auditoria.banderasRojas.length > 0
                return (
                  <div
                    key={exp.id}
                    onClick={() => {
                      setExpedienteSeleccionadoId(exp.id)
                      setEditandoNotas(false)
                    }}
                    className={`cursor-pointer rounded-2xl transition border-2 text-left relative overflow-hidden group ${
                      seleccionado
                        ? 'bg-white border-[#0A162B] shadow-xl ring-2 ring-[#D4AF37]/50'
                        : 'bg-[#FDFBF7] border-slate-300 hover:border-slate-400 hover:shadow-md'
                    }`}
                  >
                    {/* Cejilla de Folder Superior (Manila Tab) */}
                    <div
                      className={`px-3 py-1 text-[10px] font-black tracking-wider uppercase flex items-center justify-between border-b ${
                        seleccionado
                          ? 'bg-[#0A162B] text-[#D4AF37]'
                          : 'bg-[#EFE9DD] text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="font-mono">{exp.folio}</span>
                      <span className="text-[9px] font-semibold">{exp.fechaCreacion}</span>
                    </div>

                    <div className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-black text-[#0A162B] leading-snug">
                            {exp.abordaje.nombre} {exp.abordaje.apellidoPaterno}{' '}
                            {exp.abordaje.apellidoMaterno}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                            {exp.abordaje.puestoInteres}
                          </p>
                        </div>

                        {/* Sello de Estatus */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight flex-shrink-0 border ${
                            exp.estatus === 'aprobado_servicio'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : exp.estatus === 'asignado_planta'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : exp.estatus === 'en_reserva'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          {exp.estatus === 'aprobado_servicio' && '✓ Apto'}
                          {exp.estatus === 'asignado_planta' && 'En Planta'}
                          {exp.estatus === 'en_reserva' && 'En Reserva'}
                          {exp.estatus === 'vetado_alerta' && '⚠️ Vetado'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold pt-1 border-t border-slate-200">
                        <span className="truncate max-w-[190px]">📍 {exp.abordaje.moduloAbordaje}</span>
                        <span>🎂 {exp.abordaje.edad} años</span>
                      </div>

                      {/* Alerta si tiene banderas de seguridad */}
                      {tieneBanderas && (
                        <div className="bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-900 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                          <span>
                            {exp.cuestionarioEntrevista.auditoria.banderasRojas.length} observación(es) de
                            integridad
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL DERECHO: VISOR DETALLADO DEL DOSSIER / EXPEDIENTE                   */}
        {/* ========================================================================= */}
        <div className="flex-1 bg-white overflow-y-auto flex flex-col">
          {expedienteActivo ? (
            <div className="flex-1 flex flex-col">
              {/* Carátula Superior del Expediente Clasificado */}
              <div className="bg-[#0A162B] text-white p-5 sm:p-7 border-b-4 border-[#D4AF37] relative overflow-hidden">
                <div className="absolute right-6 top-6 opacity-10 pointer-events-none select-none text-8xl font-black">
                  CEPS
                </div>

                <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-black shadow-xl">
                      👮
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#D4AF37] text-[#0A162B] font-mono font-black text-xs px-2.5 py-0.5 rounded shadow">
                          {expedienteActivo.folio}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                          Expediente de Personal Operativo
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {expedienteActivo.abordaje.nombre} {expedienteActivo.abordaje.apellidoPaterno}{' '}
                        {expedienteActivo.abordaje.apellidoMaterno}
                      </h2>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-300 mt-1 font-medium">
                        <span>📱 {expedienteActivo.abordaje.telefono}</span>
                        <span>&bull;</span>
                        <span>🎂 {expedienteActivo.abordaje.edad} años</span>
                        <span>&bull;</span>
                        <span>🎓 {expedienteActivo.abordaje.escolaridad}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sello de Estado Oficial */}
                  <div className="text-right">
                    <span
                      className={`inline-block px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 shadow-lg ${
                        expedienteActivo.estatus === 'aprobado_servicio'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                          : expedienteActivo.estatus === 'asignado_planta'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                          : expedienteActivo.estatus === 'en_reserva'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                          : 'bg-rose-500/20 text-rose-300 border-rose-400'
                      }`}
                    >
                      {expedienteActivo.estatus === 'aprobado_servicio' && '✓ Aprobado para Servicio'}
                      {expedienteActivo.estatus === 'asignado_planta' && 'Desplegado en Planta'}
                      {expedienteActivo.estatus === 'en_reserva' && 'En Reserva Operativa'}
                      {expedienteActivo.estatus === 'vetado_alerta' && '⚠️ No Apto / Alerta Patrimonial'}
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      Módulo: {expedienteActivo.abordaje.moduloAbordaje}
                    </p>
                  </div>
                </div>

                {/* Sub-navegación por Pestañas del Dossier */}
                <div className="flex flex-wrap items-center gap-2 mt-5 border-t border-slate-700/80 pt-3">
                  {[
                    { id: 'caratula', label: 'Carátula & Identidad', icon: User },
                    { id: 'razonamiento', label: 'Examen Razonamiento (VER5)', icon: Brain },
                    { id: 'entrevista', label: 'Cuestionario RH & Integridad', icon: ShieldCheck },
                    { id: 'solicitud', label: 'Solicitud Digital', icon: FileText },
                    { id: 'papeleria', label: 'Checklist Papelería', icon: FileSpreadsheet },
                    { id: 'bitacora', label: 'Bitácora de Eventos', icon: Clock },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const activo = pestañaExpediente === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setPestañaExpediente(tab.id as typeof pestañaExpediente)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          activo
                            ? 'bg-[#D4AF37] text-[#0A162B] font-black shadow-md'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Cuerpo del Visor de Expediente */}
              <div className="p-5 sm:p-7 flex-1 space-y-6">
                {/* ------------------------------------------------------------- */}
                {/* PESTAÑA 1: CARÁTULA E IDENTIDAD                               */}
                {/* ------------------------------------------------------------- */}
                {pestañaExpediente === 'caratula' && (
                  <div className="space-y-6">
                    {/* Alerta de Vacante Asignada si aplica */}
                    {expedienteActivo.vacanteAsignada ? (
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 flex items-start gap-4">
                        <Building2 className="w-7 h-7 text-blue-700 flex-shrink-0 mt-1" />
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-200 px-2 py-0.5 rounded">
                            Despliegue Operativo Vigente
                          </span>
                          <h4 className="text-base font-extrabold text-blue-950 mt-1">
                            {expedienteActivo.vacanteAsignada.empresa} &bull;{' '}
                            {expedienteActivo.vacanteAsignada.planta}
                          </h4>
                          <p className="text-xs text-blue-800 font-semibold mt-0.5">
                            Puesto: {expedienteActivo.vacanteAsignada.puesto} &bull; Turno:{' '}
                            {expedienteActivo.vacanteAsignada.turno} (Asignado el{' '}
                            {expedienteActivo.vacanteAsignada.fechaAsignacion})
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-xs text-slate-700 flex items-center justify-between">
                        <span>
                          Estado en Banco de Talento: <strong>Disponible para asignación en vacante</strong>.
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-bold">
                          Sin Vacante Asignada
                        </span>
                      </div>
                    )}

                    {/* Ficha de Identidad Táctica */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
                      <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block border-b pb-2">
                        Ficha General del Guardia
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 font-bold block">Puesto Postulado:</span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {expedienteActivo.abordaje.puestoInteres}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block">Teléfono de Contacto:</span>
                          <span className="font-extrabold text-slate-900 font-mono text-sm">
                            {expedienteActivo.abordaje.telefono}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block">Módulo de Captura:</span>
                          <span className="font-extrabold text-slate-900">
                            {expedienteActivo.abordaje.moduloAbordaje}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-slate-500 font-bold block">CURP Oficial:</span>
                          <span className="font-extrabold font-mono text-slate-900">
                            {expedienteActivo.solicitudEmpleo.curp || 'No registrada'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block">RFC SAT:</span>
                          <span className="font-extrabold font-mono text-slate-900">
                            {expedienteActivo.solicitudEmpleo.rfc || 'No registrado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block">NSS IMSS:</span>
                          <span className="font-extrabold font-mono text-slate-900">
                            {expedienteActivo.solicitudEmpleo.nss || 'No registrado'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-slate-500 font-bold block">Domicilio en Juárez:</span>
                          <span className="font-extrabold text-slate-900">
                            {expedienteActivo.solicitudEmpleo.calleNumero},{' '}
                            {expedienteActivo.solicitudEmpleo.colonia}, C.P.{' '}
                            {expedienteActivo.solicitudEmpleo.codigoPostal}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block">Tiempo en la Ciudad:</span>
                          <span className="font-extrabold text-slate-900">
                            {expedienteActivo.solicitudEmpleo.tiempoEnJuarez}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* PESTAÑA 2: EXAMEN DE RAZONAMIENTO VER5                        */}
                {/* ------------------------------------------------------------- */}
                {pestañaExpediente === 'razonamiento' && (
                  <div className="space-y-6">
                    <div className="bg-slate-100 p-5 rounded-2xl border-2 border-slate-300 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                          Resultado Examen de Razonamiento (VER5)
                        </span>
                        <h3 className="text-lg font-black text-[#0A162B] mt-0.5">
                          {expedienteActivo.examenRazonamiento.evaluacion.aprobado
                            ? 'Aprobado Satisfactoriamente'
                            : 'Excedió el Límite de Errores Operativo'}
                        </h3>
                        <p className="text-xs text-slate-700 font-medium mt-1">
                          {expedienteActivo.examenRazonamiento.evaluacion.observaciones}
                        </p>
                      </div>

                      <div className="text-center bg-white px-5 py-3 rounded-2xl border-2 border-slate-300 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">
                          Total Errores
                        </span>
                        <span
                          className={`text-2xl font-black ${
                            expedienteActivo.examenRazonamiento.evaluacion.aprobado
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {expedienteActivo.examenRazonamiento.evaluacion.totalErrores} / 8
                        </span>
                      </div>
                    </div>

                    {/* Desglose de Respuestas Registradas */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4 text-xs">
                      <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block border-b pb-2">
                        1. Comprensión Lectora (La Mochila de Ana en el Parque)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                        <p>
                          <strong>¿Dónde la encontró?:</strong>{' '}
                          {expedienteActivo.examenRazonamiento.respuestas.dondeEncontroMochila}
                        </p>
                        <p>
                          <strong>¿Qué había dentro?:</strong>{' '}
                          {expedienteActivo.examenRazonamiento.respuestas.queHabiaEnMochila}
                        </p>
                        <p className="sm:col-span-2">
                          <strong>¿Qué decía la nota?:</strong>{' '}
                          {expedienteActivo.examenRazonamiento.respuestas.queDeciaNota}
                        </p>
                        <p>
                          <strong>Sentimiento de Ana:</strong>{' '}
                          {expedienteActivo.examenRazonamiento.respuestas.comoSeSentioAna}
                        </p>
                      </div>

                      <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block border-b pt-3 pb-2">
                        2. Lógica y Preguntas Capciosas
                      </span>
                      <div className="space-y-2 font-medium">
                        <p>
                          <strong>• Palabra "auto" (A y F):</strong>{' '}
                          {expedienteActivo.examenRazonamiento.respuestas.palabraAuto}
                        </p>
                        <p>
                          <strong>• Pastor y 20 ovejas:</strong>{' '}
                          {expedienteActivo.examenRazonamiento.respuestas.pastorOvejas}
                        </p>
                        <p>
                          <strong>• Entierro de sobrevivientes:</strong>{' '}
                          {expedienteActivo.examenRazonamiento.respuestas.trenSobrevivientes}
                        </p>
                        <p>
                          <strong>• Huevo del gallo en granero:</strong>{' '}
                          {expedienteActivo.examenRazonamiento.respuestas.huevoGallo}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* PESTAÑA 3: CUESTIONARIO RH & AUDITORÍA DE INTEGRIDAD          */}
                {/* ------------------------------------------------------------- */}
                {pestañaExpediente === 'entrevista' && (
                  <div className="space-y-6">
                    {/* Tarjeta Confidencial de Auditoría de Integridad */}
                    <div className="bg-[#060E1C] text-white p-6 rounded-2xl border-4 border-[#D4AF37] shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-[#D4AF37]" />
                          <span className="font-mono font-black text-sm text-[#D4AF37] tracking-wider uppercase">
                            Evaluación Confidencial de Integridad (Uso Interno RH)
                          </span>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          {expedienteActivo.cuestionarioEntrevista.auditoria.fechaEvaluacion}
                        </span>
                      </div>

                      {/* Semáforos de Riesgo */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div
                          className={`p-3 rounded-xl border ${
                            expedienteActivo.cuestionarioEntrevista.auditoria.riesgoRobo === 'bajo_confiable'
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                              : 'bg-rose-950/60 border-rose-500 text-rose-300'
                          }`}
                        >
                          <span className="text-[10px] font-bold block uppercase">
                            Integridad ante Robo (P5)
                          </span>
                          <span className="text-sm font-black">
                            {expedienteActivo.cuestionarioEntrevista.auditoria.riesgoRobo ===
                            'bajo_confiable'
                              ? '✓ Confiable (Reporta)'
                              : '⚠️ ALTO RIESGO PATRIMONIAL'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl border bg-slate-900 border-slate-700 text-slate-200">
                          <span className="text-[10px] font-bold block uppercase text-slate-400">
                            Cadena de Mando CEPS (P4)
                          </span>
                          <span className="text-sm font-black">
                            {expedienteActivo.cuestionarioEntrevista.auditoria.apegoCadenaMando ===
                            'optimo'
                              ? '✓ Apego Jerárquico'
                              : 'Observación en Desvío'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl border bg-slate-900 border-slate-700 text-slate-200">
                          <span className="text-[10px] font-bold block uppercase text-slate-400">
                            Nivel de Tolerancia (P10)
                          </span>
                          <span className="text-sm font-black text-[#D4AF37]">
                            {expedienteActivo.cuestionarioEntrevista.respuestas.p10_nivelTolerancia} / 10 (
                            {expedienteActivo.cuestionarioEntrevista.auditoria.calificacionTolerancia})
                          </span>
                        </div>
                      </div>

                      {/* Banderas Rojas Detectadas */}
                      {expedienteActivo.cuestionarioEntrevista.auditoria.banderasRojas.length > 0 && (
                        <div className="bg-rose-950/50 border border-rose-600/80 p-3.5 rounded-xl space-y-1.5">
                          <span className="text-xs font-black text-rose-300 uppercase tracking-wider block flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            Banderas Rojas Detectadas en el Abordaje:
                          </span>
                          <ul className="text-xs text-rose-200 space-y-1 list-disc pl-5 font-semibold">
                            {expedienteActivo.cuestionarioEntrevista.auditoria.banderasRojas.map(
                              (b, idx) => (
                                <li key={idx}>{b}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Dictamen y Notas Confidenciales */}
                      <div className="pt-2 border-t border-slate-800">
                        {editandoNotas ? (
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-300 block">
                              Modificar Dictamen y Notas Reservadas:
                            </label>
                            <div className="flex gap-2">
                              {[
                                { id: 'apto', label: 'APTO' },
                                { id: 'reserva', label: 'EN RESERVA' },
                                { id: 'no_apto', label: 'NO APTO / VETADO' },
                              ].map((d) => (
                                <button
                                  key={d.id}
                                  onClick={() => setDictamenTemp(d.id as typeof dictamenTemp)}
                                  className={`px-3 py-1 rounded-lg text-xs font-black border transition ${
                                    dictamenTemp === d.id
                                      ? 'bg-[#D4AF37] text-[#0A162B] border-[#D4AF37]'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {d.label}
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows={3}
                              value={notasTemp}
                              onChange={(e) => setNotasTemp(e.target.value)}
                              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditandoNotas(false)}
                                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={guardarNotas}
                                className="px-4 py-1.5 rounded-lg text-xs font-black bg-[#D4AF37] text-[#0A162B] hover:bg-amber-400"
                              >
                                Guardar Dictamen
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 block">
                                Notas Confidenciales del Evaluador:
                              </span>
                              <p className="text-xs text-slate-200 font-medium italic mt-0.5">
                                "{expedienteActivo.cuestionarioEntrevista.auditoria.notasConfidenciales}"
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">
                                Evaluado por: {expedienteActivo.cuestionarioEntrevista.auditoria.evaluadoPor}
                              </p>
                            </div>
                            <button
                              onClick={iniciarEdicionNotas}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-[#D4AF37] hover:bg-slate-700 transition flex-shrink-0"
                            >
                              Editar Notas
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desglose de las 10 Preguntas */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 space-y-4 text-xs">
                      <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block border-b pb-2">
                        Desglose de Preguntas del Cuestionario de Entrevista
                      </span>

                      <div className="space-y-3 font-medium">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="font-extrabold text-slate-900 block mb-0.5">
                            1. Valores que representan al candidato:
                          </span>
                          <p className="text-slate-800">
                            {expedienteActivo.cuestionarioEntrevista.respuestas.p1_valores}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-extrabold text-slate-900 block mb-0.5">
                              2. ¿Experiencia en seguridad?:
                            </span>
                            <p className="text-slate-800 uppercase font-black">
                              {expedienteActivo.cuestionarioEntrevista.respuestas.p2_experienciaSeguridad}
                            </p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-extrabold text-slate-900 block mb-0.5">
                              3. Funciones que realiza un guardia:
                            </span>
                            <p className="text-slate-800">
                              {expedienteActivo.cuestionarioEntrevista.respuestas.p3_funcionesGuardia}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-extrabold text-slate-900 block mb-0.5">
                              4. ¿A quién acude ante incidente?:
                            </span>
                            <p className="text-slate-800 font-bold">
                              {expedienteActivo.cuestionarioEntrevista.respuestas.p4_reporteIncidente ===
                              'jefe_grupo_ceps'
                                ? 'Jefe de Grupo (CEPS)'
                                : expedienteActivo.cuestionarioEntrevista.respuestas.p4_reporteIncidente ===
                                  'supervisor_ceps'
                                ? 'Supervisor (CEPS)'
                                : 'Seguridad Interna de Planta'}
                            </p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-extrabold text-slate-900 block mb-0.5">
                              5. Reacción ante robo de compañero:
                            </span>
                            <p
                              className={`font-bold ${
                                expedienteActivo.cuestionarioEntrevista.respuestas.p5_reaccionRobo ===
                                'reporto_jefe'
                                  ? 'text-emerald-700'
                                  : 'text-rose-700 font-black'
                              }`}
                            >
                              {expedienteActivo.cuestionarioEntrevista.respuestas.p5_reaccionRobo ===
                              'reporto_jefe'
                                ? 'Lo reporto con mi jefe inmediato'
                                : expedienteActivo.cuestionarioEntrevista.respuestas.p5_reaccionRobo ===
                                  'ayudo'
                                ? 'Le ayudo'
                                : 'No digo nada'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="font-extrabold text-slate-900 block mb-0.5">
                            6. Interés en CEPS y Motivo de Renuncia Previa:
                          </span>
                          <p className="text-slate-800">
                            Interés: {expedienteActivo.cuestionarioEntrevista.respuestas.p6_motivoInteres} (
                            {expedienteActivo.cuestionarioEntrevista.respuestas.p6_motivoInteresDetalle}).
                            Motivo salida: {expedienteActivo.cuestionarioEntrevista.respuestas.p7_motivoRenuncia}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* PESTAÑA 4: SOLICITUD DE EMPLEO DIGITAL                        */}
                {/* ------------------------------------------------------------- */}
                {pestañaExpediente === 'solicitud' && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 space-y-4 text-xs">
                    <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block border-b pb-2">
                      Datos de la Solicitud de Empleo Digital (Capturada en Campo)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-slate-500 font-bold block">CURP:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {expedienteActivo.solicitudEmpleo.curp || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">RFC SAT:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {expedienteActivo.solicitudEmpleo.rfc || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">NSS IMSS:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {expedienteActivo.solicitudEmpleo.nss || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-500 font-bold block">Último Empleo:</span>
                        <span className="font-bold text-slate-900">
                          {expedienteActivo.solicitudEmpleo.ultimoEmpleoEmpresa} &bull;{' '}
                          {expedienteActivo.solicitudEmpleo.ultimoEmpleoPuesto} (
                          {expedienteActivo.solicitudEmpleo.ultimoEmpleoSueldo})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Referencia Familiar Juárez:</span>
                        <span className="font-bold text-slate-900">
                          {expedienteActivo.solicitudEmpleo.nombreFamiliarReferencia} (
                          {expedienteActivo.solicitudEmpleo.telefonoFamiliarReferencia})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* PESTAÑA 5: CHECKLIST DE PAPELERÍA                             */}
                {/* ------------------------------------------------------------- */}
                {pestañaExpediente === 'papeleria' && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 space-y-4 text-xs">
                    <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block border-b pb-2">
                      Control de Papelería Original Recibida en Módulo
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-bold">
                      {[
                        { label: 'INE Original', ok: expedienteActivo.checklistPapeleria.ineOriginalPresentada },
                        { label: 'Acta Nacimiento', ok: expedienteActivo.checklistPapeleria.actaNacimientoPresentada },
                        { label: 'CURP', ok: expedienteActivo.checklistPapeleria.curpPresentada },
                        { label: 'RFC / SAT', ok: expedienteActivo.checklistPapeleria.rfcPresentada },
                        { label: 'NSS IMSS', ok: expedienteActivo.checklistPapeleria.nssPresentada },
                        { label: 'Comp. Domicilio', ok: expedienteActivo.checklistPapeleria.comprobanteDomicilioPresentado },
                        { label: 'Comp. Estudios', ok: expedienteActivo.checklistPapeleria.comprobanteEstudiosPresentado },
                        { label: 'Carta No Penales', ok: expedienteActivo.checklistPapeleria.cartaNoPenalesPresentada },
                      ].map((it, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border-2 flex items-center justify-between ${
                            it.ok
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-rose-50 border-rose-300 text-rose-950'
                          }`}
                        >
                          <span>{it.label}</span>
                          {it.ok ? (
                            <Check className="w-4 h-4 text-emerald-600 font-black" />
                          ) : (
                            <span className="text-[10px] bg-rose-200 px-1.5 py-0.5 rounded font-black text-rose-900">
                              FALTA
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* PESTAÑA 6: BITÁCORA DE EVENTOS (AUDIT TRAIL)                  */}
                {/* ------------------------------------------------------------- */}
                {pestañaExpediente === 'bitacora' && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 space-y-4 text-xs">
                    <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block border-b pb-2">
                      Historial Inmutable de Acciones del Expediente (Audit Trail)
                    </span>

                    <div className="space-y-3">
                      {expedienteActivo.historialEventos.map((ev, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <Clock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900">
                                {ev.descripcion}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-bold">
                                {ev.fecha}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Registrado por: {ev.autor}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <FolderArchive className="w-16 h-16 text-slate-300" />
              <p className="font-bold text-sm text-slate-600">
                Seleccione un expediente clasificado del archivador izquierdo para inspeccionar su dossier.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Wizard Táctil de Entrevista en Tablet */}
      {modalEntrevistaAbierto && (
        <FieldInterviewWizard
          isOpen={modalEntrevistaAbierto}
          onClose={() => setModalEntrevistaAbierto(false)}
          onSuccess={(nuevoFolio) => {
            mostrarToast(`Expediente creado exitosamente con Folio oficial ${nuevoFolio}.`)
          }}
        />
      )}
    </div>
  )
}
