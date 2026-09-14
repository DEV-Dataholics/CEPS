import React from 'react'
import {
  X,
  UserCheck,
  PauseCircle,
  FileCheck2,
  MapPin,
  Clock,
  Building,
  Tag,
  ShieldCheck,
  ExternalLink,
  Download,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { type AspiranteSolicitud, useVacancyStore } from '../store/vacancyStore'
import { generateCepsReceiptPdf } from '../lib/generateCepsReceiptPdf'

interface CandidateReviewModalProps {
  candidato: AspiranteSolicitud | null
  onClose: () => void
  onDecidir: (candidato: AspiranteSolicitud, accion: 'asignar' | 'espera') => void
}

export const CandidateReviewModal: React.FC<CandidateReviewModalProps> = ({
  candidato,
  onClose,
  onDecidir,
}) => {
  const { vacantes } = useVacancyStore()

  if (!candidato) return null

  const vacanteAsignada = candidato.vacanteAsignadaId
    ? vacantes.find((v) => v.id === candidato.vacanteAsignadaId)
    : null

  const handleDescargarPdf = () => {
    generateCepsReceiptPdf({
      folio: candidato.folio,
      nombre: `${candidato.nombre} ${candidato.apellidoPaterno} ${candidato.apellidoMaterno}`,
      telefono: candidato.telefono,
      curp: candidato.curp,
      rfc: candidato.rfc,
      puesto: candidato.puestoDeseado,
      modulo: candidato.moduloAbordaje,
      domicilio: candidato.colonia,
      colonia: candidato.colonia,
      coordenadas: `Lat: ${candidato.latitud}, Lng: ${candidato.longitud}`,
      fechaRegistro: candidato.fechaEtiqueta,
      documentosAdjuntos: candidato.documentosAdjuntos,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* CABECERA INSTITUCIONAL */}
        <div className="px-5 py-4 bg-[#0A162B] text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#060E1C] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded border border-[#D4AF37]/30 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Folio: {candidato.folio}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  &bull; {candidato.fechaEtiqueta}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                Revisión de Postulación &amp; Expediente
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CUERPO DEL EXPEDIENTE */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {/* TARJETA DE PERFIL Y ESTATUS */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-black text-[#0A162B]">
                  {candidato.nombre} {candidato.apellidoPaterno} {candidato.apellidoMaterno}
                </h4>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {candidato.edad} años
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                <span>Puesto Solicitado:</span>
                <span className="text-[#0A162B] font-extrabold underline decoration-[#D4AF37] decoration-2">
                  {candidato.puestoDeseado}
                </span>
              </p>
            </div>

            {/* BADGE DE ESTATUS */}
            <div className="flex-shrink-0">
              {candidato.estatus === 'nuevo' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Nueva Solicitud en Bandeja
                </span>
              )}
              {candidato.estatus === 'en_espera' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-900 border border-amber-400">
                  <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
                  En Cartera de Espera
                </span>
              )}
              {candidato.estatus === 'asignado' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Asignado a Vacante
                </span>
              )}
            </div>
          </div>

          {/* MOTIVO DE ESPERA O VACANTE SI APLICA */}
          {candidato.estatus === 'en_espera' && candidato.motivoEspera && (
            <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-xs font-bold text-amber-900">
              <span className="text-[10px] uppercase tracking-wider text-amber-700 block mb-0.5">
                Motivo de Espera Registrado:
              </span>
              {candidato.motivoEspera}
            </div>
          )}

          {candidato.estatus === 'asignado' && vacanteAsignada && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 block mb-0.5">
                Planta Asignada:
              </span>
              {vacanteAsignada.empresa} &bull; {vacanteAsignada.planta} ({vacanteAsignada.puesto} - {vacanteAsignada.turno})
            </div>
          )}

          {/* SECCIÓN 1: DATOS GENERALES Y DOCUMENTOS FISCALES */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h5 className="text-xs font-black text-[#0A162B] uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between">
              <span>1. Identidad y Documentos Oficiales</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verificados
              </span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">CURP Oficial:</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {candidato.curp || 'No registrada'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block">RFC con Homoclave:</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {candidato.rfc || 'No registrado'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block">Teléfono / WhatsApp:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-slate-900">{candidato.telefono}</span>
                  <a
                    href={`https://wa.me/52${candidato.telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    WhatsApp
                  </a>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block">Módulo de Abordaje:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {candidato.moduloAbordaje}
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: UBICACIÓN Y CROQUIS GEORREFERENCIADO */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h5 className="text-xs font-black text-[#0A162B] uppercase tracking-wider pb-1.5 border-b border-slate-100">
              2. Domicilio y Croquis Georreferenciado
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Colonia / Fraccionamiento:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0A162B]" />
                  {candidato.colonia}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block">Zona en Ciudad Juárez:</span>
                <span className="font-bold text-slate-900">
                  {candidato.zonaJuarez || 'Ciudad Juárez'}
                </span>
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Coordenadas GPS (Croquis):
                  </span>
                  <span className="font-mono text-xs font-extrabold text-slate-800">
                    Lat: {candidato.latitud || 31.6904} &bull; Lng: {candidato.longitud || -106.4245}
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${candidato.latitud || 31.6904},${candidato.longitud || -106.4245}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-blue-700 transition shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ver en Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DOCUMENTOS DIGITALIZADOS EN EXPEDIENTE */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
            <h5 className="text-xs font-black text-[#0A162B] uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between">
              <span>3. Documentos Digitalizados ({candidato.documentosAdjuntos.length})</span>
              <button
                type="button"
                onClick={handleDescargarPdf}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900"
              >
                <Download className="w-3 h-3" />
                Descargar Ticket Móvil PDF
              </button>
            </h5>

            <div className="flex flex-wrap gap-2">
              {candidato.documentosAdjuntos.length > 0 ? (
                candidato.documentosAdjuntos.map((doc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                    {doc}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">
                  Documentación base capturada en módulo de abordaje.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PIE CON ACCIONES OPERATIVAS DEL GESTOR */}
        <div className="px-5 py-3.5 bg-white border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {candidato.estatus === 'nuevo' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onDecidir(candidato, 'espera')
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <PauseCircle className="w-4 h-4 text-amber-700" />
                  <span>Poner en Espera</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onDecidir(candidato, 'asignar')
                  }}
                  className="w-full sm:w-auto px-5 py-2 bg-[#0A162B] hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Aprobar / Asignar a Vacante</span>
                </button>
              </>
            )}

            {candidato.estatus === 'en_espera' && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onDecidir(candidato, 'asignar')
                }}
                className="w-full sm:w-auto px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-white" />
                <span>Asignar a Vacante Disponible</span>
              </button>
            )}

            {candidato.estatus === 'asignado' && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onDecidir(candidato, 'asignar')
                }}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Reubicar a otra vacante</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
