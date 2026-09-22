import React, { useState } from 'react'
import {
  Building2,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  UserPlus,
  UserX,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ShieldAlert,
} from 'lucide-react'
import { type Vacante, type AspiranteSolicitud, useVacancyStore } from '../store/vacancyStore'

interface VacancyCardProps {
  vacante: Vacante
  aspirantesAsignados: AspiranteSolicitud[]
  candidatoActivo?: AspiranteSolicitud | null
  onAsignarCandidatoActivo?: (vacanteId: string) => void
}

export const VacancyCard: React.FC<VacancyCardProps> = ({
  vacante,
  aspirantesAsignados,
  candidatoActivo,
  onAsignarCandidatoActivo,
}) => {
  const [expandirAsignados, setExpandirAsignados] = useState(false)
  const [aspiranteParaBaja, setAspiranteParaBaja] = useState<AspiranteSolicitud | null>(null)
  const [motivoBaja, setMotivoBaja] = useState('')
  const [marcarVetado, setMarcarVetado] = useState(false)
  const { desasignarAspirante, darDeBajaEmpleado } = useVacancyStore()

  const plazasCubiertas = aspirantesAsignados.length
  const porcentaje = Math.min(Math.round((plazasCubiertas / vacante.plazasTotales) * 100), 100)
  const estaCubierta = plazasCubiertas >= vacante.plazasTotales
  const plazasDisponibles = Math.max(vacante.plazasTotales - plazasCubiertas, 0)

  return (
    <div
      className={`bg-white rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
        estaCubierta
          ? 'border-emerald-300 ring-2 ring-emerald-100'
          : candidatoActivo
          ? 'border-amber-400 ring-2 ring-amber-100/80 hover:border-[#0A162B]'
          : 'border-slate-300 hover:border-slate-400'
      }`}
    >
      {/* CABECERA DE LA VACANTE */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-[#0A162B] border-2 border-[#D4AF37] text-white flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0">
              <Building2 className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-[#0A162B] leading-tight">
                  {vacante.empresa}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 whitespace-nowrap">
                  {vacante.planta}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{vacante.zona}</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            {estaCubierta ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>Cubierta</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span>{plazasDisponibles} {plazasDisponibles === 1 ? 'plaza libre' : 'plazas libres'}</span>
              </span>
            )}
          </div>
        </div>

        {/* PUESTO Y TURNO */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span className="text-sm font-extrabold text-[#0A162B]">{vacante.puesto}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-[#0A162B]" />
              <span>{vacante.turno}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>{vacante.sueldoSemanal}</span>
            </div>
          </div>

          <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-0.5">
            {vacante.prestaciones}
          </p>
        </div>

        {/* BARRA DE CUPO VISUAL */}
        <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0A162B]" />
              <span>Cupo Requerido:</span>
            </div>
            <span className="font-mono">
              {plazasCubiertas} / {vacante.plazasTotales} ({porcentaje}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                estaCubierta ? 'bg-emerald-600' : porcentaje > 50 ? 'bg-[#D4AF37]' : 'bg-amber-500'
              }`}
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE CANDIDATOS ASIGNADOS Y ACCIONES */}
      <div className="px-5 py-3 bg-[#F8FAFC] border-t-2 border-slate-200 rounded-b-2xl flex flex-col gap-2">
        {/* Toggle de aspirantes asignados */}
        {aspirantesAsignados.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setExpandirAsignados(!expandirAsignados)}
              className="w-full py-1 text-xs font-bold text-slate-700 hover:text-[#0A162B] flex items-center justify-between transition"
            >
              <span>{plazasCubiertas} guardia(s) asignado(s)</span>
              {expandirAsignados ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandirAsignados && (
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {aspirantesAsignados.map((asp) => (
                  <div
                    key={asp.id}
                    className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-800 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold text-[11px] px-2 py-0.5 rounded bg-[#0A162B] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs flex-shrink-0">
                        {asp.folio}
                      </span>
                      <div>
                        <div className="font-extrabold text-[#0A162B] text-xs">
                          {asp.nombre} {asp.apellidoPaterno}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {asp.telefono} &bull; {asp.colonia}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAspiranteParaBaja(asp)
                          setMotivoBaja('')
                          setMarcarVetado(false)
                        }}
                        title="Procesar Baja de Empleado (Cascading Offboarding: libera vacante inmediatamente)"
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3 h-3 text-red-600" />
                        <span>Baja</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => desasignarAspirante(asp.id)}
                        title="Reasignar (quitar de esta vacante sin dar de baja)"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL DE BAJA DE EMPLEADO (CASCADING OFFBOARDING) */}
        {aspiranteParaBaja && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl border-2 border-red-500 shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A162B]">Baja Operativa de Guardia</h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    {vacante.empresa} &bull; {vacante.planta}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Empleado / Folio:</span>
                    <span className="font-mono font-black text-[#0A162B]">{aspiranteParaBaja.folio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Nombre:</span>
                    <span className="font-extrabold text-slate-900">
                      {aspiranteParaBaja.nombre} {aspiranteParaBaja.apellidoPaterno}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Turno asignado:</span>
                    <span className="text-slate-800">{vacante.turno}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-[11px] font-semibold">
                  ⚡ <strong>Cascading Offboarding:</strong> Al procesar la baja, el guardia quedará automáticamente desasignado de la empresa y la vacante se reabrirá de inmediato en el sistema para reemplazo de personal.
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Motivo Oficial de la Baja *
                  </label>
                  <input
                    type="text"
                    required
                    value={motivoBaja}
                    onChange={(e) => setMotivoBaja(e.target.value)}
                    placeholder="Ej: Renuncia voluntaria / Faltas injustificadas / Abandono de servicio"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-red-500"
                  />
                </div>

                <label className="flex items-start gap-2.5 p-3 bg-red-50/70 border border-red-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marcarVetado}
                    onChange={(e) => setMarcarVetado(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-red-600 rounded cursor-pointer"
                  />
                  <div className="text-xs text-red-950 font-bold">
                    <span>Marcar como NO CONTRATABLE (Veto Administrativo)</span>
                    <p className="text-[10px] text-red-700 font-normal mt-0.5">
                      Bloqueará de inmediato al reclutador en campo si intenta volver a registrarse con su CURP.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAspiranteParaBaja(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!motivoBaja.trim()) {
                      alert('Por favor capture el motivo de la baja.')
                      return
                    }
                    darDeBajaEmpleado(aspiranteParaBaja.id, motivoBaja.trim(), marcarVetado)
                    setAspiranteParaBaja(null)
                  }}
                  className="px-4 py-2 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Confirmar Baja y Reabrir Vacante
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón de Asignación Rápida si hay un candidato seleccionado en la bandeja */}
        {candidatoActivo && !estaCubierta && (
          <button
            type="button"
            onClick={() => onAsignarCandidatoActivo && onAsignarCandidatoActivo(vacante.id)}
            className="w-full py-2 bg-[#0A162B] hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-1.5 animate-in fade-in"
          >
            <UserPlus className="w-4 h-4 text-[#D4AF37]" />
            <span>Asignar a {candidatoActivo.nombre.split(' ')[0]} ({candidatoActivo.folio}) aquí</span>
          </button>
        )}
      </div>
    </div>
  )
}
