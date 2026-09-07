import React, { useState } from 'react'
import {
  X,
  UserCheck,
  PauseCircle,
  Building2,
  MapPin,
  Clock,
  Check,
  AlertTriangle,
} from 'lucide-react'
import {
  type AspiranteSolicitud,
  useVacancyStore,
} from '../store/vacancyStore'
import { MOTIVOS_ESPERA, type MotivoEspera } from '../schemas/vacancySchema'

interface AssignCandidateModalProps {
  candidato: AspiranteSolicitud | null
  modo: 'asignar' | 'espera' | null
  onClose: () => void
}

export const AssignCandidateModal: React.FC<AssignCandidateModalProps> = ({
  candidato,
  modo,
  onClose,
}) => {
  const { vacantes, asignarAspiranteAVacante, ponerAspiranteEnEspera } = useVacancyStore()
  const [vacanteSeleccionadaId, setVacanteSeleccionadaId] = useState<string>('')
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>(MOTIVOS_ESPERA[0])
  const [motivoPersonalizado, setMotivoPersonalizado] = useState<string>('')

  if (!candidato || !modo) return null

  // Filtrar vacantes que tengan al menos una plaza disponible
  const vacantesDisponibles = vacantes.filter(
    (v) => v.aspirantesAsignadosIds.length < v.plazasTotales
  )

  const handleConfirmar = () => {
    if (modo === 'asignar') {
      if (!vacanteSeleccionadaId) return
      asignarAspiranteAVacante(candidato.id, vacanteSeleccionadaId)
    } else {
      const motivoFinal = motivoPersonalizado.trim() || motivoSeleccionado
      ponerAspiranteEnEspera(candidato.id, motivoFinal as MotivoEspera)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* CABECERA DEL MODAL */}
        <div className="px-6 py-4 bg-[#0A162B] text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-2.5">
            {modo === 'asignar' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-extrabold">
                <UserCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-extrabold">
                <PauseCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {modo === 'asignar' ? 'Aprobar y Asignar a Vacante' : 'Poner Candidato en Espera'}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Expediente: <span className="font-mono text-[#D4AF37]">{candidato.folio}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RESUMEN DEL ASPIRANTE */}
        <div className="p-4 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-extrabold text-[#0A162B] text-sm block">
              {candidato.nombre} {candidato.apellidoPaterno} {candidato.apellidoMaterno}
            </span>
            <span className="text-slate-600 font-semibold">
              {candidato.puestoDeseado} &bull; {candidato.colonia}
            </span>
          </div>
          <span className="font-mono text-slate-700 bg-slate-200 px-2.5 py-1 rounded-md text-[11px] font-bold">
            {candidato.telefono}
          </span>
        </div>

        {/* CUERPO DEL MODAL SEGÚN MODO */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
          {modo === 'asignar' ? (
            <div className="flex flex-col gap-3">
              <label className="font-extrabold text-slate-900 block">
                Selecciona la Empresa / Maquiladora destino:
              </label>

              {vacantesDisponibles.length === 0 ? (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>Todas las vacantes registradas están al 100% de su cupo actualmente.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {vacantesDisponibles.map((vac) => {
                    const esSeleccionada = vacanteSeleccionadaId === vac.id
                    const libres = vac.plazasTotales - vac.aspirantesAsignadosIds.length
                    return (
                      <label
                        key={vac.id}
                        className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between gap-3 ${
                          esSeleccionada
                            ? 'border-[#0A162B] bg-slate-50 ring-2 ring-[#0A162B]/10'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="vacanteDestino"
                            checked={esSeleccionada}
                            onChange={() => setVacanteSeleccionadaId(vac.id)}
                            className="mt-1 w-4 h-4 text-[#0A162B] focus:ring-[#0A162B]"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#0A162B]" />
                              <span>{vac.empresa}</span>
                              <span className="text-[11px] font-bold text-slate-600">({vac.planta})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {vac.zona}
                              </span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {vac.turno}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] block">
                            {vac.sueldoSemanal}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">
                            {libres} plaza(s) libre(s)
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            /* MODO EN ESPERA */
            <div className="flex flex-col gap-3">
              <label className="font-extrabold text-slate-900 block">
                Selecciona el motivo por el cual se coloca en Cartera en Espera:
              </label>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {MOTIVOS_ESPERA.map((motivo) => (
                  <label
                    key={motivo}
                    className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-2.5 ${
                      motivoSeleccionado === motivo
                        ? 'border-amber-400 bg-amber-50/60 ring-1 ring-amber-300'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="motivoEspera"
                      checked={motivoSeleccionado === motivo}
                      onChange={() => setMotivoSeleccionado(motivo)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-800 text-xs">{motivo}</span>
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="font-extrabold text-slate-700 text-[11px]">
                  O escribe un motivo personalizado:
                </span>
                <input
                  type="text"
                  placeholder="Ej. Esperando apertura de planta Foxconn Lomas..."
                  value={motivoPersonalizado}
                  onChange={(e) => setMotivoPersonalizado(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* BOTONES INFERIORES */}
        <div className="p-4 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmar}
            disabled={modo === 'asignar' && !vacanteSeleccionadaId}
            className={`px-5 py-2 rounded-xl text-white font-extrabold text-xs transition shadow-md flex items-center gap-1.5 disabled:opacity-50 ${
              modo === 'asignar' ? 'bg-[#0A162B] hover:bg-slate-800' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <Check className="w-4 h-4 text-[#D4AF37]" />
            <span>{modo === 'asignar' ? 'Confirmar Asignación' : 'Mover a Cartera en Espera'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
