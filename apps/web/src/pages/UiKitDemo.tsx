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
  ZoomIn,
  ZoomOut,
  ChevronDown,
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

  // Selector interactivo de densidad/escala para adaptarse a la pantalla del usuario
  const [escalaGrande, setEscalaGrande] = useState<boolean>(true)

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
    <div className={`min-h-screen bg-[#EDF2F7] text-slate-900 pb-24 font-sans ${escalaGrande ? 'text-base' : 'text-sm'}`}>
      {/* Toast Flotante de Alto Contraste */}
      {toastVisible && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-[#0A162B] text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-[#D4AF37] animate-in fade-in slide-in-from-bottom-5">
          <div className="p-2 bg-emerald-500 text-white rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-base text-white">Acción Realizada con Éxito</p>
            <p className="text-sm font-medium text-slate-300">Expediente validado y sincronizado con MySQL en Laragon.</p>
          </div>
          <button onClick={() => setToastVisible(false)} className="text-slate-400 hover:text-white p-1 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* HEADER INSTITUCIONAL: AZUL MARINO PROFUNDO CON LOGO EN ALTA VISIBILIDAD */}
      <header className="bg-[#0A162B] text-white border-b-2 border-slate-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            {/* Contenedor del Logo con fondo azul exclusivo para que las letras blancas resalten con máxima nitidez */}
            <div className="flex items-center gap-3 bg-[#060E1C] px-5 py-2.5 rounded-xl border-2 border-slate-700/80 shadow-md">
              <img
                src="/ceps-logo.png"
                alt="CEPS Paso del Norte - Seguridad Privada"
                className="h-12 w-auto object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-[#D4AF37] text-[#0A162B] tracking-wider uppercase shadow-sm">
                  Design System Oficial
                </span>
                <span className="text-xs font-semibold text-slate-300">&bull; CEPS UI Kit v1.1 (High Legibility)</span>
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight mt-1">
                Guía Visual &amp; Catálogo de Componentes Operativos
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Control Interactivo de Escala de Legibilidad */}
            <button
              onClick={() => setEscalaGrande(!escalaGrande)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition flex items-center gap-2 shadow-sm"
              title="Alternar tamaño de fuente y elementos"
            >
              {escalaGrande ? <ZoomOut className="w-4 h-4 text-[#D4AF37]" /> : <ZoomIn className="w-4 h-4 text-[#D4AF37]" />}
              <span>Escala: <strong>{escalaGrande ? 'Grande / Cómoda (16px)' : 'Estándar (14px)'}</strong></span>
            </button>

            <button
              onClick={triggerToast}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#D4AF37] text-[#0A162B] hover:bg-[#C59F2D] transition shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Probar Toast
            </button>
          </div>
        </div>

        {/* Barra de Navegación por Secciones con tipografía reforzada */}
        <nav className="max-w-7xl mx-auto px-6 flex gap-2 border-t border-slate-800 overflow-x-auto py-2 text-sm font-semibold">
          {[
            { id: 'todos', label: 'Todos los Componentes' },
            { id: 'botones', label: 'Botones & Acciones' },
            { id: 'tabla', label: 'Tabla Operativa' },
            { id: 'formularios', label: 'Inputs & Ergonomía' },
            { id: 'estados', label: 'Estados de Carga & Feedback' },
            { id: 'flujo', label: 'Ruta del Candidato' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all font-bold whitespace-nowrap ${
                tabActiva === tab.id
                  ? 'bg-slate-800 text-[#D4AF37] shadow-inner border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* PRESENTACIÓN DE IDENTIDAD Y CONTRASTES */}
        <section className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#0A162B] flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
                1. Tokens de Color Oficiales &amp; Contraste Reforzado (WCAG AAA)
              </h2>
              <p className="text-sm font-medium text-slate-700 mt-1">
                Fondo con tinte suave anti-deslumbramiento (<code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">#EDF2F7</code>) y tipografía con peso <strong>500 / 600 / 700</strong> para máxima nitidez en pantalla.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg border border-slate-300">
              Fuente: <span className="text-[#0A162B] font-extrabold">Plus Jakarta Sans</span> &bull; Números: <span className="font-mono font-extrabold text-[#0A162B]">JetBrains Mono (tabular-nums)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mt-6">
            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl bg-[#0A162B] border-2 border-slate-800 shadow-md flex items-end p-2.5 text-white font-mono text-xs font-bold">
                #0A162B
              </div>
              <p className="text-sm font-bold text-slate-900">Navy Institucional</p>
              <p className="text-xs font-medium text-slate-600">Encabezados y texto de alto contraste.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl bg-[#D4AF37] border-2 border-amber-400 shadow-md flex items-end p-2.5 text-[#0A162B] font-mono text-xs font-extrabold">
                #D4AF37
              </div>
              <p className="text-sm font-bold text-slate-900">Oro de Custodia</p>
              <p className="text-xs font-medium text-slate-600">Estrellas, botones clave, badges.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl bg-[#1E293B] border-2 border-slate-700 shadow-md flex items-end p-2.5 text-white font-mono text-xs font-bold">
                #1E293B
              </div>
              <p className="text-sm font-bold text-slate-900">Slate Oscuro</p>
              <p className="text-xs font-medium text-slate-600">Superficies contrastadas.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl bg-[#EDF2F7] border-2 border-slate-400 shadow-md flex items-end p-2.5 text-slate-800 font-mono text-xs font-bold">
                #EDF2F7
              </div>
              <p className="text-sm font-bold text-slate-900">Fondo Anti-Glé</p>
              <p className="text-xs font-medium text-slate-600">Elimina el blanco cegador.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl bg-[#059669] border-2 border-emerald-700 shadow-md flex items-end p-2.5 text-white font-mono text-xs font-bold">
                #059669
              </div>
              <p className="text-sm font-bold text-emerald-900">Aprobado / Éxito</p>
              <p className="text-xs font-medium text-slate-600">Expediente validado, contratado.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl bg-[#D97706] border-2 border-amber-600 shadow-md flex items-end p-2.5 text-white font-mono text-xs font-bold">
                #D97706
              </div>
              <p className="text-sm font-bold text-amber-900">Alerta / Citado</p>
              <p className="text-xs font-medium text-slate-600">En validación, pendientes.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl bg-[#DC2626] border-2 border-red-700 shadow-md flex items-end p-2.5 text-white font-mono text-xs font-bold">
                #DC2626
              </div>
              <p className="text-sm font-bold text-red-900">Peligro / Rechazo</p>
              <p className="text-xs font-medium text-slate-600">Examen o antidoping no apto.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl bg-[#2563EB] border-2 border-blue-700 shadow-md flex items-end p-2.5 text-white font-mono text-xs font-bold">
                #2563EB
              </div>
              <p className="text-sm font-bold text-blue-900">En Proceso / Info</p>
              <p className="text-xs font-medium text-slate-600">Módulos activos en campo.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: BOTONES Y CONTROLES ROBUSTOS */}
        {(tabActiva === 'todos' || tabActiva === 'botones') && (
          <section className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#0A162B] flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-[#D4AF37]" />
                2. Botones &amp; Controles de Acción (Tamaño Ergonómico)
              </h2>
              <p className="text-sm font-medium text-slate-700 mt-1">
                Botones con altura táctil cómoda (44px a 48px), tipografía gruesa (<code className="font-mono text-xs font-bold">font-bold</code>) y estados de pulsación nítidos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-5 bg-[#F8FAFC] rounded-xl border-2 border-slate-200">
              {/* Botón Primario Navy */}
              <button className="px-5 py-3 bg-[#0A162B] text-white hover:bg-[#162746] rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2.5 focus:ring-4 focus:ring-slate-300 active:scale-95">
                <Plus className="w-5 h-5 text-[#D4AF37]" />
                Nuevo Candidato
              </button>

              {/* Botón Acento Dorado */}
              <button className="px-5 py-3 bg-[#D4AF37] text-[#0A162B] hover:bg-[#C59F2D] rounded-xl text-sm font-extrabold transition shadow-md flex items-center gap-2.5 focus:ring-4 focus:ring-amber-200 active:scale-95">
                <CheckCircle2 className="w-5 h-5" />
                Aprobar Expediente
              </button>

              {/* Botón Secundario Outline */}
              <button className="px-5 py-3 bg-white text-slate-800 hover:bg-slate-100 rounded-xl text-sm font-bold transition border-2 border-slate-300 flex items-center gap-2.5 shadow-sm active:scale-95">
                <Download className="w-5 h-5 text-slate-600" />
                Descargar DC-3
              </button>

              {/* Botón Rechazar / Peligro */}
              <button className="px-5 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2.5 focus:ring-4 focus:ring-red-200 active:scale-95">
                <XCircle className="w-5 h-5" />
                Rechazar Candidato
              </button>

              {/* Botón Ghost */}
              <button className="px-5 py-3 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-bold transition">
                Cancelar Operación
              </button>

              {/* Botón con Estado de Carga */}
              <button
                onClick={() => {
                  setLoadingDemo(true)
                  setTimeout(() => setLoadingDemo(false), 2000)
                }}
                disabled={loadingDemo}
                className="px-5 py-3 bg-[#0A162B] text-white rounded-xl text-sm font-bold transition disabled:opacity-60 flex items-center gap-2.5 shadow-md"
              >
                <RefreshCw className={`w-5 h-5 text-[#D4AF37] ${loadingDemo ? 'animate-spin' : ''}`} />
                {loadingDemo ? 'Guardando en Laragon...' : 'Probar Loading State'}
              </button>

              {/* Botones de Icono */}
              <div className="flex items-center gap-2 pl-4 border-l-2 border-slate-300">
                <button title="Ver Detalle" className="p-3 text-slate-700 hover:text-[#0A162B] hover:bg-white rounded-xl border-2 border-slate-300 bg-white transition shadow-sm">
                  <Eye className="w-5 h-5" />
                </button>
                <button title="Más Opciones" className="p-3 text-slate-700 hover:text-[#0A162B] hover:bg-white rounded-xl border-2 border-slate-300 bg-white transition shadow-sm">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Badges de Estado con tipografía más grande y bordes sólidos */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                Badges de Estado (Pills con Borde y Letra Gruesa)
              </h3>
              <div className="flex flex-wrap items-center gap-3.5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-950 border-2 border-emerald-300 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Aprobado para Contratación
                </span>

                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-950 border-2 border-blue-300 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  En Validación Documental
                </span>

                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-950 border-2 border-amber-300 shadow-sm">
                  <Clock className="w-4 h-4 text-amber-700" />
                  Citado en Módulo Independencia
                </span>

                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-950 border-2 border-purple-300 shadow-sm">
                  <Stethoscope className="w-4 h-4 text-purple-700" />
                  Antidoping Pendiente
                </span>

                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-red-100 text-red-950 border-2 border-red-300 shadow-sm">
                  <XCircle className="w-4 h-4 text-red-700" />
                  Reprobado / No Apto
                </span>

                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-800 border-2 border-slate-300">
                  Inactivo / Baja
                </span>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 3: STEPPER DEL PIPELINE OPERATIVO */}
        {(tabActiva === 'todos' || tabActiva === 'flujo') && (
          <section className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A162B] flex items-center gap-2.5">
                  <Activity className="w-6 h-6 text-[#D4AF37]" />
                  3. Pipeline de Reclutamiento a Contratación (5 Fases)
                </h2>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  Flujo operativo continuo identificado en las entrevistas de la Célula 0.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPasoActivo(Math.max(1, pasoActivo - 1))}
                  className="px-3.5 py-1.5 text-xs font-bold border-2 border-slate-300 rounded-lg hover:bg-slate-100 text-slate-800"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPasoActivo(Math.min(5, pasoActivo + 1))}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#0A162B] text-white rounded-lg hover:bg-slate-800 shadow-sm"
                >
                  Siguiente
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-6">
              {[
                { paso: 1, titulo: '1. Módulo de Campo', desc: 'Abordaje, solicitud física y fotos en Independencia/Monumento.' },
                { paso: 2, titulo: '2. Mesa Validación', desc: 'Cotejo documental: RFC con QR, cartas de recomendación, antecedentes no penales.' },
                { paso: 3, titulo: '3. Examen Médico', desc: 'Antidoping 5 parámetros, dictamen médico y autorización de excepciones.' },
                { paso: 4, titulo: '4. Paquete Contrato', desc: 'Firma de contrato individual, asignación de puesto e inducción.' },
                { paso: 5, titulo: '5. Credencial y DC-3', desc: 'Emisión de gafete, registro oficial y entrega de plásticos bancarios.' },
              ].map((p) => {
                const esCompletado = p.paso < pasoActivo
                const esActual = p.paso === pasoActivo

                return (
                  <div
                    key={p.paso}
                    onClick={() => setPasoActivo(p.paso)}
                    className={`p-5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      esActual
                        ? 'border-[#0A162B] bg-[#0A162B]/5 shadow-md ring-2 ring-[#0A162B]/20'
                        : esCompletado
                        ? 'border-emerald-300 bg-emerald-50/70'
                        : 'border-slate-200 bg-slate-50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`w-8 h-8 rounded-xl text-sm font-extrabold flex items-center justify-center shadow-sm ${
                            esActual
                              ? 'bg-[#0A162B] text-[#D4AF37]'
                              : esCompletado
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 text-slate-800'
                          }`}
                        >
                          {esCompletado ? <Check className="w-5 h-5" /> : p.paso}
                        </span>
                        {esActual && (
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A162B] bg-[#D4AF37] px-2.5 py-1 rounded shadow-sm">
                            Fase Activa
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-slate-900">{p.titulo}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-1.5 leading-snug">{p.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* SECCIÓN 4: TABLA DE ALTA DENSIDAD CON TEXTO Y BORDES REFORZADOS */}
        {(tabActiva === 'todos' || tabActiva === 'tabla') && (
          <section className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A162B] flex items-center gap-2.5">
                  <FileText className="w-6 h-6 text-[#D4AF37]" />
                  4. Tabla Operativa de Candidatos (Alta Legibilidad)
                </h2>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  Filas cómodas (<code className="font-mono text-xs font-bold">py-3.5</code>), nombres destacados en <strong>negrita</strong>, folios en fuente monoespaciada y avance documental visible.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`px-3.5 py-2 text-xs rounded-lg border-2 transition font-bold ${
                    showSkeleton ? 'bg-amber-100 text-amber-950 border-amber-400' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  {showSkeleton ? 'Quitar Skeleton' : 'Simular Shimmer'}
                </button>
                <button
                  onClick={() => setShowEmptyState(!showEmptyState)}
                  className={`px-3.5 py-2 text-xs rounded-lg border-2 transition font-bold ${
                    showEmptyState ? 'bg-amber-100 text-amber-950 border-amber-400' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  {showEmptyState ? 'Restaurar Datos' : 'Simular Empty State'}
                </button>
              </div>
            </div>

            {/* FILTROS DE BÚSQUEDA ROBUSTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#F8FAFC] rounded-xl border-2 border-slate-200">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o folio CEPS..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 focus:border-[#0A162B] outline-none shadow-sm placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none shadow-sm"
                >
                  <option value="todos">Todos los Módulos de Campo</option>
                  <option value="Independencia">Módulo Independencia (S-Mart)</option>
                  <option value="Monumento">Módulo Monumento Benito Juárez</option>
                  <option value="Oficina Central">Oficina Central de Reclutamiento</option>
                </select>
              </div>

              <div className="flex items-center justify-end text-sm text-slate-700 font-semibold">
                Registros activos: <span className="font-extrabold text-[#0A162B] ml-1.5 text-base">{candidatosFiltrados.length}</span> de {CANDIDATOS_DEMO.length}
              </div>
            </div>

            {/* TABLA DE ALTA LEGIBILIDAD */}
            <div className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-sm">
              {showSkeleton ? (
                <div className="p-8 flex flex-col gap-4 animate-pulse bg-white">
                  <div className="h-5 bg-slate-300 rounded w-1/3"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 bg-slate-100 rounded-lg flex items-center justify-between px-4 border border-slate-200">
                        <div className="w-1/5 h-4 bg-slate-300 rounded"></div>
                        <div className="w-1/3 h-4 bg-slate-300 rounded"></div>
                        <div className="w-1/6 h-4 bg-slate-300 rounded"></div>
                        <div className="w-1/6 h-4 bg-slate-300 rounded"></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm font-semibold text-slate-600 mt-2">Cargando expedientes desde MySQL Laragon...</p>
                </div>
              ) : showEmptyState || candidatosFiltrados.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center p-6 bg-white">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3 border-2 border-slate-300">
                    <FileCheck2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">No hay candidatos pendientes en este filtro</h3>
                  <p className="text-sm font-medium text-slate-600 max-w-md mt-1 mb-5">
                    No se encontraron registros activos para el módulo o búsqueda especificada. Puedes cambiar los filtros o capturar un nuevo prospecto.
                  </p>
                  <button
                    onClick={() => {
                      setBusqueda('')
                      setFiltroModulo('todos')
                      setShowEmptyState(false)
                    }}
                    className="px-5 py-2.5 bg-[#0A162B] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-md"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        <input type="checkbox" className="w-4 h-4 rounded text-[#0A162B] focus:ring-0 cursor-pointer" />
                      </th>
                      <th className="py-3 px-4">Folio CEPS</th>
                      <th className="py-3 px-4">Candidato / Contacto</th>
                      <th className="py-3 px-4">Módulo de Origen</th>
                      <th className="py-3 px-4">Reclutador</th>
                      <th className="py-3 px-4">Estatus del Proceso</th>
                      <th className="py-3 px-4">Avance Papelería</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100">
                    {candidatosFiltrados.map((c) => {
                      const porcentaje = (c.documentosSubidos / c.documentosTotal) * 100

                      return (
                        <tr key={c.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <input type="checkbox" className="w-4 h-4 rounded text-[#0A162B] focus:ring-0 cursor-pointer" />
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-300">{c.folio}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{c.nombre}</div>
                            <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-1">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span className="font-mono tabular-nums">{c.telefono}</span> &bull; {c.puesto}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-slate-600" />
                              {c.modulo}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#0A162B] text-[#D4AF37] font-extrabold text-xs flex items-center justify-center shadow-sm">
                                {c.reclutador.charAt(0)}
                              </div>
                              <span className="font-semibold text-xs text-slate-800">{c.reclutador}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {c.estatus === 'aprobado' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Aprobado
                              </span>
                            )}
                            {c.estatus === 'validacion' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-950 border border-blue-300 shadow-sm">
                                <Clock className="w-4 h-4 text-blue-700" /> En Validación
                              </span>
                            )}
                            {c.estatus === 'citado' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-300 shadow-sm">
                                <Calendar className="w-4 h-4 text-amber-700" /> Citado
                              </span>
                            )}
                            {c.estatus === 'medico_pendiente' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-950 border border-purple-300 shadow-sm">
                                <Stethoscope className="w-4 h-4 text-purple-700" /> Antidoping Pend.
                              </span>
                            )}
                            {c.estatus === 'reprobado' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-950 border border-red-300 shadow-sm">
                                <XCircle className="w-4 h-4 text-red-700" /> Reprobado
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                                <div
                                  className={`h-full rounded-full ${
                                    porcentaje === 100 ? 'bg-emerald-600' : porcentaje >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${porcentaje}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-xs font-extrabold text-slate-800 tabular-nums">
                                {c.documentosSubidos}/{c.documentosTotal}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setCandidatoSeleccionado(c)
                                  setModalAbierto(true)
                                }}
                                className="px-3 py-1.5 bg-[#0A162B] text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                Ver Expediente
                              </button>
                              <button className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
                                <MoreVertical className="w-4 h-4" />
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

            {/* PAGINACIÓN CON BOTONES CÓMODOS */}
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700 pt-2">
              <span>Mostrando {candidatosFiltrados.length} registros</span>
              <div className="flex items-center gap-1.5">
                <button className="px-3.5 py-1.5 border-2 border-slate-300 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40" disabled>
                  Anterior
                </button>
                <button className="px-3.5 py-1.5 border-2 border-[#0A162B] bg-[#0A162B] text-[#D4AF37] font-extrabold rounded-lg shadow-sm">
                  1
                </button>
                <button className="px-3.5 py-1.5 border-2 border-slate-300 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold">
                  2
                </button>
                <button className="px-3.5 py-1.5 border-2 border-slate-300 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold">
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 5: FORMULARIOS ERGONÓMICOS CON LABELS GRANDES */}
        {(tabActiva === 'todos' || tabActiva === 'formularios') && (
          <section className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#0A162B] flex items-center gap-2.5">
                <Award className="w-6 h-6 text-[#D4AF37]" />
                5. Formularios &amp; Ergonomía de Captura Rápida
              </h2>
              <p className="text-sm font-medium text-slate-700 mt-1">
                Labels grandes y en negrita, inputs con padding generoso (<code className="font-mono text-xs font-bold">py-3 px-4</code>) y textos de ayuda de alto contraste.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-[#F8FAFC] rounded-xl border-2 border-slate-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-extrabold text-slate-900">Nombre Completo del Candidato *</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez López"
                  defaultValue="Francisco Javier Morales"
                  className="px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 focus:border-[#0A162B] outline-none shadow-sm"
                />
                <span className="text-xs font-semibold text-slate-600">Debe coincidir con la identificación oficial (INE).</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-extrabold text-slate-900">Teléfono Móvil (WhatsApp) *</label>
                <input
                  type="text"
                  placeholder="(656) 000-0000"
                  defaultValue="(656) 819-2044"
                  className="px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-mono font-bold tabular-nums text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none shadow-sm"
                />
                <span className="text-xs text-emerald-800 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Formato válido para alertas automáticas
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-extrabold text-slate-900">Módulo de Captación *</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none shadow-sm appearance-none pr-10">
                    <option>Módulo S-Mart Independencia</option>
                    <option>Módulo Monumento Benito Juárez</option>
                    <option>Oficina Central</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-500 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Determina el reclutador a cargo y la logística.</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL DE EXPEDIENTE: MÁXIMO CONTRASTE */}
      {modalAbierto && candidatoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabecera del Modal */}
            <div className="bg-[#0A162B] text-white px-6 py-4 flex items-center justify-between border-b-2 border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="bg-[#D4AF37] p-2 rounded-xl text-[#0A162B]">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Expediente: {candidatoSeleccionado.folio}</h3>
                  <p className="text-sm font-medium text-slate-300">{candidatoSeleccionado.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-100 p-4 rounded-xl border-2 border-slate-300">
                <div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Puesto Solicitado</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{candidatoSeleccionado.puesto}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Teléfono</span>
                  <p className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 tabular-nums">{candidatoSeleccionado.telefono}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Módulo Origen</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{candidatoSeleccionado.modulo}</p>
                </div>
              </div>

              {/* Lista de Documentos Requeridos */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center justify-between">
                  <span>Documentos Requeridos (Checklist RH-F-CEPS-017)</span>
                  <span className="text-xs font-mono font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    {candidatoSeleccionado.documentosSubidos} de {candidatoSeleccionado.documentosTotal} recibidos
                  </span>
                </h4>

                <div className="space-y-2">
                  {[
                    { nombre: 'Identificación Oficial (INE)', estado: 'validado' },
                    { nombre: 'Acta de Nacimiento', estado: 'validado' },
                    { nombre: 'Constancia de Situación Fiscal (RFC con QR)', estado: 'validado' },
                    { nombre: 'Comprobante de Domicilio Vigente', estado: 'validado' },
                    { nombre: 'Carta de No Antecedentes Penales (Fiscalía)', estado: 'pendiente' },
                    { nombre: 'Examen Antidoping (5 parámetros)', estado: 'validado' },
                    { nombre: 'Cartilla del Servicio Militar Liberada', estado: 'validado' },
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm">
                      <span className="text-slate-900 font-bold">{doc.nombre}</span>
                      {doc.estado === 'validado' ? (
                        <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300 flex items-center gap-1.5 text-xs font-extrabold">
                          <Check className="w-4 h-4 text-emerald-600" /> Cotejado
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300 flex items-center gap-1.5 text-xs font-extrabold">
                          <Clock className="w-4 h-4 text-amber-600" /> Pendiente
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-slate-100 px-6 py-4 border-t-2 border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white border-2 border-slate-300 text-slate-800 hover:bg-slate-50 transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setModalAbierto(false)
                  triggerToast()
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-[#0A162B] text-white hover:bg-slate-800 transition shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                Confirmar Validación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
