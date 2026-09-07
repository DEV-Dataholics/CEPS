import React, { useState } from 'react'
import { UiKitDemo } from './pages/UiKitDemo'
import { Server, LayoutDashboard, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { api, type HealthCheckResponse } from './lib/api'

export default function App() {
  const [vista, setVista] = useState<'uikit' | 'diagnostico'>('uikit')
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Selector Rápido de Vista */}
      <div className="bg-[#0B1526] text-white px-6 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-slate-300">CEPS Paso del Norte &bull; Entorno de Desarrollo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVista('uikit')}
            className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              vista === 'uikit'
                ? 'bg-[#D4AF37] text-[#0F1E36] font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Guía Visual &amp; Demo UX/UI
          </button>
          <button
            onClick={() => {
              setVista('diagnostico')
              checkStatus()
            }}
            className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              vista === 'diagnostico'
                ? 'bg-[#D4AF37] text-[#0F1E36] font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Diagnóstico Laragon (CI4)
          </button>
        </div>
      </div>

      {vista === 'uikit' ? (
        <UiKitDemo />
      ) : (
        <div className="max-w-4xl w-full mx-auto p-8 flex-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Estado de Conexión · Backend Laragon (CodeIgniter 4)</h2>
                <p className="text-xs text-slate-500 mt-0.5">Canal tipado exclusivo mediante <code>apps/web/src/lib/api.ts</code></p>
              </div>
              <button
                onClick={checkStatus}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium bg-[#0F1E36] text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Verificar Ahora
              </button>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="p-4 bg-slate-50 rounded border border-slate-100 animate-pulse text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0F1E36]" />
                  Consultando <code>GET /api/v1/health</code> en local...
                </div>
              ) : error ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Backend local no conectado en puerto 8080</p>
                    <p className="text-amber-700 mt-1">
                      Ejecuta <code>php spark serve</code> dentro de <code>apps/api</code> o verifica Laragon.
                    </p>
                    <p className="text-slate-500 mt-1 font-mono text-[11px]">{error}</p>
                  </div>
                </div>
              ) : health ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Conexión exitosa con CodeIgniter 4 en Laragon</p>
                    <p className="text-emerald-700 mt-1">
                      Estatus: {health.status} &bull; Base de datos: {health.database ?? 'ceps_db'} &bull; Timestamp: {health.timestamp}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
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
