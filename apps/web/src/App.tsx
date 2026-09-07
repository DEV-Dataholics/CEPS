import React, { useState } from 'react'
import { UiKitDemo } from './pages/UiKitDemo'
import { CandidateRegistrationView } from './pages/CandidateRegistrationView'
import { VacancyManagerView } from './pages/VacancyManagerView'
import { CandidateStatusTrackingView } from './pages/CandidateStatusTrackingView'
import { CatalogManagerView } from './pages/CatalogManagerView'
import { GuardDossiersView } from './pages/GuardDossiersView'
import { AppSidebar } from './components/AppSidebar'
import { AppHeader } from './components/AppHeader'
import { FieldInterviewWizard } from './components/FieldInterviewWizard'
import { useAuthStore, METADATA_ROLES, type VistaId } from './store/authStore'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { api, type HealthCheckResponse } from './lib/api'

export default function App() {
  const { rolActivo, modalEntrevistaGlobalAbierto, setModalEntrevistaGlobalAbierto } = useAuthStore()
  const infoRol = METADATA_ROLES[rolActivo]

  const [vista, setVista] = useState<VistaId>(infoRol.vistaPorDefecto)
  const [health, setHealth] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vista efectiva validada dinámicamente según gobernanza RBAC (sin setState en useEffect)
  const vistaEfectiva: VistaId = infoRol.vistasPermitidas.includes(vista)
    ? vista
    : infoRol.vistaPorDefecto

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
    <div className="min-h-screen bg-[#EDF2F7] flex flex-row font-sans text-slate-900 overflow-x-hidden">
      {/* Sidebar Lateral Colapsable con Gobernanza RBAC */}
      <AppSidebar
        vistaActual={vistaEfectiva}
        onCambiarVista={(v) => {
          setVista(v)
          if (v === 'diagnostico' && !health) {
            checkStatus()
          }
        }}
      />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Cabecera Superior Ejecutiva y Limpia */}
        <AppHeader vistaActual={vistaEfectiva} />

        {/* Vista Activa */}
        <main className="flex-1 flex flex-col min-w-0">
          {vistaEfectiva === 'vacantes' ? (
            <VacancyManagerView />
          ) : vistaEfectiva === 'dossiers' ? (
            <GuardDossiersView />
          ) : vistaEfectiva === 'candidato' ? (
            <CandidateRegistrationView onConsultarEstatus={() => setVista('tracking')} />
          ) : vistaEfectiva === 'tracking' ? (
            <CandidateStatusTrackingView />
          ) : vistaEfectiva === 'catalogos' ? (
            <CatalogManagerView />
          ) : vistaEfectiva === 'uikit' ? (
            <UiKitDemo />
          ) : (
            <div className="max-w-4xl w-full mx-auto p-8 flex-1 flex flex-col gap-6">
              <div className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0A162B]">
                      Estado de Conexión &bull; Backend Laragon (CodeIgniter 4)
                    </h2>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      Canal tipado exclusivo mediante <code>apps/web/src/lib/api.ts</code>
                    </p>
                  </div>
                  <button
                    onClick={checkStatus}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0A162B] text-white hover:bg-slate-800 transition disabled:opacity-50 shadow-md"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`}
                    />
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
        </main>
      </div>

      {/* Modal Global de Entrevista de Campo en Tablet */}
      {modalEntrevistaGlobalAbierto && (
        <FieldInterviewWizard
          isOpen={modalEntrevistaGlobalAbierto}
          onClose={() => setModalEntrevistaGlobalAbierto(false)}
          onSuccess={() => {
            setVista('dossiers')
          }}
        />
      )}
    </div>
  )
}
