import React, { useState } from 'react'
import { UiKitDemo } from './pages/UiKitDemo'
import { CandidateRegistrationView } from './pages/CandidateRegistrationView'
import { VacancyManagerView } from './pages/VacancyManagerView'
import { CandidateStatusTrackingView } from './pages/CandidateStatusTrackingView'
import { CatalogManagerView } from './pages/CatalogManagerView'
import { GuardDossiersView } from './pages/GuardDossiersView'
import { Server, LayoutDashboard, CheckCircle2, AlertCircle, RefreshCw, UserPlus, Briefcase, Search, SlidersHorizontal, FolderArchive } from 'lucide-react'
import { api, type HealthCheckResponse } from './lib/api'

export default function App() {
  const [vista, setVista] = useState<'vacantes' | 'dossiers' | 'candidato' | 'tracking' | 'catalogos' | 'uikit' | 'diagnostico'>('dossiers')
  const [health, setHealth] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getHealth()
      setHealth(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error conectando con el backend de Laragon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#EDF2F7] flex flex-col font-sans">
      {/* Selector Superior Institucional */}
      <div className="bg-[#060E1C] text-white px-4 sm:px-6 py-2 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-extrabold text-slate-200 tracking-wide text-xs">
            CEPS Paso del Norte &bull; Plataforma Operativa
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => setVista('vacantes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              vista === 'vacantes'
                ? 'bg-[#D4AF37] text-[#0A162B]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Gestor de Vacantes
          </button>

          <button
            onClick={() => setVista('dossiers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              vista === 'dossiers'
                ? 'bg-[#D4AF37] text-[#0A162B]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            Expedientes de Guardias
          </button>

          <button
            onClick={() => setVista('candidato')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              vista === 'candidato'
                ? 'bg-[#D4AF37] text-[#0A162B]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Portal Candidato
          </button>

          <button
            onClick={() => setVista('tracking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              vista === 'tracking'
                ? 'bg-[#D4AF37] text-[#0A162B]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Consultar Estatus (Folio)
          </button>

          <button
            onClick={() => setVista('catalogos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              vista === 'catalogos'
                ? 'bg-[#D4AF37] text-[#0A162B]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Catálogos del Sistema
          </button>

          <button
            onClick={() => setVista('uikit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              vista === 'uikit'
                ? 'bg-[#D4AF37] text-[#0A162B]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Guía Visual Demo
          </button>

          <button
            onClick={() => {
              setVista('diagnostico')
              checkStatus()
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              vista === 'diagnostico'
                ? 'bg-[#D4AF37] text-[#0A162B]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Diagnóstico Backend
          </button>
        </div>
      </div>

      {vista === 'vacantes' ? (
        <VacancyManagerView />
      ) : vista === 'dossiers' ? (
        <GuardDossiersView />
      ) : vista === 'candidato' ? (
        <CandidateRegistrationView onConsultarEstatus={() => setVista('tracking')} />
      ) : vista === 'tracking' ? (
        <CandidateStatusTrackingView />
      ) : vista === 'catalogos' ? (
        <CatalogManagerView />
      ) : vista === 'uikit' ? (
        <UiKitDemo />
      ) : (
        <div className="max-w-4xl w-full mx-auto p-8 flex-1 flex flex-col gap-6">
          <div className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-[#0A162B]">Estado de Conexión · Backend Laragon (CodeIgniter 4)</h2>
                <p className="text-sm font-medium text-slate-700 mt-1">Canal tipado exclusivo mediante <code>apps/web/src/lib/api.ts</code></p>
              </div>
              <button
                onClick={checkStatus}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0A162B] text-white hover:bg-slate-800 transition disabled:opacity-50 shadow-md"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                Verificar Ahora
              </button>
            </div>

            <div className="mt-5">
              {loading ? (
                <div className="p-5 bg-slate-100 rounded-xl border border-slate-200 animate-pulse text-sm text-slate-700 font-semibold flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0A162B]" />
                  Consultando <code>GET /api/v1/health</code> en local...
                </div>
              ) : error ? (
                <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-xl text-sm text-amber-950 flex items-start gap-3.5">
                  <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-base">Backend local no conectado en puerto 8080</p>
                    <p className="text-amber-800 mt-1 font-medium">
                      Ejecuta <code>php spark serve</code> dentro de <code>apps/api</code> o verifica Laragon.
                    </p>
                    <p className="text-slate-600 mt-1.5 font-mono text-xs font-semibold">{error}</p>
                  </div>
                </div>
              ) : health ? (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-sm text-emerald-950 flex items-start gap-3.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-base">Conexión exitosa con CodeIgniter 4 en Laragon</p>
                    <p className="text-emerald-800 mt-1 font-semibold">
                      Estatus: {health.status} &bull; Base de datos: {health.database ?? 'ceps_db'} &bull; Timestamp: {health.timestamp}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-medium">
                  Presiona <strong>Verificar Ahora</strong> para comprobar el estado de la API.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
