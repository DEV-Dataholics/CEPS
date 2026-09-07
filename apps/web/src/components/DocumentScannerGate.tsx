import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Shield,
  Camera,
  RotateCw,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  RefreshCw,
  User,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Check,
  Barcode,
} from 'lucide-react'
import {
  parseCurp,
  parseSatQr,
  CATALOGO_CURP_DEMO,
  type ExtractedCurpData,
} from '../lib/mexicanIdParser'
import {
  verificarDuplicidadAspirante,
  type ResultadoDuplicidad,
} from '../lib/duplicityChecker'
import { useVacancyStore } from '../store/vacancyStore'

interface DocumentScannerGateProps {
  onConfirmar: (datos: ExtractedCurpData, esReingreso?: boolean) => void
  onCancelar?: () => void
}

type EtapaEscaneo = 'curp' | 'sat_opcional' | 'confirmacion'

export const DocumentScannerGate: React.FC<DocumentScannerGateProps> = ({
  onConfirmar,
}) => {
  const [etapa, setEtapa] = useState<EtapaEscaneo>('curp')
  const [curpExtraida, setCurpExtraida] = useState<ExtractedCurpData | null>(null)
  const [rfcCompleto, setRfcCompleto] = useState<string | null>(null)

  // Nombre Completo Oficial Extraído / Editable
  const [nombreInput, setNombreInput] = useState('')
  const [apellidoPaternoInput, setApellidoPaternoInput] = useState('')
  const [apellidoMaternoInput, setApellidoMaternoInput] = useState('')

  // Candado de Duplicidad y Reingreso
  const [marcadoComoReingreso, setMarcadoComoReingreso] = useState(false)
  const aspirantes = useVacancyStore((state) => state.aspirantes)

  // Estado de Cámara en Vivo
  const [camaraActiva, setCamaraActiva] = useState(true)
  const [camaraFacingMode, setCamaraFacingMode] = useState<'environment' | 'user'>('environment')
  const [camaraError, setCamaraError] = useState<string | null>(null)
  const [dispositivosDisponibles, setDispositivosDisponibles] = useState<MediaDeviceInfo[]>([])

  // Entrada Manual de Respaldo para CURP
  const [modoManual, setModoManual] = useState(false)
  const [inputCurpManual, setInputCurpManual] = useState('')
  const [errorCurpManual, setErrorCurpManual] = useState<string | null>(null)

  // Entrada Manual de Respaldo para RFC
  const [inputRfcManual, setInputRfcManual] = useState('')

  // Feedback de Escaneo Exitoso
  const [escaneoExitosoAnim, setEscaneoExitosoAnim] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Buffer para Escáner Físico Láser USB/Bluetooth (Keyboard Wedge HID)
  const bufferLectorRef = useRef<string>('')
  const ultimoKeyTimeRef = useRef<number>(0)

  // ---------------------------------------------------------------------------
  // 1. Manejo del Stream de la Cámara Web / Tablet
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let streamActivo: MediaStream | null = null
    const videoEl = videoRef.current

    if (camaraActiva && etapa !== 'confirmacion') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        Promise.resolve().then(() => {
          setCamaraError('El dispositivo no soporta acceso a la cámara de video en vivo.')
        })
        return
      }

      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          setDispositivosDisponibles(devices.filter((d) => d.kind === 'videoinput'))
        })
        .catch(() => {})

      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: camaraFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        .then((stream) => {
          streamActivo = stream
          streamRef.current = stream
          if (videoEl) {
            videoEl.srcObject = stream
            videoEl.play().catch(() => {})
          }
          setCamaraError(null)
        })
        .catch((err) => {
          setCamaraError(
            err instanceof Error
              ? err.message
              : 'No se pudo acceder a la cámara. Revisa los permisos de tu dispositivo.'
          )
        })
    }

    return () => {
      if (streamActivo) {
        streamActivo.getTracks().forEach((t) => t.stop())
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (videoEl) {
        videoEl.srcObject = null
      }
    }
  }, [camaraActiva, camaraFacingMode, etapa])

  // ---------------------------------------------------------------------------
  // 2. Procesamiento de Texto Detectado (Cámara, Lector Láser o Demo)
  // ---------------------------------------------------------------------------
  const procesarTextoDetectado = useCallback(
    (rawString: string) => {
      if (!rawString || rawString.trim().length === 0) return

      // Destello visual de éxito
      setEscaneoExitosoAnim(true)
      setTimeout(() => setEscaneoExitosoAnim(false), 800)

      if (etapa === 'curp') {
        const resultado = parseCurp(rawString)
        if (resultado) {
          setCurpExtraida(resultado)
          if (resultado.nombre) setNombreInput(resultado.nombre)
          if (resultado.apellidoPaterno) setApellidoPaternoInput(resultado.apellidoPaterno)
          if (resultado.apellidoMaterno) setApellidoMaternoInput(resultado.apellidoMaterno)
          setEtapa('sat_opcional')
        }
      } else if (etapa === 'sat_opcional') {
        const satData = parseSatQr(rawString)
        if (satData) {
          setRfcCompleto(satData.rfc)
          if (curpExtraida) {
            setCurpExtraida({
              ...curpExtraida,
              rfcCompleto: satData.rfc,
              nombre: satData.nombre || curpExtraida.nombre,
              apellidoPaterno: satData.apellidoPaterno || curpExtraida.apellidoPaterno,
              apellidoMaterno: satData.apellidoMaterno || curpExtraida.apellidoMaterno,
              nombreCompleto: satData.nombreCompleto || curpExtraida.nombreCompleto,
            })
          }
          setEtapa('confirmacion')
        }
      }
    },
    [etapa, curpExtraida]
  )

  // ---------------------------------------------------------------------------
  // 3. Ciclo de Detección Óptica en Vivo (BarcodeDetector API Nativa)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let active = true

    interface BarcodeDetectorType {
      detect: (image: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>
    }

    const windowWithDetector = window as unknown as {
      BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeDetectorType
    }

    if (!windowWithDetector.BarcodeDetector) {
      return
    }

    let detector: BarcodeDetectorType | null = null
    try {
      detector = new windowWithDetector.BarcodeDetector({
        formats: ['qr_code', 'pdf417', 'code_128', 'data_matrix'],
      })
    } catch {
      detector = null
    }

    if (!detector) return

    const scanFrame = async () => {
      if (!active) return

      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        etapa !== 'confirmacion'
      ) {
        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes && barcodes.length > 0) {
            for (const barcode of barcodes) {
              if (barcode.rawValue) {
                procesarTextoDetectado(barcode.rawValue)
                break
              }
            }
          }
        } catch {
          // Cuadro no decodificado
        }
      }

      if (active) {
        animationFrameRef.current = requestAnimationFrame(scanFrame)
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame)

    return () => {
      active = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [etapa, procesarTextoDetectado])

  // ---------------------------------------------------------------------------
  // 4. Listener Global para Lector Láser Físico USB / Bluetooth (HID)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      const currentTime = Date.now()
      const diff = currentTime - ultimoKeyTimeRef.current
      ultimoKeyTimeRef.current = currentTime

      if (diff > 100) {
        bufferLectorRef.current = ''
      }

      if (e.key === 'Enter') {
        const textCapturado = bufferLectorRef.current.trim()
        bufferLectorRef.current = ''
        if (textCapturado.length >= 10) {
          procesarTextoDetectado(textCapturado)
        }
      } else if (e.key.length === 1) {
        bufferLectorRef.current += e.key
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [procesarTextoDetectado])

  // ---------------------------------------------------------------------------
  // 5. Envío Manual de CURP (Respaldo)
  // ---------------------------------------------------------------------------
  const manejarSubmitManual = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorCurpManual(null)

    const resultado = parseCurp(inputCurpManual)
    if (!resultado) {
      setErrorCurpManual(
        'La CURP ingresada no cumple con la estructura oficial de 18 caracteres de RENAPO.'
      )
      return
    }

    setCurpExtraida(resultado)
    if (resultado.nombre) setNombreInput(resultado.nombre)
    if (resultado.apellidoPaterno) setApellidoPaternoInput(resultado.apellidoPaterno)
    if (resultado.apellidoMaterno) setApellidoMaternoInput(resultado.apellidoMaterno)
    setEtapa('sat_opcional')
  }

  // ---------------------------------------------------------------------------
  // 6. Chequeo Reactivo de Duplicidad y Detección de Reingreso
  // ---------------------------------------------------------------------------
  const resultadoDuplicidad: ResultadoDuplicidad | null = useMemo(() => {
    if (!curpExtraida) return null
    const datosParaChequeo: ExtractedCurpData = {
      ...curpExtraida,
      nombre: nombreInput.trim().toUpperCase(),
      apellidoPaterno: apellidoPaternoInput.trim().toUpperCase(),
      apellidoMaterno: apellidoMaternoInput.trim().toUpperCase(),
      nombreCompleto: [nombreInput, apellidoPaternoInput, apellidoMaternoInput]
        .filter(Boolean)
        .join(' ')
        .trim()
        .toUpperCase(),
    }
    return verificarDuplicidadAspirante(datosParaChequeo, aspirantes)
  }, [curpExtraida, nombreInput, apellidoPaternoInput, apellidoMaternoInput, aspirantes])

  // ---------------------------------------------------------------------------
  // 7. Confirmación Final y Transición al Formulario
  // ---------------------------------------------------------------------------
  const manejarConfirmarFinal = () => {
    if (!curpExtraida) return

    // Bloqueo estricto: si es duplicado y no está autorizado como reingreso, no permitir avanzar
    if (resultadoDuplicidad?.esDuplicadoCurp && !marcadoComoReingreso) {
      return
    }

    const nom = nombreInput.trim().toUpperCase()
    const pat = apellidoPaternoInput.trim().toUpperCase()
    const mat = apellidoMaternoInput.trim().toUpperCase()
    const completo = [nom, pat, mat].filter(Boolean).join(' ')

    const datosFinales: ExtractedCurpData = {
      ...curpExtraida,
      nombre: nom || curpExtraida.nombre,
      apellidoPaterno: pat || curpExtraida.apellidoPaterno,
      apellidoMaterno: mat || curpExtraida.apellidoMaterno,
      nombreCompleto: completo || curpExtraida.nombreCompleto,
      rfcCompleto: rfcCompleto || curpExtraida.rfcCompleto,
    }

    onConfirmar(datosFinales, marcadoComoReingreso)
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/95 text-white select-none">
      {/* Contenedor Principal con Estilo Táctico CEPS */}
      <div className="max-w-2xl w-full bg-[#0A162B] border-2 border-[#D4AF37] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Efecto de Destello Láser Verde/Oro en Detección */}
        {escaneoExitosoAnim && (
          <div className="absolute inset-0 bg-emerald-500/20 z-50 pointer-events-none transition-opacity duration-500 border-4 border-emerald-400 rounded-3xl animate-pulse" />
        )}

        {/* ========================================================================= */}
        {/* CABECERA INSTITUCIONAL TÁCTICA                                            */}
        {/* ========================================================================= */}
        <div className="p-5 border-b-2 border-slate-800 bg-[#060E1C] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A162B] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                CEPS Paso del Norte &bull; Abordaje en Campo
              </h2>
              <p className="text-[11px] text-[#D4AF37] font-bold tracking-widest uppercase">
                Validación de Identidad &bull; CURP &amp; RFC Oficial
              </p>
            </div>
          </div>

          {/* Indicador de Estado del Lector Láser */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Lector Láser HID Listo</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PASO 1: ESCANEO DE CURP OFICIAL (RENAPO)                                  */}
        {/* ========================================================================= */}
        {etapa === 'curp' && (
          <div className="p-6 flex flex-col items-center space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-[#D4AF37]/30 flex items-center gap-1.5 w-fit mx-auto">
                <Barcode className="w-3.5 h-3.5 text-[#D4AF37]" />
                Paso 1 de 2: Constancia Oficial de CURP
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                Escanea el Código de la Constancia de CURP
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Apunta al código QR o de barras de la constancia oficial de RENAPO. Extraeremos
                de inmediato tu CURP, Nombre Completo, fecha de nacimiento y entidad.
              </p>
            </div>

            {/* Visor de Cámara en Vivo con Mira de Encuadre */}
            <div className="relative w-full max-w-md h-60 sm:h-64 bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-inner flex items-center justify-center">
              {camaraActiva && !camaraError ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Mira Cuadrada para QR / Barcode */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-48 h-48 border-2 border-dashed border-[#D4AF37]/70 rounded-2xl flex items-center justify-center">
                      <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#D4AF37]" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#D4AF37]" />
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#D4AF37]" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#D4AF37]" />

                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_12px_#D4AF37] animate-bounce" />
                    </div>
                  </div>

                  {/* Controles sobre el Visor */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {dispositivosDisponibles.length > 1 && (
                      <button
                        onClick={() =>
                          setCamaraFacingMode((prev) =>
                            prev === 'environment' ? 'user' : 'environment'
                          )
                        }
                        className="p-2 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 transition"
                        title="Cambiar lente de cámara"
                      >
                        <RotateCw className="w-4 h-4 text-[#D4AF37]" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center space-y-2">
                  <Camera className="w-10 h-10 mx-auto text-slate-500" />
                  <p className="text-xs font-bold text-slate-400">
                    {camaraError || 'Cámara desactivada'}
                  </p>
                  <button
                    onClick={() => setCamaraActiva(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    Reintentar Cámara
                  </button>
                </div>
              )}
            </div>

            {/* Alternar Entrada Manual de Respaldo */}
            <div className="w-full max-w-md pt-1">
              {!modoManual ? (
                <button
                  onClick={() => setModoManual(true)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <Keyboard className="w-4 h-4 text-[#D4AF37]" />
                  ¿El código está dañado? Capturar CURP manualmente
                </button>
              ) : (
                <form
                  onSubmit={manejarSubmitManual}
                  className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-300">
                      Captura Manual de CURP (18 caracteres):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setModoManual(false)
                        setErrorCurpManual(null)
                      }}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={18}
                      value={inputCurpManual}
                      onChange={(e) => setInputCurpManual(e.target.value.toUpperCase().trim())}
                      placeholder="Ej: RULG861230HCHZZS06"
                      className="flex-1 px-3 py-2 bg-slate-950 border-2 border-slate-700 rounded-xl font-mono text-xs font-bold text-white uppercase outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="submit"
                      disabled={inputCurpManual.length !== 18}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-[#D4AF37] text-[#0A162B] hover:bg-amber-400 transition disabled:opacity-50"
                    >
                      Validar
                    </button>
                  </div>

                  {errorCurpManual && (
                    <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errorCurpManual}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Simuladores de Escaneo con Formato Oficial RENAPO */}
            <div className="w-full max-w-md pt-2 border-t border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">
                Simulación con Formato Oficial RENAPO (Tuberías |)
              </span>

              <div className="grid grid-cols-1 gap-2">
                {CATALOGO_CURP_DEMO.map((demo) => {
                  const esDuplicado = (aspirantes || []).some(
                    (a) =>
                      Boolean(
                        a?.curp &&
                          demo?.curp &&
                          a.curp.trim().toUpperCase() === demo.curp.trim().toUpperCase()
                      )
                  )

                  return (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => procesarTextoDetectado(demo.rawCurpText)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                        esDuplicado
                          ? 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-500/40'
                          : 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/40'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {demo.titulo}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {demo.curp} &bull; {demo.subtitulo}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded whitespace-nowrap ${
                          esDuplicado
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {esDuplicado ? 'Alerta Reingreso' : 'Aspirante Nuevo'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: ESCANEO SECUENCIAL OPCIONAL DE CÉDULA SAT (RFC)                   */}
        {/* ========================================================================= */}
        {etapa === 'sat_opcional' && curpExtraida && (
          <div className="p-6 flex flex-col items-center space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 w-fit mx-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                CURP RENAPO Verificada: {curpExtraida.curp}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                ¿Cuentas con tu Cédula del SAT o RFC con Homoclave?
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Escanea el código QR de tu constancia o ingresa tu RFC completo de 13 posiciones
                para registrar tu homoclave oficial, o continúa con tu RFC base prellenado.
              </p>
            </div>

            {/* Entrada Rápida de RFC con Homoclave */}
            <div className="w-full max-w-md bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                RFC con Homoclave (13 Caracteres):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={13}
                  value={inputRfcManual}
                  onChange={(e) => setInputRfcManual(e.target.value.toUpperCase().trim())}
                  placeholder={`Ej: ${curpExtraida.rfcBase}7C5`}
                  className="flex-1 px-3 py-2 bg-slate-950 border-2 border-slate-700 rounded-xl font-mono text-xs font-bold text-white uppercase outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  disabled={inputRfcManual.length !== 13}
                  onClick={() => {
                    procesarTextoDetectado(inputRfcManual)
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  Registrar RFC
                </button>
              </div>
            </div>

            {/* Botones de Decisión Táctica */}
            <div className="w-full max-w-md flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  // Simular RFC con homoclave representativo
                  const rfcSimulado =
                    curpExtraida.curp === 'RULG861230HCHZZS06'
                      ? 'RULG8612307C5'
                      : `${curpExtraida.rfcBase}QR3`
                  procesarTextoDetectado(rfcSimulado)
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition border border-emerald-500/40 flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Simular Escaneo RFC con Homoclave (
                  {curpExtraida.curp === 'RULG861230HCHZZS06'
                    ? 'RULG8612307C5'
                    : `${curpExtraida.rfcBase}QR3`}
                  )
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEtapa('confirmacion')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-200 hover:bg-slate-700 transition border border-slate-600 flex items-center justify-center gap-2"
              >
                <span>Continuar con RFC Base ({curpExtraida.rfcBase})</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: FICHA DE CONFIRMACIÓN TÁCTICA & CANDADOS DE DUPLICIDAD            */}
        {/* ========================================================================= */}
        {etapa === 'confirmacion' && curpExtraida && (
          <div className="p-6 sm:p-8 flex flex-col space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                Confirmación de Abordaje Táctico
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Datos Demográficos Oficiales Verificados
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Revisa los datos decodificados de la constancia de RENAPO. Al confirmar, estos
                campos se prellenarán y verificarán en tu solicitud digital.
              </p>
            </div>

            {/* CANDADO DE DUPLICIDAD / REINGRESO */}
            {resultadoDuplicidad && (
              <div className="w-full">
                {resultadoDuplicidad.esDuplicadoCurp ? (
                  <div className="bg-rose-950/40 border-2 border-rose-500 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3">
                    <div className="flex items-center gap-3 text-rose-400 border-b border-rose-800/80 pb-2.5">
                      <ShieldAlert className="w-6 h-6 flex-shrink-0 animate-pulse text-rose-500" />
                      <div>
                        <h4 className="font-black text-xs sm:text-sm text-white uppercase tracking-wide">
                          Alerta de Candado: Registro Duplicado / Reingreso Detectado
                        </h4>
                        <p className="text-[11px] text-rose-300 font-semibold">
                          Esta CURP ya cuenta con un expediente histórico en la base operativa.
                        </p>
                      </div>
                    </div>

                    {/* Ficha del Expediente Previo */}
                    <div className="bg-[#060E1C] p-3 rounded-xl border border-rose-900/60 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Folio Previo:</span>
                        <span className="font-mono font-black text-[#D4AF37]">{resultadoDuplicidad.folioExistente}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Estatus Actual:</span>
                        <span className="font-extrabold text-white capitalize">{resultadoDuplicidad.estatusExistente}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Puesto Asignado:</span>
                        <span className="font-extrabold text-slate-200">{resultadoDuplicidad.puestoExistente}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Módulo de Captura:</span>
                        <span className="font-extrabold text-slate-300">{resultadoDuplicidad.moduloExistente}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Fecha de Registro:</span>
                        <span className="font-extrabold text-slate-300">{resultadoDuplicidad.fechaRegistroExistente}</span>
                      </div>
                    </div>

                    {/* Control de Desbloqueo / Autorización como Reingreso */}
                    <label className="flex items-start gap-3 p-3 bg-slate-900/90 border border-rose-400/50 rounded-xl cursor-pointer hover:bg-slate-900 transition">
                      <input
                        type="checkbox"
                        checked={marcadoComoReingreso}
                        onChange={(e) => setMarcadoComoReingreso(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-rose-500 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-rose-200">
                        Autorizar trámite y turnar a Supervisión como <strong className="text-white">EXPEDIENTE DE REINGRESO</strong>.
                      </span>
                    </label>
                  </div>
                ) : resultadoDuplicidad.esHomonimo ? (
                  <div className="bg-amber-950/40 border-2 border-amber-500 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-black text-xs text-white uppercase">
                        Advertencia de Homónimo
                      </h4>
                      <p className="text-[11px] text-amber-200">
                        Existe un registro con el mismo nombre pero diferente CURP. Se permite el avance pero se marcará para revisión de mesa de control.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/30 border border-emerald-500/50 p-3 rounded-xl flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-emerald-300">
                      Candado de Duplicidad Limpio: No registra antecedentes previos en la base institucional.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Ficha Táctica de Identidad */}
            <div className="bg-[#060E1C] border-2 border-[#D4AF37] p-5 sm:p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-mono font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                    CURP Oficial: {curpExtraida.curp}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ✓ Verificada RENAPO
                </span>
              </div>

              {/* Nombre Completo Oficial Extraído / Confirmable */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Nombre Completo del Aspirante
                  </span>
                  {curpExtraida.nombre ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Extraído de Constancia RENAPO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/50 px-2 py-0.5 rounded">
                      Completa tus Datos
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                      Nombre(s) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: GUSTAVO ALONSO"
                      value={nombreInput}
                      onChange={(e) => setNombreInput(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white uppercase outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                      Apellido Paterno *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: RUIZ"
                      value={apellidoPaternoInput}
                      onChange={(e) => setApellidoPaternoInput(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white uppercase outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                      Apellido Materno *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: LOZANO"
                      value={apellidoMaternoInput}
                      onChange={(e) => setApellidoMaternoInput(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white uppercase outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Atributos Demográficos Clave */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    Fecha de Nacimiento
                  </span>
                  <span className="font-extrabold text-white text-sm font-mono mt-0.5 block">
                    {curpExtraida.fechaNacimiento}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    Edad Exacta
                  </span>
                  <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block">
                    {curpExtraida.edad} años cumplidos
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    Sexo / Género
                  </span>
                  <span className="font-extrabold text-white text-sm mt-0.5 block">
                    {curpExtraida.sexo}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    Entidad Federativa de Origen
                  </span>
                  <span className="font-extrabold text-white text-sm mt-0.5 block">
                    {curpExtraida.nombreEntidad} ({curpExtraida.claveEntidad})
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    RFC Prellenado
                  </span>
                  <span className="font-extrabold text-[#D4AF37] font-mono text-sm mt-0.5 block">
                    {curpExtraida.rfcCompleto || curpExtraida.rfcBase}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones de Confirmación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEtapa('curp')
                  setCurpExtraida(null)
                  setRfcCompleto(null)
                  setInputCurpManual('')
                  setInputRfcManual('')
                  setMarcadoComoReingreso(false)
                }}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Escanear Otro Documento
              </button>

              <div className="w-full sm:w-auto flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={manejarConfirmarFinal}
                  disabled={Boolean(resultadoDuplicidad?.esDuplicadoCurp && !marcadoComoReingreso)}
                  className={`w-full sm:w-auto py-3 px-6 rounded-xl text-xs font-black transition shadow-xl flex items-center justify-center gap-2 ${
                    resultadoDuplicidad?.esDuplicadoCurp && !marcadoComoReingreso
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-[#D4AF37] text-[#0A162B] hover:bg-amber-400 hover:scale-102 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Iniciar Solicitud Digital</span>
                </button>

                {resultadoDuplicidad?.esDuplicadoCurp && !marcadoComoReingreso && (
                  <span className="text-[10px] text-rose-400 font-bold">
                    * Requiere autorizar expediente de reingreso para continuar
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PIE INSTITUCIONAL CEPS                                                    */}
        {/* ========================================================================= */}
        <div className="px-6 py-3 bg-[#060E1C] border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <span>Protocolo de Protección Patrimonial &bull; Célula 0</span>
          <span>Validación Algorítmica RENAPO / SAT</span>
        </div>
      </div>
    </div>
  )
}
