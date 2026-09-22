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
  ShieldAlert,
  AlertTriangle,
  Check,
  Barcode,
  Home,
  QrCode,
} from 'lucide-react'
import {
  parseCurp,
  parseSatQr,
  type ExtractedCurpData,
} from '../lib/mexicanIdParser'
import { api } from '../lib/api'
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

/**
 * Emite un tono sintetizado agudo de confirmación táctica (estilo lectores Zebra / Honeywell)
 */
function emitirBeepExito() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.09)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.09)
  } catch {}
}

/**
 * Emite un tono grave de aviso si el código no coincide con CURP o RFC
 */
function emitirBeepError() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(320, ctx.currentTime)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  } catch {}
}

export const DocumentScannerGate: React.FC<DocumentScannerGateProps> = ({
  onConfirmar,
}) => {
  const [etapa, setEtapa] = useState<EtapaEscaneo>('curp')
  const [curpExtraida, setCurpExtraida] = useState<ExtractedCurpData | null>(null)
  const [rfcCompleto, setRfcCompleto] = useState<string | null>(null)

  // Estados de Procesamiento y Feedback en Tiempo Real
  const procesandoRef = useRef(false)
  const [procesando, setProcesando] = useState(false)
  const [mensajeProceso, setMensajeProceso] = useState('')
  const [submensajeProceso, setSubmensajeProceso] = useState('')
  const [errorLectura, setErrorLectura] = useState<string | null>(null)
  const [discordanciaRfc, setDiscordanciaRfc] = useState<{
    curp: string
    curpBase: string
    rfc: string
    rfcBase: string
  } | null>(null)
  const [leyendoRafaga, setLeyendoRafaga] = useState(false)
  const timeoutRafagaRef = useRef<number | null>(null)

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
    async (rawString: string) => {
      if (!rawString || rawString.trim().length === 0) return
      // Candado atómico: si ya está procesando una lectura, ignorar ráfagas repetidas del lector
      if (procesandoRef.current) return

      procesandoRef.current = true
      setProcesando(true)
      setErrorLectura(null)
      setDiscordanciaRfc(null)

      const trimmed = rawString.trim()

      // A. Detección prioritaria de URL / QR del SAT (Validador oficial)
      if (
        trimmed.includes('siat.sat.gob.mx') ||
        trimmed.includes('validadorqr.jsf') ||
        trimmed.includes('D3=')
      ) {
        setMensajeProceso('Cédula Fiscal del SAT Detectada')
        setSubmensajeProceso('Conectando con el validador oficial del SAT y extrayendo Domicilio Fiscal...')

        try {
          const res = await api.consultarSat(trimmed)

          if (res.status === 'ok' || res.status === 'partial') {
            const rfcEncontrado = (res.rfc || '').toUpperCase()

            // VALIDACIÓN ESTRICTA DE CONCORDANCIA CON CURP PREVIA
            if (curpExtraida && rfcEncontrado) {
              const rfcSub10 = rfcEncontrado.substring(0, 10)
              const curpBase = curpExtraida.rfcBase.toUpperCase()

              if (rfcSub10 !== curpBase) {
                emitirBeepError()
                setDiscordanciaRfc({
                  curp: curpExtraida.curp,
                  curpBase,
                  rfc: rfcEncontrado,
                  rfcBase: rfcSub10,
                })
                setErrorLectura(
                  `Discordancia de Identidad: El RFC del SAT (${rfcEncontrado}) no corresponde a la CURP (${curpExtraida.curp}). Raíz esperada: "${curpBase}", detectada: "${rfcSub10}".`
                )
                return
              }
            }

            emitirBeepExito()
            setEscaneoExitosoAnim(true)
            setTimeout(() => setEscaneoExitosoAnim(false), 800)

            if (rfcEncontrado) setRfcCompleto(rfcEncontrado)
            if (res.nombre) setNombreInput(res.nombre)
            if (res.apellidoPaterno) setApellidoPaternoInput(res.apellidoPaterno)
            if (res.apellidoMaterno) setApellidoMaternoInput(res.apellidoMaterno)

            if (curpExtraida) {
              setCurpExtraida({
                ...curpExtraida,
                rfcCompleto: rfcEncontrado || curpExtraida.rfcCompleto,
                nombre: res.nombre || curpExtraida.nombre,
                apellidoPaterno: res.apellidoPaterno || curpExtraida.apellidoPaterno,
                apellidoMaterno: res.apellidoMaterno || curpExtraida.apellidoMaterno,
                nombreCompleto: res.nombreCompleto || curpExtraida.nombreCompleto,
                situacionFiscal: res.situacion,
                regimenesFiscales: res.regimenes,
                domicilio: res.domicilio || curpExtraida.domicilio,
              })
            } else if (res.curp) {
              const curpParsed = parseCurp(res.curp)
              if (curpParsed) {
                setCurpExtraida({
                  ...curpParsed,
                  rfcCompleto: rfcEncontrado,
                  nombre: res.nombre || curpParsed.nombre,
                  apellidoPaterno: res.apellidoPaterno || curpParsed.apellidoPaterno,
                  apellidoMaterno: res.apellidoMaterno || curpParsed.apellidoMaterno,
                  nombreCompleto: res.nombreCompleto || curpParsed.nombreCompleto,
                  situacionFiscal: res.situacion,
                  regimenesFiscales: res.regimenes,
                  domicilio: res.domicilio,
                })
              }
            }

            setEtapa('confirmacion')
            return
          }
        } catch {
          // Si el portal del SAT en vivo no responde, extraer RFC de respaldo del QR
          const satData = parseSatQr(trimmed)
          if (satData) {
            const rfcEncontrado = satData.rfc.toUpperCase()

            // VALIDACIÓN ESTRICTA DE CONCORDANCIA CON CURP PREVIA
            if (curpExtraida && rfcEncontrado) {
              const rfcSub10 = rfcEncontrado.substring(0, 10)
              const curpBase = curpExtraida.rfcBase.toUpperCase()

              if (rfcSub10 !== curpBase) {
                emitirBeepError()
                setDiscordanciaRfc({
                  curp: curpExtraida.curp,
                  curpBase,
                  rfc: rfcEncontrado,
                  rfcBase: rfcSub10,
                })
                setErrorLectura(
                  `Discordancia de Identidad: El RFC del código SAT (${rfcEncontrado}) no corresponde a la CURP (${curpExtraida.curp}). Raíz esperada: "${curpBase}", detectada: "${rfcSub10}".`
                )
                return
              }
            }

            emitirBeepExito()
            setEscaneoExitosoAnim(true)
            setTimeout(() => setEscaneoExitosoAnim(false), 800)

            setRfcCompleto(satData.rfc)
            if (curpExtraida) {
              setCurpExtraida({
                ...curpExtraida,
                rfcCompleto: satData.rfc,
              })
            }
            setEtapa('confirmacion')
            return
          }
        } finally {
          procesandoRef.current = false
          setProcesando(false)
        }
      }

      // B. Etapa CURP (Constancia RENAPO con delimitadores o directa)
      if (etapa === 'curp') {
        setMensajeProceso('Constancia de CURP Detectada')
        setSubmensajeProceso('Decodificando Nombres, Fecha de Nacimiento y Entidad...')

        await new Promise((resolve) => setTimeout(resolve, 200))

        const resultado = parseCurp(rawString)
        if (resultado) {
          emitirBeepExito()
          setEscaneoExitosoAnim(true)
          setTimeout(() => setEscaneoExitosoAnim(false), 800)
          setCurpExtraida(resultado)
          if (resultado.nombre) setNombreInput(resultado.nombre)
          if (resultado.apellidoPaterno) setApellidoPaternoInput(resultado.apellidoPaterno)
          if (resultado.apellidoMaterno) setApellidoMaternoInput(resultado.apellidoMaterno)
          setEtapa('sat_opcional')
        } else {
          emitirBeepError()
          if (parseSatQr(rawString)) {
            setErrorLectura('Detectamos un código de RFC (13 caracteres), pero en este primer paso se requiere la Constancia de CURP (18 caracteres) de RENAPO.')
          } else {
            setErrorLectura('El código escaneado no corresponde a una CURP oficial de 18 caracteres de RENAPO.')
          }
        }

        procesandoRef.current = false
        setProcesando(false)
        return
      }

      // C. Etapa RFC / SAT (Código de barras 1D de 13 dígitos o entrada manual)
      if (etapa === 'sat_opcional') {
        setMensajeProceso('Código de RFC Detectado')
        setSubmensajeProceso('Verificando homoclave de 13 caracteres...')

        await new Promise((resolve) => setTimeout(resolve, 180))

        const satData = parseSatQr(rawString)
        if (satData) {
          const rfcEncontrado = satData.rfc.toUpperCase()

          // VALIDACIÓN ESTRICTA DE CONCORDANCIA CON CURP PREVIA
          if (curpExtraida) {
            const rfcSub10 = rfcEncontrado.substring(0, 10)
            const curpBase = curpExtraida.rfcBase.toUpperCase()

            if (rfcSub10 !== curpBase) {
              emitirBeepError()
              setDiscordanciaRfc({
                curp: curpExtraida.curp,
                curpBase,
                rfc: rfcEncontrado,
                rfcBase: rfcSub10,
              })
              setErrorLectura(
                `Discordancia de Identidad: El RFC escaneado (${rfcEncontrado}) no coincide con la CURP (${curpExtraida.curp}). La raíz esperada era "${curpBase}" pero se detectó "${rfcSub10}".`
              )
              procesandoRef.current = false
              setProcesando(false)
              return
            }
          }

          emitirBeepExito()
          setEscaneoExitosoAnim(true)
          setTimeout(() => setEscaneoExitosoAnim(false), 800)

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
        } else {
          emitirBeepError()
          setErrorLectura('No se detectó un RFC oficial de 13 caracteres ni código de la constancia SAT.')
        }

        procesandoRef.current = false
        setProcesando(false)
        return
      }

      procesandoRef.current = false
      setProcesando(false)
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
        etapa !== 'confirmacion' &&
        !procesandoRef.current
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
        setLeyendoRafaga(false)
        if (timeoutRafagaRef.current) clearTimeout(timeoutRafagaRef.current)
        if (textCapturado.length >= 10) {
          procesarTextoDetectado(textCapturado)
        }
      } else if (e.key.length === 1) {
        bufferLectorRef.current += e.key
        if (bufferLectorRef.current.length >= 4) {
          setLeyendoRafaga(true)
          if (timeoutRafagaRef.current) clearTimeout(timeoutRafagaRef.current)
          timeoutRafagaRef.current = window.setTimeout(() => {
            setLeyendoRafaga(false)
          }, 400)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutRafagaRef.current) clearTimeout(timeoutRafagaRef.current)
    }
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
      domicilio: curpExtraida.domicilio,
      situacionFiscal: curpExtraida.situacionFiscal,
      regimenesFiscales: curpExtraida.regimenesFiscales,
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
        {/* OVERLAY TÁCTICO DE PROCESAMIENTO EN TIEMPO REAL                           */}
        {/* ========================================================================= */}
        {procesando && (
          <div className="absolute inset-0 z-50 bg-[#0A162B]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
            <div className="relative mb-5">
              {/* Anillo de Carga Dorado Giratorio */}
              <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-[#D4AF37] animate-spin shadow-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Barcode className="w-8 h-8 text-[#D4AF37] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-[#D4AF37]/30 inline-block shadow-sm">
                Lectura en Proceso
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {mensajeProceso || 'Procesando Documento...'}
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {submensajeProceso || 'Por favor espera un momento mientras decodificamos y validamos la información.'}
              </p>
            </div>

            {/* Barra de Progreso Indeterminada */}
            <div className="w-56 h-2 bg-slate-800 rounded-full mt-6 overflow-hidden relative border border-slate-700">
              <div className="h-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-200 rounded-full w-28 animate-[pulse_1s_ease-in-out_infinite]" />
            </div>

            <p className="text-[10px] text-slate-400 font-bold mt-4 flex items-center gap-1.5">
              <span>🔒</span>
              <span>Por favor no retires el documento ni dispares nuevamente</span>
            </p>
          </div>
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
                Verificación y Escaneo de Documentos
              </h2>
              <p className="text-[11px] text-[#D4AF37] font-bold tracking-widest uppercase">
                Validación de Identidad y Consulta de Restricciones
              </p>
            </div>
          </div>

          {/* Indicador de Estado del Lector Láser */}
          <div className="flex items-center gap-2">
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition ${
                leyendoRafaga || procesando
                  ? 'bg-amber-500/20 border-[#D4AF37] text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  leyendoRafaga || procesando
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span>
                {leyendoRafaga
                  ? 'Leyendo código...'
                  : procesando
                  ? 'Procesando datos...'
                  : 'Lector Láser HID Listo'}
              </span>
            </div>
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

            {/* Alerta de Error de Lectura */}
            {errorLectura && (
              <div className="w-full max-w-md p-3.5 bg-rose-500/15 border-2 border-rose-500/40 rounded-2xl flex items-center justify-between gap-3 text-rose-300 text-xs font-semibold animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <span>{errorLectura}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorLectura(null)}
                  className="text-slate-400 hover:text-white text-sm px-1 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

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
                      placeholder="Ej: ABCD800101HDFRRN01"
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
                CURP RENAPO Verificada: {curpExtraida.curp}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                ¿Cuentas con tu Cédula del SAT o Constancia Fiscal?
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Apunta tu escáner al código de barras (1D) para registrar tu RFC con homoclave,
                o escanea el código QR del SAT para consultar y precargar tu Domicilio Fiscal oficial.
              </p>
            </div>

            {/* ALERTA DE DISCORDANCIA DE IDENTIDAD (CURP vs RFC) */}
            {discordanciaRfc && (
              <div className="w-full max-w-md p-4 bg-rose-950/80 border-2 border-rose-500 rounded-2xl space-y-3 text-rose-200 animate-in fade-in shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Discordancia de Identidad Detectada</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscordanciaRfc(null)
                      setErrorLectura(null)
                    }}
                    className="text-slate-400 hover:text-white text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  El RFC escaneado no corresponde a la misma persona que la CURP registrada.
                  Por normativa oficial, los primeros 10 caracteres deben ser idénticos:
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[#0A162B] p-2.5 rounded-xl border border-emerald-500/50">
                    <span className="text-[10px] text-emerald-400 block font-sans font-bold uppercase tracking-wider">
                      CURP Registrada
                    </span>
                    <span className="text-white font-bold block truncate" title={discordanciaRfc.curp}>
                      {discordanciaRfc.curp}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-1 font-sans">
                      Raíz: <strong className="text-emerald-400 font-mono text-xs">{discordanciaRfc.curpBase}</strong>
                    </span>
                  </div>

                  <div className="bg-[#0A162B] p-2.5 rounded-xl border border-rose-500/70">
                    <span className="text-[10px] text-rose-400 block font-sans font-bold uppercase tracking-wider">
                      RFC Escaneado
                    </span>
                    <span className="text-rose-200 font-bold block truncate" title={discordanciaRfc.rfc}>
                      {discordanciaRfc.rfc}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-1 font-sans">
                      Raíz: <strong className="text-rose-400 font-mono text-xs">{discordanciaRfc.rfcBase}</strong>
                    </span>
                  </div>
                </div>

                <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-[11px] text-rose-300 flex items-center justify-between gap-2">
                  <span>⚠️ Verifica que el documento físico corresponda a este aspirante.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscordanciaRfc(null)
                      setErrorLectura(null)
                      setInputRfcManual('')
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase shrink-0 transition shadow-sm"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Alerta de Error de Lectura Genérica */}
            {errorLectura && !discordanciaRfc && (
              <div className="w-full max-w-md p-3.5 bg-rose-500/15 border-2 border-rose-500/40 rounded-2xl flex items-center justify-between gap-3 text-rose-300 text-xs font-semibold animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <span>{errorLectura}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorLectura(null)}
                  className="text-slate-400 hover:text-white text-sm px-1 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Guía Visual Táctica de Opciones de Escaneo */}
            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Barcode className="w-4 h-4" />
                  <span>Opción A: Código 1D</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Arroja tu RFC literal de 13 caracteres con homoclave.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <QrCode className="w-4 h-4" />
                  <span>Opción B: Código QR</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Enlaza a tu Cédula Fiscal y autollena tu Domicilio y Régimen.
                </p>
              </div>
            </div>

            {/* Entrada Rápida de RFC con Homoclave o Enlace QR */}
            <div className="w-full max-w-md bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                RFC con Homoclave o Pegar Enlace del SAT:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputRfcManual}
                  onChange={(e) => {
                    const val = e.target.value.trim()
                    if (val.includes('sat.gob.mx') || val.includes('validadorqr.jsf')) {
                      procesarTextoDetectado(val)
                      setInputRfcManual('')
                    } else {
                      setInputRfcManual(val.toUpperCase())
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (inputRfcManual) {
                        procesarTextoDetectado(inputRfcManual)
                      }
                    }
                  }}
                  placeholder={`Ej: ${curpExtraida.rfcBase}7C5`}
                  className="flex-1 px-3 py-2 bg-slate-950 border-2 border-slate-700 rounded-xl font-mono text-xs font-bold text-white uppercase outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  disabled={inputRfcManual.length < 10 || procesando}
                  onClick={() => {
                    procesarTextoDetectado(inputRfcManual)
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Validar</span>
                </button>
              </div>
            </div>

            {/* Botón para continuar con RFC Base */}
            <div className="w-full max-w-md pt-1">
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

            {/* CANDADO DE DUPLICIDAD / NO CONTRATABLE / REINGRESO */}
            {resultadoDuplicidad && (resultadoDuplicidad.esDuplicadoCurp || resultadoDuplicidad.esHomonimo) && (
              <div className="w-full">
                {resultadoDuplicidad.estado === 'no_contratable' ? (
                  <div className="bg-red-950/80 border-2 border-red-500 p-5 rounded-2xl shadow-2xl space-y-3">
                    <div className="flex items-center gap-3 text-red-400 border-b border-red-800 pb-2.5">
                      <ShieldAlert className="w-8 h-8 flex-shrink-0 animate-bounce text-red-500" />
                      <div>
                        <h4 className="font-black text-sm text-white uppercase tracking-wide">
                          🚫 CANDIDATO SIN POSIBILIDAD DE APLICACIÓN
                        </h4>
                        <p className="text-xs text-red-300 font-bold">
                          Veto Administrativo Activo &bull; Decisión Registrada por Dirección General
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#060E1C] p-3.5 rounded-xl border border-red-900/80 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 uppercase font-bold">Folio de Antecedente:</span>
                        <span className="font-mono font-black text-[#D4AF37]">{resultadoDuplicidad.folioExistente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 uppercase font-bold">Aspirante:</span>
                        <span className="font-black text-white">{resultadoDuplicidad.nombreExistente}</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2">
                        <span className="text-red-400 uppercase font-bold block mb-1">Motivo Registrado de Baja/Veto:</span>
                        <p className="text-slate-200 font-semibold bg-red-950/40 p-2.5 rounded-lg border border-red-900/50">
                          {resultadoDuplicidad.coincidencia?.motivoNoContratable || 'Baja no favorable con restricción de recontratación.'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-red-900/40 border border-red-500/50 py-2.5 px-3.5 rounded-xl text-center">
                      <p className="text-xs text-red-200 font-black">
                        ⛔ INSTRUCCIÓN EN CAMPO: Suspender captura de inmediato. Notificar cordialmente al postulante que no cumple con las políticas de reingreso.
                      </p>
                    </div>
                  </div>
                ) : resultadoDuplicidad.esDuplicadoCurp ? (
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
                ) : (
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
                )}
              </div>
            )}

            {/* Ficha Táctica de Identidad */}
            <div className="bg-[#060E1C] border-2 border-[#D4AF37] p-5 sm:p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
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
                      placeholder="Ej: JUAN CARLOS"
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
                      placeholder="Ej: HERNÁNDEZ"
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
                      placeholder="Ej: PÉREZ"
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
                  {curpExtraida.situacionFiscal && (
                    <span className="text-[10px] font-black uppercase text-emerald-400 mt-1 inline-block">
                      ✓ SAT: {curpExtraida.situacionFiscal}
                    </span>
                  )}
                </div>
              </div>

              {/* Ficha de Domicilio Fiscal Oficial Extraído del SAT */}
              {curpExtraida.domicilio && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" />
                      Domicilio Fiscal Oficial Registrado en el SAT
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Se precargará en Paso 3
                    </span>
                  </div>
                  <div className="text-xs text-white font-bold">
                    <p className="text-slate-100 font-extrabold">
                      {curpExtraida.domicilio.calleNumero || curpExtraida.domicilio.direccionCompleta}
                    </p>
                    <p className="text-slate-400 font-semibold text-[11px] mt-0.5">
                      Col. {curpExtraida.domicilio.colonia} &bull; C.P. {curpExtraida.domicilio.codigoPostal} &bull; {curpExtraida.domicilio.municipio || 'Juárez'}, {curpExtraida.domicilio.estado || 'Chihuahua'}
                    </p>
                  </div>
                  {curpExtraida.regimenesFiscales && curpExtraida.regimenesFiscales.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Regímenes:</span>
                      {curpExtraida.regimenesFiscales.map((reg, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">
                          {reg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                  disabled={Boolean(
                    resultadoDuplicidad?.estado === 'no_contratable' ||
                    (resultadoDuplicidad?.esDuplicadoCurp && !marcadoComoReingreso)
                  )}
                  className={`w-full sm:w-auto py-3 px-6 rounded-xl text-xs font-black transition shadow-xl flex items-center justify-center gap-2 ${
                    resultadoDuplicidad?.estado === 'no_contratable'
                      ? 'bg-red-950/80 text-red-400 cursor-not-allowed border-2 border-red-500'
                      : resultadoDuplicidad?.esDuplicadoCurp && !marcadoComoReingreso
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-[#D4AF37] text-[#0A162B] hover:bg-amber-400 hover:scale-102 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {resultadoDuplicidad?.estado === 'no_contratable'
                      ? 'Captura Bloqueada (No Contratable)'
                      : 'Confirmar e Iniciar Solicitud Digital'}
                  </span>
                </button>

                {resultadoDuplicidad?.estado === 'no_contratable' && (
                  <span className="text-[10px] text-red-400 font-bold">
                    * Candidato sin posibilidad de aplicación por veto administrativo
                  </span>
                )}

                {resultadoDuplicidad?.esDuplicadoCurp &&
                  resultadoDuplicidad?.estado !== 'no_contratable' &&
                  !marcadoComoReingreso && (
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
          <span>Protocolo de Seguridad Patrimonial &bull; Verificación de Identidad</span>
          <span>Validación Algorítmica RENAPO / SAT</span>
        </div>
      </div>
    </div>
  )
}
