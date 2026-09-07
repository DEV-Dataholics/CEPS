import React, { useState } from 'react'
import {
  Briefcase,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useVacancyStore, type AspiranteSolicitud } from '../store/vacancyStore'
import { VacancyCard } from '../components/VacancyCard'
import { ApplicantInbox } from '../components/ApplicantInbox'
import { NewVacancyModal } from '../components/NewVacancyModal'
import { AssignCandidateModal } from '../components/AssignCandidateModal'

export const VacancyManagerView: React.FC = () => {
  const {
    vacantes,
    aspirantes,
    candidatoSeleccionadoId,
    setCandidatoSeleccionadoId,
    asignarAspiranteAVacante,
    reiniciarDatosDemo,
  } = useVacancyStore()

  const [modalNuevaVacanteOpen, setModalNuevaVacanteOpen] = useState(false)
  const [candidatoParaDecidir, setCandidatoParaDecidir] = useState<AspiranteSolicitud | null>(null)
  const [modoDecision, setModoDecision] = useState<'asignar' | 'espera' | null>(null)
  const [toastMensaje, setToastMensaje] = useState<string | null>(null)

  // Candidato enfocado actualmente para asignación directa
  const candidatoActivo = candidatoSeleccionadoId
    ? aspirantes.find((a) => a.id === candidatoSeleccionadoId) || null
    : null

  // Métricas operativas consolidadas
  const plazasTotales = vacantes.reduce((sum, v) => sum + v.plazasTotales, 0)
  const plazasCubiertas = vacantes.reduce((sum, v) => sum + v.aspirantesAsignadosIds.length, 0)
  const plazasLibres = Math.max(plazasTotales - plazasCubiertas, 0)
  const porcentajeCobertura = plazasTotales > 0 ? Math.round((plazasCubiertas / plazasTotales) * 100) : 0
  const totalEnEspera = aspirantes.filter((a) => a.estatus === 'en_espera').length

  const handleDecidirCandidato = (candidato: AspiranteSolicitud, accion: 'asignar' | 'espera') => {
    setCandidatoParaDecidir(candidato)
    setModoDecision(accion)
  }

  const handleAsignarCandidatoActivoAVacante = (vacanteId: string) => {
    if (!candidatoActivo) return
    const vac = vacantes.find((v) => v.id === vacanteId)
    asignarAspiranteAVacante(candidatoActivo.id, vacanteId)
    setToastMensaje(
      `¡${candidatoActivo.nombre} asignado a ${vac?.empresa || 'la vacante'} exitosamente!`
    )
    setTimeout(() => setToastMensaje(null), 3500)
  }

  return (
    <div className="flex-1 flex flex-col font-sans bg-[#EDF2F7]">
      {/* HEADER DE MANDO OPERATIVO */}
      <header className="bg-[#0A162B] text-white py-4 px-4 sm:px-8 border-b-2 border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#060E1C] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-[#D4AF37] uppercase tracking-wider">
                  Módulo 2 &bull; Reclutamiento y Contratación
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-white">
                Administrador de Vacantes &amp; Empate Operativo
              </h1>
            </div>
          </div>

          {/* ACCIONES Y BOTÓN NUEVA VACANTE */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                reiniciarDatosDemo()
                setToastMensaje('Catálogo y solicitudes reiniciadas con datos demo de Juárez.')
                setTimeout(() => setToastMensaje(null), 3000)
              }}
              title="Restablecer vacantes y solicitudes de prueba"
              className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restablecer Demo</span>
            </button>

            <button
              type="button"
              onClick={() => setModalNuevaVacanteOpen(true)}
              className="px-4 py-2 text-xs font-extrabold text-[#0A162B] bg-[#D4AF37] hover:bg-[#C59F2D] rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nueva Vacante</span>
            </button>
          </div>
        </div>

        {/* CINTA DE MÉTRICAS OPERATIVAS */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#060E1C]/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Plazas Requeridas</span>
              <span className="text-base font-extrabold text-white font-mono">{plazasTotales} guardias</span>
            </div>
          </div>

          <div className="bg-[#060E1C]/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Plazas Cubiertas</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {plazasCubiertas} ({porcentajeCobertura}%)
              </span>
            </div>
          </div>

          <div className="bg-[#060E1C]/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Plazas Pendientes</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">{plazasLibres} vacantes</span>
            </div>
          </div>

          <div className="bg-[#060E1C]/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Cartera en Espera</span>
              <span className="text-base font-extrabold text-[#D4AF37] font-mono">{totalEnEspera} aspirantes</span>
            </div>
          </div>
        </div>
      </header>

      {/* BANNER INFORMATIVO SI HAY UN CANDIDATO SELECCIONADO PARA EMPATE */}
      {candidatoActivo && (
        <div className="bg-amber-500 text-[#0A162B] px-6 py-2.5 flex items-center justify-between text-xs font-extrabold shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A162B] animate-ping"></span>
            <span>
              Asignando a: <strong>{candidatoActivo.nombre} {candidatoActivo.apellidoPaterno}</strong> ({candidatoActivo.folio}) &bull; Selecciona una vacante con plazas disponibles para vincularlo.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCandidatoSeleccionadoId(null)}
            className="px-2.5 py-0.5 rounded bg-[#0A162B] text-white hover:bg-slate-800 text-[11px] transition font-bold"
          >
            Cancelar Selección
          </button>
        </div>
      )}

      {/* CUERPO PRINCIPAL: DOBLE PANEL OPERATIVO */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
        {/* PANEL IZQUIERDO: BANDEJA DE SOLICITUDES */}
        <section className="w-full lg:w-[420px] xl:w-[450px] flex-shrink-0 flex flex-col">
          <ApplicantInbox onDecidirCandidato={handleDecidirCandidato} />
        </section>

        {/* PANEL DERECHO: TABLERO DE VACANTES POR EMPRESA */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0A162B]">
                Vacantes Operativas por Maquiladora / Empresa
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                {vacantes.length} vacantes registradas en parques industriales de Ciudad Juárez
              </p>
            </div>
          </div>

          {/* GRID DE TARJETAS DE VACANTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vacantes.map((vac) => {
              const aspirantesAsignados = aspirantes.filter((a) =>
                vac.aspirantesAsignadosIds.includes(a.id)
              )
              return (
                <VacancyCard
                  key={vac.id}
                  vacante={vac}
                  aspirantesAsignados={aspirantesAsignados}
                  candidatoActivo={candidatoActivo}
                  onAsignarCandidatoActivo={handleAsignarCandidatoActivoAVacante}
                />
              )
            })}
          </div>
        </section>
      </main>

      {/* MODAL NUEVA VACANTE */}
      <NewVacancyModal
        isOpen={modalNuevaVacanteOpen}
        onClose={() => setModalNuevaVacanteOpen(false)}
      />

      {/* MODAL DECISIÓN (APROBAR VS ESPERA) */}
      <AssignCandidateModal
        candidato={candidatoParaDecidir}
        modo={modoDecision}
        onClose={() => {
          setCandidatoParaDecidir(null)
          setModoDecision(null)
        }}
      />

      {/* TOAST DE FEEDBACK */}
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A162B] text-white px-4 py-3 rounded-xl border-2 border-[#D4AF37] shadow-xl text-xs font-extrabold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMensaje}</span>
        </div>
      )}
    </div>
  )
}
