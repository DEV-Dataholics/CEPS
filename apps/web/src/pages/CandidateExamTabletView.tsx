import React, { useState } from 'react'
import {
  Tablet,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Shield,
  Send,
  AlertCircle,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import { useVacancyStore, type AspiranteSolicitud } from '../store/vacancyStore'
import { evaluarRazonamiento } from '../store/dossierStore'
import type { ExamenRazonamientoRespuestas } from '../types/dossierTypes'

interface CandidateExamTabletViewProps {
  onFinalizar?: () => void
}

export const CandidateExamTabletView: React.FC<CandidateExamTabletViewProps> = ({
  onFinalizar,
}) => {
  const { aspirantes, guardarExamenRazonamiento } = useVacancyStore()

  // Estado de Autenticación en Tablet
  const [folioInput, setFolioInput] = useState('')
  const [aspiranteActivo, setAspiranteActivo] = useState<AspiranteSolicitud | null>(null)
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null)

  // Etapas del Examen: 'login' | 'instrucciones' | 'lectura' | 'aritmetica' | 'logica' | 'completado'
  const [etapa, setEtapa] = useState<
    'login' | 'instrucciones' | 'lectura' | 'aritmetica' | 'logica' | 'completado'
  >('login')

  // Respuestas del Candidato
  const [respuestas, setRespuestas] = useState<ExamenRazonamientoRespuestas>({
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
  })

  // Manejar Login con Folio / ID
  const manejarAcceso = (folioAProbar?: string) => {
    const folioBuscar = (folioAProbar || folioInput).trim().toUpperCase()
    setErrorAcceso(null)

    if (!folioBuscar) {
      setErrorAcceso('Por favor ingresa tu Folio de aspirante o escanea tu código QR.')
      return
    }

    const aspirante = aspirantes.find(
      (a) =>
        a.folio.toUpperCase() === folioBuscar ||
        a.curp.toUpperCase() === folioBuscar ||
        a.id.toUpperCase() === folioBuscar
    )

    if (!aspirante) {
      setErrorAcceso(
        `No se encontró ningún aspirante con el folio "${folioBuscar}". Verifica con el reclutador en campo.`
      )
      return
    }

    if (aspirante.noContratable) {
      setErrorAcceso(
        'Este registro tiene una restricción administrativa y no puede presentar evaluaciones.'
      )
      return
    }

    // Verificar si el examen fue habilitado por el Administrador de Vacantes
    const estaHabilitado =
      aspirante.examenesHabilitados?.razonamiento === true ||
      aspirante.estatus === 'nuevo' ||
      aspirante.estatus === 'en_evaluacion'

    if (!estaHabilitado) {
      setErrorAcceso(
        'Tus evaluaciones aún no han sido habilitadas en la plataforma por el Administrador de Vacantes. Notifícalo al personal de RH.'
      )
      return
    }

    // Si ya completó la evaluación
    if (aspirante.evaluacionRazonamiento) {
      setAspiranteActivo(aspirante)
      setEtapa('completado')
      return
    }

    setAspiranteActivo(aspirante)
    setEtapa('instrucciones')
  }

  const seleccionarRespuesta = (campo: keyof ExamenRazonamientoRespuestas, valor: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  // Enviar respuestas al finalizar
  const manejarFinalizarExamen = () => {
    if (!aspiranteActivo) return

    const evaluacion = evaluarRazonamiento(respuestas)
    const fechaHoy = new Date().toISOString().substring(0, 10)

    guardarExamenRazonamiento(aspiranteActivo.id, {
      respuestas,
      evaluacion,
      fechaEvaluacion: fechaHoy,
      evaluador: 'Tablet Autónoma (Autoservicio)',
    })

    setEtapa('completado')
  }

  const reiniciarSesion = () => {
    setFolioInput('')
    setAspiranteActivo(null)
    setErrorAcceso(null)
    setEtapa('login')
    setRespuestas({
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
    })
  }

  return (
    <div className="flex-1 bg-[#060E1C] text-slate-100 min-h-screen flex flex-col justify-between select-none">
      {/* ========================================================================= */}
      {/* CABECERA MODO QUIOSCO / TABLET                                            */}
      {/* ========================================================================= */}
      <header className="bg-[#0A162B] border-b-2 border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0A162B] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-xl">
            <Tablet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
              CEPS Paso del Norte &bull; Evaluación en Tablet
              <span className="text-[10px] uppercase font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40">
                Modo Quiosco
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Plataforma Táctil Oficial de Exámenes Psicotécnicos y Razonamiento
            </p>
          </div>
        </div>

        {aspiranteActivo && etapa !== 'login' && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-black text-white block">
                {aspiranteActivo.nombre} {aspiranteActivo.apellidoPaterno}
              </span>
              <span className="text-[11px] font-mono text-[#D4AF37] font-bold block">
                Folio: {aspiranteActivo.folio}
              </span>
            </div>
            <button
              onClick={reiniciarSesion}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
              title="Salir / Finalizar Sesión"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* CUERPO PRINCIPAL                                                          */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {/* ----------------------------------------------------------------------- */}
        {/* 1. PANTALLA DE ACCESO POR FOLIO / QR                                     */}
        {/* ----------------------------------------------------------------------- */}
        {etapa === 'login' && (
          <div className="bg-[#0A162B] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="inline-flex p-4 rounded-2xl bg-[#060E1C] border border-[#D4AF37]/50 text-[#D4AF37] shadow-inner mb-2">
                <Shield className="w-12 h-12" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Bienvenido al Sistema de Evaluaciones
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Ingresa tu Folio Único de Candidato o pulsa sobre tu perfil si fuiste registrado en campo.
              </p>
            </div>

            {errorAcceso && (
              <div className="bg-rose-950/80 border-2 border-rose-500 p-4 rounded-2xl flex items-start gap-3 text-rose-200 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-sm text-white">No es posible iniciar examen</p>
                  <p className="mt-0.5">{errorAcceso}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5 tracking-wider">
                  Folio Único de Candidato / CURP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={folioInput}
                    onChange={(e) => setFolioInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && manejarAcceso()}
                    placeholder="Ejemplo: CEPS-2026-4892"
                    className="w-full px-5 py-4 bg-[#060E1C] border-2 border-slate-700 rounded-2xl font-mono text-lg font-black text-white uppercase outline-none focus:border-[#D4AF37] tracking-wider transition"
                  />
                  <button
                    onClick={() => manejarAcceso()}
                    className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-[#D4AF37] hover:bg-amber-400 text-[#0A162B] font-black text-xs rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <span>Ingresar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Acceso Rápido para Demostración */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                  Aspirantes Listos para Examen (Demo en Vivo):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aspirantes.slice(0, 4).map((asp) => (
                    <button
                      key={asp.id}
                      onClick={() => {
                        setFolioInput(asp.folio)
                        manejarAcceso(asp.folio)
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                        asp.noContratable
                          ? 'bg-red-950/30 border-red-800 text-red-300 hover:bg-red-950/50'
                          : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-[#D4AF37] hover:bg-[#0A162B]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-black text-white block truncate">
                          {asp.nombre} {asp.apellidoPaterno}
                        </span>
                        <span className="text-[11px] font-mono text-[#D4AF37] font-bold block">
                          {asp.folio}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {asp.puestoDeseado}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {asp.noContratable ? (
                          <span className="text-[9px] font-black uppercase px-2 py-1 bg-red-900/60 text-red-300 border border-red-600 rounded-lg">
                            No Contratable
                          </span>
                        ) : asp.evaluacionRazonamiento ? (
                          <span className="text-[9px] font-black uppercase px-2 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-600 rounded-lg">
                            Ya Realizado
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 rounded-lg">
                            Habilitado
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 2. PANTALLA DE INSTRUCCIONES                                             */}
        {/* ----------------------------------------------------------------------- */}
        {etapa === 'instrucciones' && aspiranteActivo && (
          <div className="bg-[#0A162B] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#060E1C] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-2xl font-black">
                {aspiranteActivo.nombre.charAt(0)}
              </div>
              <div>
                <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest block">
                  Aspirante Identificado
                </span>
                <h2 className="text-xl font-black text-white">
                  {aspiranteActivo.nombre} {aspiranteActivo.apellidoPaterno} {aspiranteActivo.apellidoMaterno}
                </h2>
                <span className="text-xs text-slate-400 font-mono">Folio: {aspiranteActivo.folio}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-white">
                Instrucciones para la Evaluación Táctil (VER5 Oficial):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-300">
                <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                    1
                  </div>
                  <h4 className="font-extrabold text-white text-sm">Comprensión Lectora</h4>
                  <p className="text-slate-400 text-[11px]">
                    Lee una breve historia cotidiana y responde 4 preguntas de opción múltiple tocando tu respuesta.
                  </p>
                </div>

                <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    2
                  </div>
                  <h4 className="font-extrabold text-white text-sm">Cálculo Rápido</h4>
                  <p className="text-slate-400 text-[11px]">
                    12 operaciones aritméticas directas como en un cajero automático. Elige la cifra correcta.
                  </p>
                </div>

                <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                    3
                  </div>
                  <h4 className="font-extrabold text-white text-sm">Lógica y Criterio</h4>
                  <p className="text-slate-400 text-[11px]">
                    5 preguntas de sentido común y protocolos de seguridad física y patrimonial.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-950/40 border border-blue-500/40 rounded-2xl text-xs text-blue-200">
                💡 <strong>Importante:</strong> Tómate el tiempo que requieras. No necesitas escribir con teclado; todas las opciones se seleccionan con un solo toque táctil en la pantalla.
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setEtapa('lectura')}
                className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] hover:bg-amber-400 text-[#0A162B] font-black text-sm rounded-2xl transition flex items-center justify-center gap-3 shadow-xl hover:scale-102 cursor-pointer"
              >
                <span>Comenzar Examen</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 3. MÓDULO 1: COMPRENSIÓN LECTORA (LA MOCHILA DE ANA)                     */}
        {/* ----------------------------------------------------------------------- */}
        {etapa === 'lectura' && (
          <div className="bg-[#0A162B] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            {/* Barra de Progreso */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest">
                Módulo 1 de 3 &bull; Comprensión Lectora
              </span>
              <span className="text-xs font-bold text-slate-400">Paso 1/3</span>
            </div>

            {/* Lectura Oficial */}
            <div className="bg-[#060E1C] p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-2.5">
              <span className="text-xs font-black uppercase text-[#D4AF37] tracking-wider block">
                📖 Texto de Lectura:
              </span>
              <p className="text-base sm:text-lg leading-relaxed text-slate-200 font-medium">
                «Ayer por la tarde, mientras caminaba por el parque, encontré una mochila olvidada sobre una banca. Al revisarla cuidadosamente para buscar una identificación, encontré una nota doblada que decía:{' '}
                <strong className="text-white">"Gracias por cuidar mis cosas. Mi nombre es Ana"</strong>. Poco después, Ana regresó al parque y me agradeció profundamente con una sonrisa por haber resguardado sus pertenencias.»
              </p>
            </div>

            {/* Preguntas con Botones Táctiles Tipo Cajero */}
            <div className="space-y-5">
              {/* Pregunta 1 */}
              <div className="space-y-2">
                <span className="text-sm font-extrabold text-white block">
                  1. ¿En qué lugar fue encontrada la mochila olvidada?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['En el parque', 'En la escuela', 'En el autobús'].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => seleccionarRespuesta('dondeEncontroMochila', opc)}
                      className={`p-4 rounded-2xl text-sm font-black border-2 transition text-center ${
                        respuestas.dondeEncontroMochila === opc
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300 shadow-lg scale-102'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 2 */}
              <div className="space-y-2">
                <span className="text-sm font-extrabold text-white block">
                  2. Al revisar la mochila, ¿qué objeto se encontró?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Una nota', 'Dinero en efectivo', 'Un teléfono celular'].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => seleccionarRespuesta('queHabiaEnMochila', opc)}
                      className={`p-4 rounded-2xl text-sm font-black border-2 transition text-center ${
                        respuestas.queHabiaEnMochila === opc
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300 shadow-lg scale-102'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 3 */}
              <div className="space-y-2">
                <span className="text-sm font-extrabold text-white block">
                  3. ¿Qué mensaje exacto decía la nota encontrada?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    '"Gracias por cuidar mis cosas. Mi nombre es Ana"',
                    '"Propiedad privada no tocar"',
                    '"Favor de entregar a caseta"',
                  ].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => seleccionarRespuesta('queDeciaNota', opc)}
                      className={`p-4 rounded-2xl text-xs sm:text-sm font-black border-2 transition text-center ${
                        respuestas.queDeciaNota === opc
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300 shadow-lg scale-102'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 4 */}
              <div className="space-y-2">
                <span className="text-sm font-extrabold text-white block">
                  4. Al recuperar su mochila, ¿cómo se sintió Ana?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Agradecida', 'Enojada', 'Preocupada'].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => seleccionarRespuesta('comoSeSentioAna', opc)}
                      className={`p-4 rounded-2xl text-sm font-black border-2 transition text-center ${
                        respuestas.comoSeSentioAna === opc
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300 shadow-lg scale-102'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navegación */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={() => setEtapa('instrucciones')}
                className="px-5 py-3 text-slate-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Volver
              </button>

              <button
                onClick={() => setEtapa('aritmetica')}
                className="px-8 py-3.5 bg-[#D4AF37] hover:bg-amber-400 text-[#0A162B] font-black text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 shadow-lg hover:scale-102 cursor-pointer"
              >
                <span>Continuar a Cálculo Rápido</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 4. MÓDULO 2: ARITMÉTICA BÁSICA (CÁLCULO RÁPIDO)                          */}
        {/* ----------------------------------------------------------------------- */}
        {etapa === 'aritmetica' && (
          <div className="bg-[#0A162B] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest">
                Módulo 2 de 3 &bull; Aritmética Práctica
              </span>
              <span className="text-xs font-bold text-slate-400">Paso 2/3</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Toca la respuesta correcta para cada operación matemática:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Op 1: 40 + 40 */}
              <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-mono font-black text-lg text-white">40 + 40 = ?</span>
                <div className="flex gap-2">
                  {['70', '80', '90'].map((val) => (
                    <button
                      key={val}
                      onClick={() => seleccionarRespuesta('op1_40_mas', val)}
                      className={`w-14 h-12 rounded-xl font-mono font-black text-sm border-2 transition ${
                        respuestas.op1_40_mas === val
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300'
                          : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Op 2: 200 + 250 */}
              <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-mono font-black text-lg text-white">200 + 250 = ?</span>
                <div className="flex gap-2">
                  {['400', '450', '500'].map((val) => (
                    <button
                      key={val}
                      onClick={() => seleccionarRespuesta('op2_200_mas', val)}
                      className={`w-14 h-12 rounded-xl font-mono font-black text-sm border-2 transition ${
                        respuestas.op2_200_mas === val
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300'
                          : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Op 3: 20 + 25 */}
              <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-mono font-black text-lg text-white">20 + 25 = ?</span>
                <div className="flex gap-2">
                  {['35', '45', '55'].map((val) => (
                    <button
                      key={val}
                      onClick={() => seleccionarRespuesta('op3_20_mas', val)}
                      className={`w-14 h-12 rounded-xl font-mono font-black text-sm border-2 transition ${
                        respuestas.op3_20_mas === val
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300'
                          : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Op 4: 80 - 60 */}
              <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-mono font-black text-lg text-white">80 - 60 = ?</span>
                <div className="flex gap-2">
                  {['10', '20', '30'].map((val) => (
                    <button
                      key={val}
                      onClick={() => seleccionarRespuesta('op4_menos_60', val)}
                      className={`w-14 h-12 rounded-xl font-mono font-black text-sm border-2 transition ${
                        respuestas.op4_menos_60 === val
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300'
                          : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Op 5: 200 - 50 */}
              <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-mono font-black text-lg text-white">200 - 50 = ?</span>
                <div className="flex gap-2">
                  {['100', '150', '250'].map((val) => (
                    <button
                      key={val}
                      onClick={() => seleccionarRespuesta('op5_menos_50', val)}
                      className={`w-14 h-12 rounded-xl font-mono font-black text-sm border-2 transition ${
                        respuestas.op5_menos_50 === val
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300'
                          : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Op 6: 85 - 45 */}
              <div className="bg-[#060E1C] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-mono font-black text-lg text-white">85 - 45 = ?</span>
                <div className="flex gap-2">
                  {['30', '40', '50'].map((val) => (
                    <button
                      key={val}
                      onClick={() => seleccionarRespuesta('op6_85_menos', val)}
                      className={`w-14 h-12 rounded-xl font-mono font-black text-sm border-2 transition ${
                        respuestas.op6_85_menos === val
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300'
                          : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navegación */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={() => setEtapa('lectura')}
                className="px-5 py-3 text-slate-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Módulo Anterior
              </button>

              <button
                onClick={() => setEtapa('logica')}
                className="px-8 py-3.5 bg-[#D4AF37] hover:bg-amber-400 text-[#0A162B] font-black text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 shadow-lg hover:scale-102 cursor-pointer"
              >
                <span>Continuar a Lógica y Criterio</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 5. MÓDULO 3: LÓGICA Y SITUACIONES                                        */}
        {/* ----------------------------------------------------------------------- */}
        {etapa === 'logica' && (
          <div className="bg-[#0A162B] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest">
                Módulo 3 de 3 &bull; Lógica y Razonamiento
              </span>
              <span className="text-xs font-bold text-slate-400">Paso 3/3</span>
            </div>

            <div className="space-y-5">
              {/* Lógica 1 */}
              <div className="space-y-2">
                <span className="text-sm font-extrabold text-white block">
                  1. La palabra «AUTO» finaliza con la letra O. ¿Esta afirmación es correcta?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Sí, es correcto (termina con O)', 'No, es falso'].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => seleccionarRespuesta('palabraAuto', opc)}
                      className={`p-4 rounded-2xl text-sm font-black border-2 transition text-center ${
                        respuestas.palabraAuto === opc
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300 shadow-lg scale-102'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lógica 2 */}
              <div className="space-y-2">
                <span className="text-sm font-extrabold text-white block">
                  2. Un pastor tiene 15 ovejas y mueren todas menos 12. ¿Cuántas ovejas le quedan vivas?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['12 ovejas', '3 ovejas', '15 ovejas'].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => seleccionarRespuesta('pastorOvejas', opc)}
                      className={`p-4 rounded-2xl text-sm font-black border-2 transition text-center ${
                        respuestas.pastorOvejas === opc
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300 shadow-lg scale-102'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lógica 3 */}
              <div className="space-y-2">
                <span className="text-sm font-extrabold text-white block">
                  3. Un tren eléctrico descarrila exactamente en la frontera entre México y EE.UU. ¿Dónde se debe enterrar a los sobrevivientes?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    'A los sobrevivientes no se les entierra',
                    'En territorio de México',
                    'En territorio de EE.UU.',
                  ].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => seleccionarRespuesta('trenSobrevivientes', opc)}
                      className={`p-4 rounded-2xl text-xs sm:text-sm font-black border-2 transition text-center ${
                        respuestas.trenSobrevivientes === opc
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300 shadow-lg scale-102'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lógica 4 */}
              <div className="space-y-2">
                <span className="text-sm font-extrabold text-white block">
                  4. Un gallo pone un huevo justo en el pico de un tejado de caseta a dos aguas. ¿Hacia qué lado rodará el huevo?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    'Los gallos no ponen huevos',
                    'Hacia el lado derecho',
                    'Hacia el lado izquierdo',
                  ].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => seleccionarRespuesta('huevoGallo', opc)}
                      className={`p-4 rounded-2xl text-xs sm:text-sm font-black border-2 transition text-center ${
                        respuestas.huevoGallo === opc
                          ? 'bg-[#D4AF37] text-[#0A162B] border-amber-300 shadow-lg scale-102'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navegación y Finalizar */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={() => setEtapa('aritmetica')}
                className="px-5 py-3 text-slate-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Módulo Anterior
              </button>

              <button
                onClick={manejarFinalizarExamen}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0A162B] font-black text-sm rounded-2xl transition flex items-center gap-2 shadow-2xl hover:scale-102 cursor-pointer"
              >
                <Send className="w-5 h-5" />
                <span>Finalizar y Enviar Evaluación</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 6. PANTALLA FINAL: ASIMETRÍA DE SEGURIDAD (CONFIDENCIALIDAD TOTAL)       */}
        {/* ----------------------------------------------------------------------- */}
        {etapa === 'completado' && aspiranteActivo && (
          <div className="bg-[#0A162B] border-2 border-emerald-500 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400 rounded-full mx-auto flex items-center justify-center text-emerald-400 shadow-xl">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-black text-emerald-400 block">
                ✓ Registro Exitoso en Plataforma
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ¡Evaluación Completada con Éxito!
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Tus respuestas han sido capturadas y aseguradas en el expediente digital de{' '}
                <strong className="text-white">CEPS Paso del Norte</strong>.
              </p>
            </div>

            {/* Asimetría Explicada al Candidato */}
            <div className="bg-[#060E1C] p-5 rounded-2xl border border-slate-800 text-left max-w-lg mx-auto space-y-3">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>Confidencialidad del Proceso de Selección</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Por políticas de protección y seguridad corporativa, los resultados y dictámenes son analizados de forma confidencial por el{' '}
                <strong className="text-white">Comité de Selección y el Administrador de Vacantes</strong>.
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Folio de Seguimiento:</span>
                <span className="font-mono font-black text-[#D4AF37] text-sm">
                  {aspiranteActivo.folio}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={reiniciarSesion}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Finalizar y Devolver Tablet</span>
              </button>

              {onFinalizar && (
                <button
                  onClick={onFinalizar}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#D4AF37] hover:bg-amber-400 text-[#0A162B] font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Ir al Portal del Candidato</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* PIE INSTITUCIONAL                                                         */}
      {/* ========================================================================= */}
      <footer className="bg-[#0A162B] border-t border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
        <span>CEPS Paso del Norte &bull; Sistema de Seguridad Privada y Custodia</span>
        <span className="flex items-center gap-1 text-[#D4AF37]">
          <Shield className="w-3.5 h-3.5" />
          Módulo de Evaluación Táctil &bull; Modo Seguro de Aplicación
        </span>
      </footer>
    </div>
  )
}
