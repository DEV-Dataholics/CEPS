import React, { useState } from 'react'
import {
  Shield,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Calendar,
  FileText,
  MoreVertical,
  Download,
  Eye,
  RefreshCw,
  FileCheck2,
  Activity,
  Award,
  Layers,
  Sparkles,
  X,
  Check,
  MapPin,
  Stethoscope,
} from 'lucide-react'

// Tipos de datos para la tabla demo
interface CandidatoDemo {
  id: string
  folio: string
  nombre: string
  telefono: string
  modulo: 'Independencia' | 'Monumento' | 'Oficina Central'
  reclutador: string
  puesto: string
  estatus: 'aprobado' | 'validacion' | 'citado' | 'reprobado' | 'medico_pendiente'
  documentosTotal: number
  documentosSubidos: number
  fechaCaptura: string
}

const CANDIDATOS_DEMO: CandidatoDemo[] = [
  {
    id: '1',
    folio: 'CEPS-2026-0412',
    nombre: 'Carlos Eduardo Ramírez Torres',
    telefono: '(656) 244-8819',
    modulo: 'Independencia',
    reclutador: 'Juan Antonio Ramos',
    puesto: 'Guardia Industrial 12x12',
    estatus: 'aprobado',
    documentosTotal: 10,
    documentosSubidos: 10,
    fechaCaptura: '07 Sep 2026, 09:30',
  },
  {
    id: '2',
    folio: 'CEPS-2026-0413',
    nombre: 'Valeria Montserrat Gómez Silva',
    telefono: '(656) 512-9034',
    modulo: 'Monumento',
    reclutador: 'Eunice Lira',
    puesto: 'Custodia Intramuros Maquila',
    estatus: 'validacion',
    documentosTotal: 10,
    documentosSubidos: 8,
    fechaCaptura: '07 Sep 2026, 10:15',
  },
  {
    id: '3',
    folio: 'CEPS-2026-0414',
    nombre: 'Roberto Hernández Luna',
    telefono: '(656) 388-1209',
    modulo: 'Independencia',
    reclutador: 'Juan Antonio Ramos',
    puesto: 'Vigilancia Comercial',
    estatus: 'medico_pendiente',
    documentosTotal: 10,
    documentosSubidos: 9,
    fechaCaptura: '07 Sep 2026, 10:45',
  },
  {
    id: '4',
    folio: 'CEPS-2026-0415',
    nombre: 'Miguel Ángel Domínguez Perea',
    telefono: '(656) 690-3341',
    modulo: 'Oficina Central',
    reclutador: 'Jaqueline Rentería',
    puesto: 'Supervisor de Turno',
    estatus: 'citado',
    documentosTotal: 10,
    documentosSubidos: 4,
    fechaCaptura: '07 Sep 2026, 11:00',
  },
  {
    id: '5',
    folio: 'CEPS-2026-0416',
    nombre: 'Jorge Luis Navarro Quintana',
    telefono: '(656) 177-4920',
    modulo: 'Independencia',
    reclutador: 'Juan Antonio Ramos',
    puesto: 'Guardia Fraccionamiento Residencial',
    estatus: 'reprobado',
    documentosTotal: 10,
    documentosSubidos: 6,
    fechaCaptura: '06 Sep 2026, 16:20',
  },
]

export const UiKitDemo: React.FC = () => {
  // Estados para probar interactividad
  const [tabActiva, setTabActiva] = useState<'todos' | 'botones' | 'tabla' | 'formularios' | 'estados' | 'flujo'>('todos')
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [showEmptyState, setShowEmptyState] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<CandidatoDemo | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [filtroModulo, setFiltroModulo] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState<string>('')
  const [pasoActivo, setPasoActivo] = useState<number>(2)

  const triggerToast = () => {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3500)
  }

  const candidatosFiltrados = CANDIDATOS_DEMO.filter((c) => {
    const coincideModulo = filtroModulo === 'todos' || c.modulo === filtroModulo
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.folio.toLowerCase().includes(busqueda.toLowerCase())
    return coincideModulo && coincideBusqueda
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      {/* Toast Flotante */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0F1E36] text-white px-4 py-3 rounded-lg shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-white">Acción realizada con éxito</p>
            <p className="text-slate-300">Expediente validado y sincronizado con Laragon.</p>
          </div>
          <button onClick={() => setToastVisible(false)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER INSTITUCIONAL CON FONDO AZUL PARA EL LOGO */}
      <header className="bg-[#0F1E36] text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Logo sobre fondo azul institucional como se especificó */}
            <div className="flex items-center gap-3 bg-[#0B1526] px-4 py-2 rounded-lg border border-slate-700/60 shadow-inner">
              <img
                src="/ceps-logo.png"
                alt="CEPS Paso del Norte - Seguridad Privada"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#D4AF37] text-[#0F1E36] tracking-wider uppercase">
                  Design System
                </span>
                <span className="text-xs text-slate-400">&bull; CEPS UI Kit v1.0</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Guía Visual &amp; Catálogo de Componentes
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerToast}
              className="px-3.5 py-1.5 rounded text-xs font-semibold bg-[#D4AF37] text-[#0F1E36] hover:bg-[#C29E2E] transition shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Probar Toast
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-200">Tokens Oficiales Activos</span>
            </div>
          </div>
        </div>

        {/* Barra de Navegación por Secciones del UI Kit */}
        <nav className="max-w-7xl mx-auto px-6 flex gap-2 border-t border-slate-800/80 overflow-x-auto py-1 text-xs">
          {[
            { id: 'todos', label: 'Todos los Componentes' },
            { id: 'botones', label: 'Botones & Controles' },
            { id: 'tabla', label: 'Tabla de Alta Densidad' },
            { id: 'formularios', label: 'Inputs & Filtros' },
            { id: 'estados', label: 'Ciclo de Vida & Feedback' },
            { id: 'flujo', label: 'Stepper Operativo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id as any)}
              className={`px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
                tabActiva === tab.id
                  ? 'bg-slate-800 text-[#D4AF37] border-b-2 border-[#D4AF37]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL DE LA GUÍA */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-10">
        {/* PRESENTACIÓN DE LA IDENTIDAD DE MARCA */}
        <section className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-base font-bold text-[#0F1E36] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
                1. Identidad de Marca y Tokens de Color (CEPS Paso del Norte)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Colores institucionales rigurosos para seguridad privada, vigilancia y custodia. Cumplen WCAG AA (contraste 4.5:1).
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              Tipografía: <span className="font-semibold text-slate-800">Inter / System Sans</span> &bull; Números: <span className="font-mono font-bold text-slate-800">tabular-nums</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
            <div className="flex flex-col gap-1.5">
              <div className="h-16 rounded-lg bg-[#0F1E36] border border-slate-700 shadow-sm flex items-end p-2 text-white font-mono text-[10px]">
                #0F1E36
              </div>
              <p className="text-xs font-semibold text-slate-800">Navy Institucional</p>
              <p className="text-[11px] text-slate-500">Encabezados, barras, textos principales.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="h-16 rounded-lg bg-[#D4AF37] border border-amber-400 shadow-sm flex items-end p-2 text-[#0F1E36] font-mono text-[10px] font-bold">
                #D4AF37
              </div>
              <p className="text-xs font-semibold text-slate-800">Oro de Custodia</p>
              <p className="text-[11px] text-slate-500">Estrellas, botones clave, insignias.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="h-16 rounded-lg bg-[#1E293B] border border-slate-700 shadow-sm flex items-end p-2 text-white font-mono text-[10px]">
                #1E293B
              </div>
              <p className="text-xs font-semibold text-slate-800">Slate Oscuro</p>
              <p className="text-[11px] text-slate-500">Superficies contrastadas, modales.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="h-16 rounded-lg bg-[#F8FAFC] border border-slate-300 shadow-sm flex items-end p-2 text-slate-700 font-mono text-[10px]">
                #F8FAFC
              </div>
              <p className="text-xs font-semibold text-slate-800">Fondo General</p>
              <p className="text-[11px] text-slate-500">Descanso visual sin deslumbramiento.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="h-16 rounded-lg bg-[#10B981] border border-emerald-600 shadow-sm flex items-end p-2 text-white font-mono text-[10px]">
                #10B981
              </div>
              <p className="text-xs font-semibold text-emerald-800">Aprobado / Éxito</p>
              <p className="text-[11px] text-slate-500">Expediente validado, contratado.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="h-16 rounded-lg bg-[#F59E0B] border border-amber-500 shadow-sm flex items-end p-2 text-white font-mono text-[10px]">
                #F59E0B
              </div>
              <p className="text-xs font-semibold text-amber-800">Alerta / Citado</p>
              <p className="text-[11px] text-slate-500">Pendiente, revisión requerida.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="h-16 rounded-lg bg-[#EF4444] border border-red-600 shadow-sm flex items-end p-2 text-white font-mono text-[10px]">
                #EF4444
              </div>
              <p className="text-xs font-semibold text-red-800">Peligro / Rechazo</p>
              <p className="text-[11px] text-slate-500">Examen o antidoping reprobado.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="h-16 rounded-lg bg-[#3B82F6] border border-blue-600 shadow-sm flex items-end p-2 text-white font-mono text-[10px]">
                #3B82F6
              </div>
              <p className="text-xs font-semibold text-blue-800">En Proceso / Info</p>
              <p className="text-[11px] text-slate-500">Captura en campo, citas activas.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: BOTONES Y CONTROLES INTERACTIVOS */}
        {(tabActiva === 'todos' || tabActiva === 'botones') && (
          <section className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-[#0F1E36] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                2. Botones &amp; Variantes de Acción
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Jerarquía clara: un solo botón primario por vista, acciones destructivas destacadas y soporte nativo de estados de carga.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {/* Botón Primario Institucional */}
              <button className="px-4 py-2 bg-[#0F1E36] text-white hover:bg-[#1A3258] rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-2 focus:ring-2 focus:ring-slate-400">
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                Nuevo Candidato
              </button>

              {/* Botón Acento Dorado */}
              <button className="px-4 py-2 bg-[#D4AF37] text-[#0F1E36] hover:bg-[#C29E2E] rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-2 focus:ring-2 focus:ring-amber-300">
                <CheckCircle2 className="w-4 h-4" />
                Aprobar Expediente
              </button>

              {/* Botón Secundario Outline */}
              <button className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition border border-slate-300 flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-500" />
                Descargar DC-3
              </button>

              {/* Botón Peligro / Declinado */}
              <button className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rechazar Candidato
              </button>

              {/* Botón Ghost */}
              <button className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-lg text-xs font-medium transition">
                Cancelar Operación
              </button>

              {/* Botón con Estado de Carga */}
              <button
                onClick={() => {
                  setLoadingDemo(true)
                  setTimeout(() => setLoadingDemo(false), 2000)
                }}
                disabled={loadingDemo}
                className="px-4 py-2 bg-[#0F1E36] text-white rounded-lg text-xs font-semibold transition disabled:opacity-60 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 text-[#D4AF37] ${loadingDemo ? 'animate-spin' : ''}`} />
                {loadingDemo ? 'Guardando en Laragon...' : 'Probar Loading State'}
              </button>

              {/* Botones de Icono */}
              <div className="flex items-center gap-1.5 pl-4 border-l border-slate-300">
                <button title="Ver Detalle" className="p-2 text-slate-600 hover:text-[#0F1E36] hover:bg-white rounded-lg border border-slate-200 transition">
                  <Eye className="w-4 h-4" />
                </button>
                <button title="Más Opciones" className="p-2 text-slate-600 hover:text-[#0F1E36] hover:bg-white rounded-lg border border-slate-200 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Badges e Indicadores de Estado */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Badges de Estado Operativo (Pills)
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Aprobado para Contratación
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  En Validación Documental
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Citado en Módulo Independencia
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                  Pendiente Examen Antidoping
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  Reprobado / No Apto
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                  Inactivo / Baja
                </span>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 3: STEPPER OPERATIVO (DE CAPTACIÓN A CONTRATACIÓN) */}
        {(tabActiva === 'todos' || tabActiva === 'flujo') && (
          <section className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#0F1E36] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#D4AF37]" />
                  3. Pipeline Operativo · Ruta del Candidato (Módulos de Campo a Contratación)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Basado en los 5 hitos descubiertos en las entrevistas de la Célula 0.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPasoActivo(Math.max(1, pasoActivo - 1))}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPasoActivo(Math.min(5, pasoActivo + 1))}
                  className="px-2.5 py-1 text-xs bg-[#0F1E36] text-white rounded hover:bg-slate-800"
                >
                  Siguiente
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-6">
              {[
                { paso: 1, titulo: '1. Módulo de Campo', desc: 'Abordaje, solicitud física, fotos preliminares en Independencia/Monumento.' },
                { paso: 2, titulo: '2. Mesa Validación', desc: 'Cotejo documental: RFC, cartas recomendación, antecedentes no penales.' },
                { paso: 3, titulo: '3. Examen Médico', desc: 'Antidoping 5 parámetros, dictamen médico y autorización de excepción.' },
                { paso: 4, titulo: '4. Paquete Contrato', desc: 'Firma contrato individual, asignación de servicio e inducción.' },
                { paso: 5, titulo: '5. Credencial y DC-3', desc: 'Emisión de gafete, registro oficial y entrega de plásticos bancarios.' },
              ].map((p) => {
                const esCompletado = p.paso < pasoActivo
                const esActual = p.paso === pasoActivo

                return (
                  <div
                    key={p.paso}
                    onClick={() => setPasoActivo(p.paso)}
                    className={`p-4 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                      esActual
                        ? 'border-[#0F1E36] bg-[#0F1E36]/5 shadow-sm ring-2 ring-[#0F1E36]/20'
                        : esCompletado
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-slate-200 bg-slate-50/50 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            esActual
                              ? 'bg-[#0F1E36] text-[#D4AF37]'
                              : esCompletado
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {esCompletado ? <Check className="w-3.5 h-3.5" /> : p.paso}
                        </span>
                        {esActual && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1E36] bg-[#D4AF37] px-2 py-0.5 rounded">
                            Fase Activa
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900">{p.titulo}</p>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{p.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* SECCIÓN 4: TABLA DE ALTA DENSIDAD OPERATIVA */}
        {(tabActiva === 'todos' || tabActiva === 'tabla') && (
          <section className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#0F1E36] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D4AF37]" />
                  4. Tabla Operativa de Alta Densidad (Listado de Candidatos en Campo)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Diseño compacto (`py-2.5`), números tabulares, avance de papelería y acciones rápidas sin pantallas en blanco.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`px-3 py-1.5 text-xs rounded border transition font-medium ${
                    showSkeleton ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  {showSkeleton ? 'Quitar Skeleton' : 'Simular Shimmer (Skeleton)'}
                </button>
                <button
                  onClick={() => setShowEmptyState(!showEmptyState)}
                  className={`px-3 py-1.5 text-xs rounded border transition font-medium ${
                    showEmptyState ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  {showEmptyState ? 'Restaurar Datos' : 'Simular Empty State'}
                </button>
              </div>
            </div>

            {/* BARRA DE FILTROS RÁPIDOS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o folio CEPS..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-2 focus:ring-[#0F1E36]/30 focus:border-[#0F1E36] outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded text-xs focus:ring-2 focus:ring-[#0F1E36]/30 outline-none"
                >
                  <option value="todos">Todos los Módulos de Campo</option>
                  <option value="Independencia">Módulo Independencia (S-Mart)</option>
                  <option value="Monumento">Módulo Monumento Benito Juárez</option>
                  <option value="Oficina Central">Oficina Central de Reclutamiento</option>
                </select>
              </div>

              <div className="flex items-center justify-end text-xs text-slate-500 font-medium">
                Registros: <span className="font-bold text-slate-800 ml-1">{candidatosFiltrados.length}</span> de {CANDIDATOS_DEMO.length}
              </div>
            </div>

            {/* TABLA O ESTADOS CONDICIONALES */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {showSkeleton ? (
                // SKELETON LOADING STATE (Regla expert-ux-ui)
                <div className="p-6 flex flex-col gap-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-slate-100 rounded flex items-center justify-between px-4">
                        <div className="w-1/6 h-3 bg-slate-200 rounded"></div>
                        <div className="w-1/4 h-3 bg-slate-200 rounded"></div>
                        <div className="w-1/6 h-3 bg-slate-200 rounded"></div>
                        <div className="w-1/6 h-3 bg-slate-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-2">Cargando expedientes desde MySQL Laragon...</p>
                </div>
              ) : showEmptyState || candidatosFiltrados.length === 0 ? (
                // EMPTY STATE ERGONÓMICO (Regla expert-ux-ui)
                <div className="py-14 text-center flex flex-col items-center justify-center p-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No hay candidatos pendientes en este filtro</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                    No se encontraron registros activos para el módulo o búsqueda especificada. Puedes cambiar el filtro o capturar un nuevo prospecto.
                  </p>
                  <button
                    onClick={() => {
                      setBusqueda('')
                      setFiltroModulo('todos')
                      setShowEmptyState(false)
                    }}
                    className="px-3.5 py-1.5 bg-[#0F1E36] text-white rounded text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                // TABLA DE ALTA DENSIDAD
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 w-8">
                        <input type="checkbox" className="rounded text-[#0F1E36] focus:ring-0 cursor-pointer" />
                      </th>
                      <th className="py-2.5 px-3">Folio CEPS</th>
                      <th className="py-2.5 px-3">Candidato / Contacto</th>
                      <th className="py-2.5 px-3">Módulo de Origen</th>
                      <th className="py-2.5 px-3">Reclutador Responsable</th>
                      <th className="py-2.5 px-3">Estatus</th>
                      <th className="py-2.5 px-3">Avance Papelería</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {candidatosFiltrados.map((c) => {
                      const porcentaje = (c.documentosSubidos / c.documentosTotal) * 100

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/90 transition-colors">
                          <td className="py-2.5 px-3">
                            <input type="checkbox" className="rounded text-[#0F1E36] focus:ring-0 cursor-pointer" />
                          </td>

                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 tabular-nums">
                            {c.folio}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{c.nombre}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="font-mono tabular-nums">{c.telefono}</span> &bull; {c.puesto}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {c.modulo}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-[#0F1E36] text-[#D4AF37] font-bold text-[10px] flex items-center justify-center">
                                {c.reclutador.charAt(0)}
                              </div>
                              <span className="text-[11px]">{c.reclutador}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            {c.estatus === 'aprobado' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprobado
                              </span>
                            )}
                            {c.estatus === 'validacion' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <Clock className="w-3 h-3 text-blue-600" /> En Validación
                              </span>
                            )}
                            {c.estatus === 'citado' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Calendar className="w-3 h-3 text-amber-600" /> Citado
                              </span>
                            )}
                            {c.estatus === 'medico_pendiente' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                <Stethoscope className="w-3 h-3 text-purple-600" /> Antidoping Pend.
                              </span>
                            )}
                            {c.estatus === 'reprobado' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                <XCircle className="w-3 h-3 text-red-600" /> Reprobado
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    porcentaje === 100 ? 'bg-emerald-500' : porcentaje >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${porcentaje}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-[11px] text-slate-600 tabular-nums">
                                {c.documentosSubidos}/{c.documentosTotal}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setCandidatoSeleccionado(c)
                                  setModalAbierto(true)
                                }}
                                className="px-2 py-1 bg-white text-slate-700 hover:text-[#0F1E36] hover:bg-slate-100 rounded border border-slate-200 text-[11px] font-medium"
                              >
                                Ver Expediente
                              </button>
                              <button className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* PIE DE TABLA / PAGINACIÓN */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Mostrando {candidatosFiltrados.length} registros</span>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40" disabled>
                  Anterior
                </button>
                <button className="px-2.5 py-1 border border-[#0F1E36] bg-[#0F1E36] text-[#D4AF37] font-bold rounded">
                  1
                </button>
                <button className="px-2.5 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 text-slate-600">
                  2
                </button>
                <button className="px-2.5 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 text-slate-600">
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 5: FORMULARIOS Y ERGONOMÍA DE CAPTURA */}
        {(tabActiva === 'todos' || tabActiva === 'formularios') && (
          <section className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-[#0F1E36] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                5. Formulario y Ergonomía de Captura Rápida (Módulo Independencia / Monumento)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Campos con labels flotantes/visibles, anillos de foco en contraste y ayuda en vivo para agilizar el registro en campo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Nombre Completo del Candidato *</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez López"
                  defaultValue="Francisco Javier Morales"
                  className="px-3 py-2 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-[#0F1E36]/40 focus:border-[#0F1E36] outline-none"
                />
                <span className="text-[10px] text-slate-500">Debe coincidir con la identificación oficial (INE).</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Teléfono Móvil (WhatsApp) *</label>
                <input
                  type="text"
                  placeholder="(656) 000-0000"
                  defaultValue="(656) 819-2044"
                  className="px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-2 focus:ring-[#0F1E36]/40 outline-none"
                />
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Formato válido para alertas automáticas
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Módulo de Captación *</label>
                <select className="px-3 py-2 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-[#0F1E36]/40 outline-none">
                  <option>Módulo S-Mart Independencia</option>
                  <option>Módulo Monumento Benito Juárez</option>
                  <option>Oficina Central</option>
                </select>
                <span className="text-[10px] text-slate-500">Determina el reclutador a cargo y la logística de transporte.</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL DEMO: PREVISUALIZADOR DE EXPEDIENTE */}
      {modalAbierto && candidatoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabecera del Modal */}
            <div className="bg-[#0F1E36] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#D4AF37] p-1.5 rounded text-[#0F1E36]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Expediente: {candidatoSeleccionado.folio}</h3>
                  <p className="text-xs text-slate-300">{candidatoSeleccionado.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Puesto Solicitado</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{candidatoSeleccionado.puesto}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Teléfono</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">{candidatoSeleccionado.telefono}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Módulo Origen</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{candidatoSeleccionado.modulo}</p>
                </div>
              </div>

              {/* Lista de Documentos Requeridos */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>Documentos Requeridos (Checklist RH-F-CEPS-017)</span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {candidatoSeleccionado.documentosSubidos} de {candidatoSeleccionado.documentosTotal} recibidos
                  </span>
                </h4>

                <div className="space-y-1.5">
                  {[
                    { nombre: 'Identificación Oficial (INE)', estado: 'validado' },
                    { nombre: 'Acta de Nacimiento', estado: 'validado' },
                    { nombre: 'Constancia de Situación Fiscal (RFC con QR)', estado: 'validado' },
                    { nombre: 'Comprobante de Domicilio Vigente', estado: 'validado' },
                    { nombre: 'Carta de No Antecedentes Penales (Fiscalía)', estado: 'pendiente' },
                    { nombre: 'Examen Antidoping (5 parámetros)', estado: 'validado' },
                    { nombre: 'Cartilla del Servicio Militar Liberada', estado: 'validado' },
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-slate-800 font-medium">{doc.nombre}</span>
                      {doc.estado === 'validado' ? (
                        <span className="text-emerald-700 flex items-center gap-1 text-[11px] font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Cotejado
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1 text-[11px] font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendiente
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-3.5 py-1.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setModalAbierto(false)
                  triggerToast()
                }}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-[#0F1E36] text-white hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                Confirmar Validación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
