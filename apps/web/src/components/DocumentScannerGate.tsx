import React, { useState, useEffect, useRef, useCallback } from 'react'
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
} from 'lucide-react'
import {
  parseCurp,
  parseSatQr,
  type ExtractedCurpData,
} from '../lib/mexicanIdParser'

interface DocumentScannerGateProps {
  onConfirmar: (datos: ExtractedCurpData) => void
  onCancelar?: () => void
}

type EtapaEscaneo = 'curp' | 'sat_opcional' | 'confirmacion'

export const DocumentScannerGate: React.FC<DocumentScannerGateProps> = ({
  onConfirmar,
}) => {
  const [etapa, setEtapa] = useState<EtapaEscaneo>('curp')
  const [curpExtraida, setCurpExtraida] = useState<ExtractedCurpData | null>(null)
  const [rfcCompleto, setRfcCompleto] = useState<string | null>(null)

  // Estado de Cámara en Vivo
  const [camaraActiva, setCamaraActiva] = useState(true)
  const [camaraFacingMode, setCamaraFacingMode] = useState<'environment' | 'user'>('environment')
  const [camaraError, setCamaraError] = useState<string | null>(null)
  const [dispositivosDisponibles, setDispositivosDisponibles] = useState<MediaDeviceInfo[]>([])

  // Entrada Manual de Respaldo
  const [modoManual, setModoManual] = useState(false)
  const [inputCurpManual, setInputCurpManual] = useState('')
  const [errorCurpManual, setErrorCurpManual] = useState<string | null>(null)

  // Feedback de Escaneo Exitoso
  const [escaneoExitosoAnim, setEscaneoExitosoAnim] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Buffer para Escáner Físico Láser USB/Bluetooth (Keyboard Wedge HID)
  const bufferLectorRef = useRef<string>('')
  const ultimoKeyTimeRef = useRef<number>(0)

  // ---------------------------------------------------------------------------
  // 1. Manejo del Stream de la Cámara Web / Tablet con Efecto Asíncrono
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let streamActivo: MediaStream | null = null
    const videoEl = videoRef.current

    if (camaraActiva && etapa !== 'confirmacion') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        Promise.resolve().then(() => {
          setCamaraError('El navegador no soporta acceso a la cámara de video en vivo.')
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
  // 2. Procesamiento de Texto Detectado (Cámara o Pistola Láser)
  // ---------------------------------------------------------------------------
  const procesarTextoDetectado = useCallback(
    (rawString: string) => {
      if (!rawString || rawString.trim().length === 0) return

      // Disparar destello visual
      setEscaneoExitosoAnim(true)
      setTimeout(() => setEscaneoExitosoAnim(false), 800)

      if (etapa === 'curp') {
        const resultado = parseCurp(rawString)
        if (resultado) {
          setCurpExtraida(resultado)
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

    // Verificar si el navegador soporta la API nativa BarcodeDetector
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
          // Ignorar cuadros borrosos o no decodificados
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
      // Ignorar si el usuario está enfocado escribiendo en el input manual
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      const currentTime = Date.now()
      const diff = currentTime - ultimoKeyTimeRef.current
      ultimoKeyTimeRef.current = currentTime

      // Los lectores físicos envían teclas con menos de 45ms entre sí
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
    setEtapa('sat_opcional')
  }

  // ---------------------------------------------------------------------------
  // 6. Confirmación Final y Transición al Formulario
  // ---------------------------------------------------------------------------
  const manejarConfirmarFinal = () => {
    if (!curpExtraida) return

    const datosFinales: ExtractedCurpData = {
      ...curpExtraida,
      rfcCompleto: rfcCompleto || curpExtraida.rfcCompleto,
    }

    onConfirmar(datosFinales)
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
                Estación de Escaneo y Validación de Identidad
              </p>
            </div>
          </div>

          {/* Indicador de Estado del Lector Láser */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Lector Láser HID Activo</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PASO 1: ESCANEO DE CURP OBLIGATORIA                                       */}
        {/* ========================================================================= */}
        {etapa === 'curp' && (
          <div className="p-6 flex flex-col items-center space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                Paso 1 de 2: Documento Obligatorio
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                Escanea la CURP o Código de tu INE
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Apunta la cámara al código QR de la constancia de CURP, al código de barras
                posterior de la credencial de elector (INE) o dispara con la pistola lectora.
              </p>
            </div>

            {/* Visor de Cámara en Vivo con Mira de Encuadre */}
            <div className="relative w-full max-w-md h-64 sm:h-72 bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-inner flex items-center justify-center">
              {camaraActiva && !camaraError ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Mira de Escaneo Táctica */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-48 h-48 border-2 border-dashed border-[#D4AF37]/60 rounded-2xl flex items-center justify-center">
                      {/* Esquinas Reforzadas */}
                      <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#D4AF37]" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#D4AF37]" />
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#D4AF37]" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#D4AF37]" />

                      {/* Línea de Barrido Láser Animada */}
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
                    onClick={() => {
                      setCamaraActiva(true)
                      iniciarCamara()
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    Reintentar Cámara
                  </button>
                </div>
              )}
            </div>

            {/* Alternar Entrada Manual de Respaldo */}
            <div className="w-full max-w-md pt-2">
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
                      placeholder="Ej: MECJ920514HCHDRR08"
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
                CURP Verificada: {curpExtraida.curp}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                ¿Cuentas con tu Cédula de Situación Fiscal (SAT)?
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Escanea el código QR de tu constancia del SAT para registrar tu homoclave
                oficial completa de 13 caracteres, o continúa con tu RFC base prellenado.
              </p>
            </div>

            {/* Visor de Cámara para Cédula SAT */}
            <div className="relative w-full max-w-md h-56 bg-black rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                <div className="w-40 h-40 border-2 border-dashed border-emerald-400/70 rounded-2xl flex items-center justify-center">
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34D399] animate-bounce" />
                </div>
              </div>
            </div>

            {/* Botones de Decisión */}
            <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setEtapa('confirmacion')}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-200 hover:bg-slate-700 transition border border-slate-600 flex items-center justify-center gap-2"
              >
                <span>Continuar con RFC Base ({curpExtraida.rfcBase})</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: FICHA DE CONFIRMACIÓN TÁCTICA DE DATOS EXTRAÍDOS                  */}
        {/* ========================================================================= */}
        {etapa === 'confirmacion' && curpExtraida && (
          <div className="p-6 sm:p-8 flex flex-col space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                Confirmación de Abordaje Táctico
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Datos Demográficos Oficiales Extraídos
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Revisa los datos decodificados de la CURP oficial. Al confirmar, estos
                campos se prellenarán y verificarán en tu solicitud digital.
              </p>
            </div>

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
                  ✓ Verificada
                </span>
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
                onClick={() => {
                  setEtapa('curp')
                  setCurpExtraida(null)
                  setRfcCompleto(null)
                  setInputCurpManual('')
                }}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Escanear Otro Documento
              </button>

              <button
                onClick={manejarConfirmarFinal}
                className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs font-black bg-[#D4AF37] text-[#0A162B] hover:bg-amber-400 transition shadow-xl hover:scale-102 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar e Iniciar Solicitud Digital
              </button>
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
