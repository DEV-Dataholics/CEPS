import React, { useState } from 'react'
import {
  Phone,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Download,
  Share2,
  Check,
  FileCheck,
  RotateCcw,
  UserCheck,
  Edit3,
  ShieldCheck,
  MapPin,
  Briefcase,
  AlertTriangle,
  Sparkles,
  Trash2,
  X,
  Search,
  QrCode,
} from 'lucide-react'
import { LocationPicker } from '../components/LocationPicker'
import { generateCepsReceiptPdf } from '../lib/generateCepsReceiptPdf'
import { useCandidateStore } from '../store/candidateStore'
import { useVacancyStore } from '../store/vacancyStore'
import { useCatalogStore } from '../store/catalogStore'
import { DocumentScannerGate } from '../components/DocumentScannerGate'

interface CandidateRegistrationViewProps {
  onConsultarEstatus?: (folio: string) => void
}

export const CandidateRegistrationView: React.FC<CandidateRegistrationViewProps> = ({
  onConsultarEstatus,
}) => {
  const {
    pasoActual,
    formData,
    folioAsignado,
    guardando,
    mostrarGateEscaneo,
    curpVerificada,
    datosExtraidosCurp,
    esReingreso,
    confirmarAbordajeEscaneo,
    activarReescaneo,
    setPaso,
    siguientePaso,
    anteriorPaso,
    actualizarPaso1,
    actualizarPaso2,
    actualizarDomicilio,
    actualizarDocumento,
    setConfirmoVeracidad,
    setGuardando,
    setFolioAsignado,
    reiniciarBorrador,
    cargarDatosDemo,
    validarPaso1,
    validarPaso2,
    validarPaso3,
    validarPaso5,
  } = useCandidateStore()

  const { modulos, puestos, turnos } = useCatalogStore()
  const modulosActivos = modulos.filter((m) => m.estatus === 'activo')
  const puestosActivos = puestos.filter((p) => p.estatus === 'activo')
  const turnosActivos = turnos.filter((t) => t.estatus === 'activo')

  const [erroresLocales, setErroresLocales] = useState<Record<string, string>>({})
  const [modalReinicioOpen, setModalReinicioOpen] = useState(false)
  const [toastMensaje, setToastMensaje] = useState<string | null>(null)

  // Manejo de carga de fotos simulada con File Reader
  const handleFotoChange = (tipo: 'ine' | 'rfc' | 'noPenales', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        actualizarDocumento(tipo, (uploadEvent.target?.result as string) || null)
      }
      reader.readAsDataURL(file)
    }
  }

  // Validación de paso actual antes de avanzar (Heurística 5: Prevención de errores)
  const manejarAvanzar = () => {
    setErroresLocales({})
    if (pasoActual === 1) {
      const { valido, errores } = validarPaso1()
      if (!valido) {
        setErroresLocales(errores)
        return
      }
    } else if (pasoActual === 2) {
      const { valido, errores } = validarPaso2()
      if (!valido) {
        setErroresLocales(errores)
        return
      }
    } else if (pasoActual === 3) {
      const { valido, errores } = validarPaso3()
      if (!valido) {
        setErroresLocales(errores)
        return
      }
    }
    siguientePaso()
  }

  // Finalizar postulación desde el Paso 5 (Revisión Final)
  const finalizarPostulacion = () => {
    const { valido, errores } = validarPaso5()
    if (!valido) {
      setErroresLocales(errores)
      return
    }

    setGuardando(true)
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000)
    const nuevoFolio = `CEPS-2026-${numeroAleatorio}`
    setFolioAsignado(nuevoFolio)

    setTimeout(() => {
      setGuardando(false)
      setPaso(6) // Paso 6: Confirmación & Voucher

      const nombreCompleto = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`
      const docsAdjuntos = []
      if (formData.documentos.ine) docsAdjuntos.push('Identificación Oficial (INE)')
      if (formData.documentos.rfc) docsAdjuntos.push('Constancia de Situación Fiscal (RFC con QR)')
      if (formData.documentos.noPenales) docsAdjuntos.push('Carta de No Antecedentes Penales')
      if (docsAdjuntos.length === 0) docsAdjuntos.push('Fotografías capturadas en módulo de abordaje')

      generateCepsReceiptPdf({
        folio: nuevoFolio,
        nombre: nombreCompleto,
        telefono: formData.telefono,
        curp: formData.curp,
        rfc: formData.rfc,
        puesto: formData.puesto,
        modulo: formData.modulo,
        domicilio: formData.domicilio.calleNumero,
        colonia: formData.domicilio.colonia,
        coordenadas: `Lat: ${formData.domicilio.latitud}, Lng: ${formData.domicilio.longitud}`,
        fechaRegistro: new Date().toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        documentosAdjuntos: docsAdjuntos,
      })

      // Registrar reactivamente en la bandeja de entrada del Administrador de Vacantes
      useVacancyStore.getState().registrarAspiranteDesdePortal({
        folio: nuevoFolio,
        nombre: formData.nombre,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        telefono: formData.telefono,
        edad: formData.edad,
        curp: formData.curp,
        rfc: formData.rfc,
        puestoDeseado: formData.puesto,
        moduloAbordaje: formData.modulo,
        fechaCaptura: 'hoy',
        fechaEtiqueta: `Hoy, ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
        colonia: formData.domicilio.colonia,
        zonaJuarez: formData.domicilio.colonia,
        latitud: formData.domicilio.latitud,
        longitud: formData.domicilio.longitud,
        estatus: 'nuevo',
        documentosAdjuntos: docsAdjuntos,
      })
    }, 1200)
  }

  const enviarWhatsAppReclutador = () => {
    const texto = `Hola CEPS, acabo de registrar mi solicitud con el Folio *${folioAsignado}*. Mi nombre es ${formData.nombre} ${formData.apellidoPaterno}. Quedo atento a la fecha de evaluación médica.`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  const pasosNombres = [
    'Datos Personales',
    'Puesto & Módulo',
    'Domicilio & Croquis',
    'Documentos',
    'Revisión Final',
  ]

  // Si la estación de escaneo está activa y no se ha emitido el folio final
  if (mostrarGateEscaneo && !folioAsignado) {
    return (
      <div className="w-full flex-1 flex flex-col overflow-y-auto bg-slate-900">
        <DocumentScannerGate
          onConfirmar={(datos, reingreso) => {
            confirmarAbordajeEscaneo(datos, reingreso)
            setToastMensaje(
              reingreso
                ? 'Identidad precargada [AUTORIZADO COMO EXPEDIENTE DE REINGRESO].'
                : 'Identidad oficial verificada y precargada exitosamente.'
            )
            setTimeout(() => setToastMensaje(null), 3500)
          }}
        />
      </div>
    )
  }

  return (
    <div className="w-full flex-1 flex flex-col font-sans">
      {/* HEADER INSTITUCIONAL EXCLUSIVO CON LOGO SOBRE AZUL PROFUNDO */}
      <header className="bg-[#0A162B] text-white py-3.5 px-4 sm:px-6 border-b-2 border-slate-800 shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A162B] border-2 border-[#D4AF37] flex items-center justify-center text-white font-extrabold text-base shadow-lg overflow-hidden flex-shrink-0">
              <img
                src="/ceps-logo.png"
                alt="CEPS"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement!.innerText = 'CEPS'
                }}
              />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#D4AF37] uppercase tracking-wider">
                Portal de Postulación Digital
              </p>
              <h1 className="text-sm sm:text-base font-extrabold text-white">
                Registro Oficial de Candidato
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón para regresar a la Estación de Escáner */}
            <button
              type="button"
              onClick={activarReescaneo}
              title="Volver a la estación de escaneo de CURP/RFC"
              className="px-2.5 py-1.5 text-xs text-[#0A162B] bg-[#D4AF37] hover:bg-amber-400 rounded-lg transition flex items-center gap-1.5 font-black shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Re-escanear Documento</span>
            </button>

            <button
              type="button"
              onClick={() => {
                cargarDatosDemo()
                setToastMensaje('Datos demo de aspirante cargados exitosamente.')
                setTimeout(() => setToastMensaje(null), 3000)
              }}
              title="Cargar datos de ejemplo"
              className="px-2.5 py-1.5 text-xs text-amber-300 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-900/50 rounded-lg border border-amber-500/40 transition flex items-center gap-1.5 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Cargar Demo</span>
            </button>

            <button
              type="button"
              onClick={() => setModalReinicioOpen(true)}
              title="Reiniciar borrador a campos vacíos"
              className="px-2.5 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition flex items-center gap-1.5 font-bold shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Nuevo Registro</span>
            </button>

            <div className="text-right ml-1">
              <span className="text-xs font-mono font-extrabold px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-200">
                {pasoActual <= 5 ? `Paso ${pasoActual} de 5` : 'Completado'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MODAL UI DE CONFIRMACIÓN DE NUEVO REGISTRO (SIN DIALOGS NATIVOS BLOQUEANTES) */}
      {modalReinicioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-extrabold text-[#0A162B]">¿Iniciar Nuevo Registro?</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalReinicioOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              Esta acción limpiará todos los campos del aspirante actual y comenzará un expediente en blanco desde el <strong>Paso 1</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalReinicioOpen(false)}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  reiniciarBorrador()
                  setErroresLocales({})
                  setModalReinicioOpen(false)
                  setToastMensaje('Formulario en blanco listo para nuevo aspirante.')
                  setTimeout(() => setToastMensaje(null), 3000)
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Sí, Limpiar Formulario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST DE FEEDBACK TEMPORAL */}
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A162B] text-white px-4 py-3 rounded-xl border-2 border-[#D4AF37] shadow-xl text-xs font-extrabold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMensaje}</span>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL RESPONSIVE & MOBILE-FIRST */}
      <main className="max-w-3xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col">
        {pasoActual <= 5 ? (
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col">
            {/* STEPPER HEURÍSTICA 2: VISIBILIDAD DEL ESTADO */}
            <div className="w-full bg-slate-100 border-b-2 border-slate-200">
              <div
                className="bg-[#D4AF37] h-1.5 transition-all duration-300"
                style={{ width: `${(pasoActual / 5) * 100}%` }}
              ></div>
              <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 text-xs">
                {pasosNombres.map((nombre, idx) => {
                  const num = idx + 1
                  const activo = pasoActual === num
                  const completado = pasoActual > num
                  return (
                    <button
                      key={nombre}
                      type="button"
                      disabled={num > pasoActual}
                      onClick={() => setPaso(num)}
                      className={`flex items-center gap-1.5 py-1 px-2 rounded-lg font-bold transition whitespace-nowrap ${
                        activo
                          ? 'bg-[#0A162B] text-[#D4AF37]'
                          : completado
                          ? 'text-emerald-700 hover:bg-slate-200 cursor-pointer'
                          : 'text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-extrabold ${
                          activo
                            ? 'bg-[#D4AF37] text-[#0A162B]'
                            : completado
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {completado ? <Check className="w-3 h-3" /> : num}
                      </span>
                      <span className="hidden md:inline">{nombre}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* CABECERA DEL PASO ACTUAL */}
            <div className="px-4 sm:px-6 py-4 bg-[#F8FAFC] border-b-2 border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A162B] text-[#D4AF37] font-extrabold text-base flex items-center justify-center shadow-sm flex-shrink-0">
                  {pasoActual}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0A162B]">
                    {pasoActual === 1 && '1. Datos Personales & Contacto'}
                    {pasoActual === 2 && '2. Puesto & Módulo de Abordaje'}
                    {pasoActual === 3 && '3. Domicilio & Croquis Digital'}
                    {pasoActual === 4 && '4. Fotografías de Documentos'}
                    {pasoActual === 5 && '5. Checkpoint de Revisión Final'}
                  </h2>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {pasoActual === 1 && 'Captura la información oficial para el expediente del aspirante.'}
                    {pasoActual === 2 && 'Indica la vacante, el módulo de reclutamiento y la disponibilidad.'}
                    {pasoActual === 3 && 'Ubica el domicilio con el pin interactivo sustituyendo el croquis a mano.'}
                    {pasoActual === 4 && 'Adjunta fotografías de INE, RFC y antecedentes penales.'}
                    {pasoActual === 5 && 'Mecanismo de seguridad: confirma la veracidad antes de persistir.'}
                  </p>
                </div>
              </div>
            </div>

            {/* ALERTAS DE ERROR ZOD (HEURÍSTICA 5) */}
            {Object.keys(erroresLocales).length > 0 && (
              <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-red-50 border-2 border-red-300 rounded-xl text-xs text-red-900 font-bold flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold">Por favor completa los siguientes campos requeridos:</p>
                  <ul className="list-disc list-inside mt-1 font-semibold space-y-0.5">
                    {Object.values(erroresLocales).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* CUERPO DEL PASO */}
            <div className="p-4 sm:p-6 flex flex-col gap-5">
              {/* PASO 1 */}
              {pasoActual === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Banner de Verificación de Escáner */}
                  {curpVerificada && datosExtraidosCurp && (
                    <div
                      className={`sm:col-span-2 border-2 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs ${
                        esReingreso
                          ? 'bg-amber-50 border-amber-400 text-amber-950'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                            esReingreso
                              ? 'bg-amber-100 border-amber-400 text-amber-800'
                              : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs block">
                              Identidad Oficial Verificada por Escáner
                            </span>
                            {esReingreso && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-400">
                                Expediente de Reingreso
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-semibold ${
                              esReingreso ? 'text-amber-800' : 'text-emerald-800'
                            }`}
                          >
                            {[formData.nombre, formData.apellidoPaterno, formData.apellidoMaterno]
                              .filter(Boolean)
                              .join(' ') || 'Aspirante'}{' '}
                            &bull; CURP: {datosExtraidosCurp.curp} &bull; Nacimiento:{' '}
                            {datosExtraidosCurp.fechaNacimiento} ({datosExtraidosCurp.nombreEntidad}) &bull;{' '}
                            {datosExtraidosCurp.edad} años
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={activarReescaneo}
                        className={`px-3 py-1.5 text-xs font-black bg-white border rounded-xl hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5 ${
                          esReingreso
                            ? 'text-amber-900 border-amber-400'
                            : 'text-emerald-900 border-emerald-400'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Re-escanear
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900">
                        Nombre(s) *
                      </label>
                      {curpVerificada && formData.nombre && (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Verificado por Documento
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Jorge Alejandro"
                      value={formData.nombre}
                      onChange={(e) => actualizarPaso1({ nombre: e.target.value })}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none ${
                        curpVerificada && formData.nombre
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900">
                        Apellido Paterno *
                      </label>
                      {curpVerificada && formData.apellidoPaterno && (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Verificado
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Medina"
                      value={formData.apellidoPaterno}
                      onChange={(e) => actualizarPaso1({ apellidoPaterno: e.target.value })}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none ${
                        curpVerificada && formData.apellidoPaterno
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900">
                        Apellido Materno *
                      </label>
                      {curpVerificada && formData.apellidoMaterno && (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Verificado
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Castillo"
                      value={formData.apellidoMaterno}
                      onChange={(e) => actualizarPaso1({ apellidoMaterno: e.target.value })}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none ${
                        curpVerificada && formData.apellidoMaterno
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-900">
                      Teléfono Celular (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="(656) 000-0000"
                        value={formData.telefono}
                        onChange={(e) => actualizarPaso1({ telefono: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-mono font-bold tabular-nums text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900">
                        Edad (Años) *
                      </label>
                      {curpVerificada && (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                          ✓ Verificado por CURP
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="Ej. 34"
                      value={formData.edad}
                      onChange={(e) => actualizarPaso1({ edad: e.target.value })}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-mono font-bold tabular-nums text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none ${
                        curpVerificada
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900">
                        Sexo *
                      </label>
                      {curpVerificada && (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                          ✓ Verificado por CURP
                        </span>
                      )}
                    </div>
                    <select
                      value={formData.sexo}
                      onChange={(e) => actualizarPaso1({ sexo: e.target.value as 'Masculino' | 'Femenino' | 'Otro' })}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none ${
                        curpVerificada
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-900">
                      Estado Civil *
                    </label>
                    <select
                      value={formData.estadoCivil}
                      onChange={(e) => actualizarPaso1({ estadoCivil: e.target.value })}
                      className="px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
                    >
                      <option value="Soltero">Soltero(a)</option>
                      <option value="Casado">Casado(a)</option>
                      <option value="Unión Libre">Unión Libre</option>
                      <option value="Divorciado">Divorciado(a)</option>
                      <option value="Viudo">Viudo(a)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900">
                        CURP (18 Caracteres) *
                      </label>
                      {curpVerificada && (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                          ✓ Oficial RENAPO
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      placeholder="Ej. MECJ920514HCHDRR08"
                      value={formData.curp}
                      onChange={(e) => actualizarPaso1({ curp: e.target.value.toUpperCase() })}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-mono font-bold uppercase text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none ${
                        curpVerificada
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900">
                        RFC con Homoclave *
                      </label>
                      {curpVerificada && (
                        <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                          {datosExtraidosCurp?.rfcCompleto ? '✓ Oficial SAT' : 'Prefijo Base'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={13}
                      placeholder="Ej. MECJ920514QR3"
                      value={formData.rfc}
                      onChange={(e) => actualizarPaso1({ rfc: e.target.value.toUpperCase() })}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-mono font-bold uppercase text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none ${
                        curpVerificada
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {pasoActual === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-900">
                      Módulo CEPS de Abordaje *
                    </label>
                    <select
                      value={formData.modulo}
                      onChange={(e) => actualizarPaso2({ modulo: e.target.value })}
                      className="px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
                    >
                      {modulosActivos.length > 0 ? (
                        modulosActivos.map((m) => (
                          <option key={m.id} value={m.nombre}>
                            {m.nombre} ({m.zona})
                          </option>
                        ))
                      ) : (
                        <option value={formData.modulo}>{formData.modulo}</option>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-900">
                      Puesto al que se postula *
                    </label>
                    <select
                      value={formData.puesto}
                      onChange={(e) => actualizarPaso2({ puesto: e.target.value })}
                      className="px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
                    >
                      {puestosActivos.length > 0 ? (
                        puestosActivos.map((p) => (
                          <option key={p.id} value={p.titulo}>
                            {p.titulo} (${p.sueldoSugeridoSemanalNeto.toLocaleString('es-MX')} /sem)
                          </option>
                        ))
                      ) : (
                        <option value={formData.puesto}>{formData.puesto}</option>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-900">
                      Disponibilidad de Turno *
                    </label>
                    <select
                      value={formData.turno}
                      onChange={(e) => actualizarPaso2({ turno: e.target.value })}
                      className="px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
                    >
                      {turnosActivos.length > 0 ? (
                        turnosActivos.map((t) => (
                          <option key={t.id} value={t.nombre}>
                            {t.nombre} ({t.horarioEntradaSalida})
                          </option>
                        ))
                      ) : (
                        <option value={formData.turno}>{formData.turno}</option>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-900">
                      Experiencia Previa en Seguridad *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Sí (3 años en maquiladora de autopartes)"
                      value={formData.experienciaPrevia}
                      onChange={(e) => actualizarPaso2({ experienciaPrevia: e.target.value })}
                      className="px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-900">
                      ¿Cómo se enteró de la vacante?
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Facebook, módulo en la calle, recomendado por compañero"
                      value={formData.comoSeEntero}
                      onChange={(e) => actualizarPaso2({ comoSeEntero: e.target.value })}
                      className="px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* PASO 3 */}
              {pasoActual === 3 && (
                <LocationPicker
                  valor={formData.domicilio}
                  onChange={(nuevoDomicilio) => actualizarDomicilio(nuevoDomicilio)}
                />
              )}

              {/* PASO 4 */}
              {pasoActual === 4 && (
                <div className="flex flex-col gap-5">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-xs text-blue-900 font-semibold leading-relaxed">
                    Toma o sube una fotografía clara de tus documentos principales. Esto acelera tu aprobación en la mesa de validación sin necesidad de fotocopias adicionales.
                  </div>

                  {/* 1. INE */}
                  <div className="p-4 bg-[#F8FAFC] border-2 border-slate-200 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-[#0A162B]" />
                        <span className="text-sm font-extrabold text-slate-900">1. Identificación Oficial (INE) *</span>
                      </div>
                      {formData.documentos.ine && (
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Foto Cargada
                        </span>
                      )}
                    </div>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-100/70 transition cursor-pointer bg-white">
                      <Camera className="w-8 h-8 text-[#0A162B] mb-1" />
                      <span className="text-xs font-bold text-[#0A162B]">Tomar Foto o Seleccionar de Galería</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">Asegúrate de que sea legible</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFotoChange('ine', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 2. RFC */}
                  <div className="p-4 bg-[#F8FAFC] border-2 border-slate-200 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-[#0A162B]" />
                        <span className="text-sm font-extrabold text-slate-900">2. Constancia de Situación Fiscal (RFC con QR) *</span>
                      </div>
                      {formData.documentos.rfc && (
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Foto Cargada
                        </span>
                      )}
                    </div>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-100/70 transition cursor-pointer bg-white">
                      <Camera className="w-8 h-8 text-[#0A162B] mb-1" />
                      <span className="text-xs font-bold text-[#0A162B]">Tomar Foto del Documento o Código QR</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFotoChange('rfc', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 3. Carta No Penales */}
                  <div className="p-4 bg-[#F8FAFC] border-2 border-slate-200 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-[#0A162B]" />
                        <span className="text-sm font-extrabold text-slate-900">3. Carta de No Penales o Certificado de Estudios</span>
                      </div>
                      {formData.documentos.noPenales && (
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Foto Cargada
                        </span>
                      )}
                    </div>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-100/70 transition cursor-pointer bg-white">
                      <Camera className="w-8 h-8 text-[#0A162B] mb-1" />
                      <span className="text-xs font-bold text-[#0A162B]">Tomar Foto o Archivo Digital</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFotoChange('noPenales', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* PASO 5: REVISIÓN FINAL CONSOLIDADA (MECANISMO DE SEGURIDAD) */}
              {pasoActual === 5 && (
                <div className="flex flex-col gap-6">
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#0A162B] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0A162B]">Checkpoint de Integridad de Datos</h4>
                      <p className="text-xs font-semibold text-amber-900 mt-0.5">
                        Verifica que todos los datos capturados correspondan exactamente con los documentos físicos antes de generar el folio oficial y persistir en la base de datos.
                      </p>
                    </div>
                  </div>

                  {/* Resumen 1: Datos Personales */}
                  <div className="bg-[#F8FAFC] border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#0A162B]" />
                        <span className="text-xs font-extrabold text-[#0A162B] uppercase tracking-wider">Identidad y Contacto</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaso(1)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block">Nombre Completo:</span>
                        <span className="font-extrabold text-slate-900">{formData.nombre} {formData.apellidoPaterno} {formData.apellidoMaterno}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Teléfono / WhatsApp:</span>
                        <span className="font-extrabold text-slate-900 font-mono">{formData.telefono}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">CURP:</span>
                        <span className="font-extrabold text-slate-900 font-mono">{formData.curp}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">RFC:</span>
                        <span className="font-extrabold text-slate-900 font-mono">{formData.rfc}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen 2: Puesto y Módulo */}
                  <div className="bg-[#F8FAFC] border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#0A162B]" />
                        <span className="text-xs font-extrabold text-[#0A162B] uppercase tracking-wider">Puesto y Asignación</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaso(2)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block">Puesto:</span>
                        <span className="font-extrabold text-slate-900">{formData.puesto}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Módulo de Abordaje:</span>
                        <span className="font-extrabold text-slate-900">{formData.modulo}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Disponibilidad de Turno:</span>
                        <span className="font-extrabold text-slate-900">{formData.turno}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen 3: Domicilio & Coordenadas */}
                  <div className="bg-[#F8FAFC] border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#0A162B]" />
                        <span className="text-xs font-extrabold text-[#0A162B] uppercase tracking-wider">Ubicación y Georreferencia</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaso(3)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block">Dirección:</span>
                        <span className="font-extrabold text-slate-900">{formData.domicilio.calleNumero}, {formData.domicilio.colonia} (CP: {formData.domicilio.codigoPostal})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Coordenadas Pin-Drop:</span>
                        <span className="font-extrabold text-[#0A162B] font-mono">
                          Lat: {formData.domicilio.latitud.toFixed(4)}, Lng: {formData.domicilio.longitud.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox de Protesta de Decir Verdad (Heurística 5) */}
                  <label className="p-4 bg-slate-50 border-2 border-slate-300 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={formData.confirmoVeracidad}
                      onChange={(e) => setConfirmoVeracidad(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-400 text-[#0A162B] focus:ring-[#0A162B] mt-0.5"
                    />
                    <div className="text-xs">
                      <span className="font-extrabold text-slate-900 block">
                        Declaro bajo protesta de decir verdad que los datos y documentos proporcionados son verídicos.
                      </span>
                      <span className="text-slate-600 font-medium">
                        Autorizo a CEPS Paso del Norte a verificar mis referencias laborales y realizar las evaluaciones médicas y de antidoping pertinentes.
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* BARRA INFERIOR DE ACCIÓN (TOUCH TARGETS >= 48px) */}
            <div className="p-4 sm:p-5 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-between gap-3">
              {pasoActual > 1 ? (
                <button
                  type="button"
                  onClick={anteriorPaso}
                  className="px-4 sm:px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-800 bg-white font-bold text-sm hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Borrador guardado localmente</span>
                </div>
              )}

              {pasoActual < 5 ? (
                <button
                  type="button"
                  onClick={manejarAvanzar}
                  className="px-6 sm:px-8 py-3 rounded-xl bg-[#0A162B] text-white font-extrabold text-sm hover:bg-slate-800 transition shadow-md flex items-center gap-2"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finalizarPostulacion}
                  disabled={guardando || !formData.confirmoVeracidad}
                  className="px-6 sm:px-8 py-3 rounded-xl bg-[#D4AF37] text-[#0A162B] font-extrabold text-sm hover:bg-[#C59F2D] transition shadow-md flex items-center gap-2 disabled:opacity-60"
                >
                  {guardando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0A162B] border-t-transparent rounded-full animate-spin"></div>
                      <span>Generando Folio &amp; PDF...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#0A162B]" />
                      <span>Finalizar y Emitir Comprobante</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* PASO 6: CONFIRMACIÓN DEFINITIVA Y COMPROBANTE OFICIAL */
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden p-6 sm:p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 border-2 border-emerald-300 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 uppercase tracking-wider">
              Solicitud Registrada Exitosamente
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A162B] mt-2">
              ¡Bienvenido a CEPS Paso del Norte!
            </h2>
            <p className="text-sm font-semibold text-slate-600 mt-1 max-w-md">
              Tu información ha quedado registrada en la plataforma. Tu comprobante oficial en PDF ha sido generado y descargado.
            </p>

            {/* TARJETA DEL FOLIO OFICIAL */}
            <div className="my-6 p-6 bg-[#0A162B] text-white rounded-2xl border-2 border-[#D4AF37] shadow-lg w-full max-w-md flex flex-col items-center">
              <span className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-wider">
                Tu Folio Oficial de Aspirante
              </span>
              <span className="text-3xl sm:text-4xl font-mono font-extrabold tracking-wider mt-1 text-white tabular-nums">
                {folioAsignado}
              </span>
              <p className="text-xs text-slate-300 mt-2 font-medium">
                {formData.nombre} {formData.apellidoPaterno} &bull; {formData.puesto}
              </p>
            </div>

            {/* AVISO INSTITUCIONAL DE PRÓXIMOS PASOS (EVALUACIÓN MÉDICA Y ANTIDOPING) */}
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl w-full max-w-md text-left flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-blue-900">
                  Pronto recibirás más información sobre tu evaluación médica y antidoping:
                </p>
                <p className="text-xs text-blue-800 font-medium mt-1 leading-relaxed">
                  El equipo de Reclutamiento de CEPS se comunicará directamente contigo vía llamada o WhatsApp para coordinar tu cita, horario y los siguientes pasos para tu contratación.
                </p>
              </div>
            </div>

            {/* ACCIONES DE SEGUIMIENTO */}
            <div className="flex flex-col gap-3 w-full max-w-md">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    const nombreCompleto = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`
                    generateCepsReceiptPdf({
                      folio: folioAsignado || 'CEPS-2026-0000',
                      nombre: nombreCompleto,
                      telefono: formData.telefono,
                      curp: formData.curp,
                      rfc: formData.rfc,
                      puesto: formData.puesto,
                      modulo: formData.modulo,
                      domicilio: formData.domicilio.calleNumero,
                      colonia: formData.domicilio.colonia,
                      coordenadas: `Lat: ${formData.domicilio.latitud}, Lng: ${formData.domicilio.longitud}`,
                      fechaRegistro: new Date().toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      documentosAdjuntos: ['Documentos Digitalizados en Origen'],
                    })
                  }}
                  className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-900 rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5 text-slate-700" />
                  Descargar PDF Nuevamente
                </button>

                <button
                  type="button"
                  onClick={enviarWhatsAppReclutador}
                  className="w-full py-3 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-md flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Enviar Folio por WhatsApp
                </button>
              </div>

              {onConsultarEstatus && (
                <button
                  type="button"
                  onClick={() => onConsultarEstatus(folioAsignado || '')}
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#C59F2D] text-[#0A162B] rounded-xl text-sm font-extrabold transition shadow-md flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Rastrear Estatus de mi Folio en Línea</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  reiniciarBorrador()
                  setErroresLocales({})
                  setToastMensaje('Formulario listo para nuevo aspirante.')
                  setTimeout(() => setToastMensaje(null), 3000)
                }}
                className="w-full py-3 bg-[#0A162B] hover:bg-slate-800 text-white rounded-xl text-sm font-extrabold transition shadow-md flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                Registrar Siguiente Aspirante (En Blanco)
              </button>
            </div>

            <div className="mt-8 text-xs font-semibold text-slate-500 border-t border-slate-200 pt-4 w-full max-w-md">
              Presenta este comprobante en el <strong>{formData.modulo}</strong> para la aplicación de tu evaluación médica y toxicológica.
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
