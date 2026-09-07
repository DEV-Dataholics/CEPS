import React, { useState } from 'react'
import {
  Search,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  AlertCircle,
  Download,
  Share2,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react'
import { useVacancyStore, type AspiranteSolicitud } from '../store/vacancyStore'
import { generateCepsReceiptPdf } from '../lib/generateCepsReceiptPdf'

export const CandidateStatusTrackingView: React.FC = () => {
  const { aspirantes, vacantes } = useVacancyStore()
  const [folioBusqueda, setFolioBusqueda] = useState<string>('CEPS-2026-4892')
  const [candidatoEncontrado, setCandidatoEncontrado] = useState<AspiranteSolicitud | null>(() => {
    return aspirantes.find((a) => a.folio.toUpperCase() === 'CEPS-2026-4892') || aspirantes[0] || null
  })
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorBusqueda(null)
    const termino = folioBusqueda.trim().toUpperCase()

    if (!termino) {
      setErrorBusqueda('Ingresa un número de folio o teléfono válido.')
      return
    }

    const encontrado = aspirantes.find(
      (a) =>
        a.folio.toUpperCase() === termino ||
        a.telefono.replace(/\D/g, '') === termino.replace(/\D/g, '') ||
        a.curp.toUpperCase() === termino
    )

    if (encontrado) {
      setCandidatoEncontrado(encontrado)
    } else {
      setErrorBusqueda(`No se encontró ninguna solicitud con el folio "${folioBusqueda}". Verifica que esté escrito correctamente (ej. CEPS-2026-XXXX).`)
      setCandidatoEncontrado(null)
    }
  }

  const vacanteAsignada = candidatoEncontrado?.vacanteAsignadaId
    ? vacantes.find((v) => v.id === candidatoEncontrado.vacanteAsignadaId)
    : null

  // Descargar comprobante oficial de nuevo
  const handleDescargarComprobante = () => {
    if (!candidatoEncontrado) return
    generateCepsReceiptPdf({
      folio: candidatoEncontrado.folio,
      nombre: `${candidatoEncontrado.nombre} ${candidatoEncontrado.apellidoPaterno} ${candidatoEncontrado.apellidoMaterno}`,
      telefono: candidatoEncontrado.telefono,
      curp: candidatoEncontrado.curp,
      rfc: candidatoEncontrado.rfc,
      puesto: candidatoEncontrado.puestoDeseado,
      modulo: candidatoEncontrado.moduloAbordaje,
      domicilio: candidatoEncontrado.colonia,
      colonia: candidatoEncontrado.colonia,
      coordenadas: `Lat: ${candidatoEncontrado.latitud}, Lng: ${candidatoEncontrado.longitud}`,
      fechaRegistro: candidatoEncontrado.fechaEtiqueta,
      documentosAdjuntos: candidatoEncontrado.documentosAdjuntos,
    })
  }

  return (
    <div className="flex-1 flex flex-col font-sans bg-[#EDF2F7]">
      {/* HEADER INSTITUCIONAL */}
      <header className="bg-[#0A162B] text-white py-5 px-4 sm:px-8 border-b-2 border-slate-800 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-[#060E1C] p-2 rounded-xl border border-slate-700 shadow-inner">
              <img src="/ceps-logo.png" alt="CEPS Paso del Norte" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-[#D4AF37] uppercase tracking-wider">
                Portal de Autoconsulta en Línea
              </span>
              <h1 className="text-base sm:text-lg font-extrabold text-white">
                Consulta el Estatus de tu Solicitud
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-300 font-semibold block">Sin necesidad de contraseña</span>
            <span className="text-[11px] text-[#D4AF37] font-bold">Rastreo oficial con tu Folio CEPS</span>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col gap-6">
        {/* BUSCADOR DE FOLIO DE ALTO IMPACTO */}
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md">
          <h2 className="text-sm font-extrabold text-[#0A162B] mb-2">
            Ingresa tu Folio de Candidato o Teléfono Celular
          </h2>
          <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={folioBusqueda}
                onChange={(e) => setFolioBusqueda(e.target.value)}
                placeholder="Ej. CEPS-2026-4892 o tu teléfono a 10 dígitos..."
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border-2 border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/10 outline-none uppercase placeholder:normal-case"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#0A162B] hover:bg-slate-800 text-white rounded-xl text-sm font-extrabold transition shadow-md flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>Consultar Estatus</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </form>

          {/* EJEMPLOS RÁPIDOS PARA PRUEBAS */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-500">
            <span>Folios de prueba rápida:</span>
            {aspirantes.slice(0, 3).map((asp) => (
              <button
                key={asp.id}
                type="button"
                onClick={() => {
                  setFolioBusqueda(asp.folio)
                  setCandidatoEncontrado(asp)
                  setErrorBusqueda(null)
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[#0A162B] font-mono font-extrabold border border-slate-300 transition"
              >
                {asp.folio}
              </button>
            ))}
          </div>

          {errorBusqueda && (
            <div className="mt-4 p-3.5 bg-red-50 border-2 border-red-300 rounded-xl text-xs text-red-900 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorBusqueda}</span>
            </div>
          )}
        </div>

        {/* DETALLE DEL ESTATUS DEL ASPIRANTE ENCONTRADO */}
        {candidatoEncontrado && (
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col animate-in fade-in">
            {/* CABECERA CON PLACA DE FOLIO Y NOMBRE */}
            <div className="p-6 bg-[#0A162B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-800">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#060E1C] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-inner flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold tracking-wider bg-[#D4AF37] text-[#0A162B] px-2.5 py-1 rounded-md shadow-xs">
                      {candidatoEncontrado.folio}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Capturado en: {candidatoEncontrado.moduloAbordaje}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                    {candidatoEncontrado.nombre} {candidatoEncontrado.apellidoPaterno} {candidatoEncontrado.apellidoMaterno}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    Puesto Solicitado: <strong>{candidatoEncontrado.puestoDeseado}</strong> &bull; {candidatoEncontrado.colonia}
                  </p>
                </div>
              </div>

              {/* BADGE DE ESTADO GLOBAL */}
              <div>
                {candidatoEncontrado.estatus === 'asignado' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ¡Asignado a Empresa!
                  </span>
                ) : candidatoEncontrado.estatus === 'en_espera' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400">
                    <Clock className="w-4 h-4 text-amber-400" />
                    En Cartera Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400">
                    <Sparkles className="w-4 h-4 text-blue-300" />
                    En Revisión de Vacantes
                  </span>
                )}
              </div>
            </div>

            {/* LÍNEA DE TIEMPO DEL TRÁMITE (STEPPER DE SEGUIMIENTO) */}
            <div className="p-6 border-b-2 border-slate-200">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">
                Línea de Tiempo del Trámite
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
                {/* ETAPA 1: SOLICITUD RECIBIDA */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0A162B]">
                      1. Solicitud Capturada en Módulo Oficial
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      Registrada el {candidatoEncontrado.fechaEtiqueta} en {candidatoEncontrado.moduloAbordaje}. Documentación inicial digitalizada ({candidatoEncontrado.documentosAdjuntos.join(', ')}).
                    </p>
                  </div>
                </div>

                {/* ETAPA 2: EMPATE Y ASIGNACIÓN DE VACANTE */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs ${
                      candidatoEncontrado.estatus === 'asignado'
                        ? 'bg-emerald-600 text-white'
                        : candidatoEncontrado.estatus === 'en_espera'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {candidatoEncontrado.estatus === 'asignado' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0A162B]">
                      2. Empate de Vacante por Reclutamiento
                    </h4>

                    {candidatoEncontrado.estatus === 'asignado' && vacanteAsignada ? (
                      <div className="mt-2 p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-xs text-emerald-950 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-900">
                          <Building2 className="w-4 h-4 text-emerald-700" />
                          <span>¡Aprobado para {vacanteAsignada.empresa} ({vacanteAsignada.planta})!</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ubicación: {vacanteAsignada.zona}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Turno: {vacanteAsignada.turno}</span>
                          </div>
                          <div className="sm:col-span-2 text-emerald-900 font-extrabold">
                            Sueldo Neto: {vacanteAsignada.sueldoSemanal} &bull; {vacanteAsignada.prestaciones}
                          </div>
                        </div>
                      </div>
                    ) : candidatoEncontrado.estatus === 'en_espera' ? (
                      <div className="mt-2 p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-950">
                        <p className="font-extrabold text-amber-900">
                          Tu solicitud se encuentra en Cartera Activa de Espera
                        </p>
                        <p className="mt-1 font-semibold text-amber-800">
                          <strong>Motivo registrado:</strong> {candidatoEncontrado.motivoEspera || 'Esperando vacante óptima para tu perfil'}. Te contactaremos de inmediato en cuanto se abra la vacante requerida.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        Tu perfil está siendo evaluado en la mesa de contratación para asignarte la planta maquiladora más cercana a tu domicilio.
                      </p>
                    )}
                  </div>
                </div>

                {/* ETAPAS 3 Y 4: MENSAJE GENERAL - EVALUACIÓN MÉDICA, ANTIDOPING Y CONTRATACIÓN */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs ${
                      candidatoEncontrado.estatus === 'asignado'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="text-[9px] font-extrabold">3-4</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-[#0A162B]">
                        3 y 4. Evaluación Médica, Antidoping y Contratación
                      </h4>
                      <span className="text-[10px] font-extrabold bg-[#0A162B] text-[#D4AF37] px-2 py-0.5 rounded-md border border-[#D4AF37]/40">
                        Atención Personalizada por Reclutamiento
                      </span>
                    </div>

                    <div className="mt-2.5 p-4 bg-blue-50/90 border-2 border-blue-200 rounded-xl text-xs text-blue-950 flex flex-col gap-2.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-extrabold text-sm text-blue-900 leading-snug">
                            Pronto recibirás más información sobre tu evaluación médica y antidoping.
                          </p>
                          <p className="text-blue-800 font-medium leading-relaxed">
                            Actualmente las agendas de laboratorio y valoración médica son gestionadas de manera personalizada por nuestro equipo de Reclutamiento. Personal de CEPS se comunicará directamente contigo (vía llamada telefónica o WhatsApp) para coordinar tu fecha, horario y ubicación exacta, así como para la formalización de tu contrato, entrega de uniforme y gafete de seguridad.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-blue-200 flex items-center justify-between flex-wrap gap-2 text-[11px] font-bold text-blue-900">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                          Teléfono de contacto registrado: {candidatoEncontrado.telefono}
                        </span>
                        <span className="text-slate-500 font-medium">
                          No es necesario acudir a oficinas sin previa llamada de confirmación.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACCIONES Y CONTACTO DIRECTO */}
            <div className="p-6 bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleDescargarComprobante}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-900 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-700" />
                <span>Descargar Comprobante PDF (Folio {candidatoEncontrado.folio})</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=Hola%20CEPS%2C%20quisiera%20informaci%C3%B3n%20sobre%20mi%20Folio%20*${candidatoEncontrado.folio}*%20a%20nombre%20de%20${encodeURIComponent(candidatoEncontrado.nombre + ' ' + candidatoEncontrado.apellidoPaterno)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Contactar a Reclutador por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
