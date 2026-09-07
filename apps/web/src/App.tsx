import { useState, useEffect } from 'react'
import { Shield, CheckCircle2, AlertCircle, RefreshCw, Users, FileCheck, Building2, HardHat } from 'lucide-react'
import { api, type HealthCheckResponse } from './lib/api'

export default function App() {
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

  useEffect(() => {
    let activo = true
    api.getHealth()
      .then((res) => {
        if (activo) setHealth(res)
      })
      .catch((err) => {
        if (activo) setError(err instanceof Error ? err.message : 'Error conectando con el backend de Laragon')
      })
    return () => { activo = false }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Barra superior de gobernanza y marca */}
      <header className="bg-[#0F1E36] text-white px-6 py-4 border-b border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#D4AF37] p-2 rounded text-[#0F1E36]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CEPS Paso del Norte</h1>
            <p className="text-xs text-slate-300">Seguridad Privada &bull; Plataforma de Reclutamiento y Expedientes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Entorno Local Laragon</span>
        </div>
      </header>

      {/* Contenedor principal de alta densidad */}
      <main className="max-w-6xl w-full mx-auto p-6 flex-1 flex flex-col gap-6">
        {/* Jerarquía de 3 segundos: KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Módulos Activos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
              <p className="text-xs text-slate-500 mt-0.5">Independencia, Monumento, Central</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Célula 0 Onboarding</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">Fase 1</p>
              <p className="text-xs text-slate-500 mt-0.5">Diagnóstico y dolores resguardados</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gobernanza de Código</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">5 Skills</p>
              <p className="text-xs text-slate-500 mt-0.5">Anti-Vibecoding &amp; Quality Gates</p>
            </div>
            <div className="p-3 bg-amber-50 text-[#D4AF37] rounded-lg">
              <HardHat className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestión de Tareas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">TKT-CEPS-001</p>
              <p className="text-xs text-slate-500 mt-0.5">Monorepo y compuertas de calidad</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Panel de Estado de Conexión a Laragon */}
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Estado de Conexión · Backend Laragon (CodeIgniter 4)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Canal tipado exclusivo mediante <code>apps/web/src/lib/api.ts</code></p>
            </div>
            <button
              onClick={checkStatus}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#0F1E36] text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Verificar Conexión
            </button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="p-4 bg-slate-50 rounded border border-slate-100 animate-pulse text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0F1E36]" />
                Verificando endpoint de salud <code>GET /api/v1/health</code> en Laragon...
              </div>
            ) : error ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Backend local no conectado en puerto 8080</p>
                  <p className="text-amber-700 mt-1">
                    Ejecuta <code>php spark serve</code> dentro de <code>apps/api</code> o inicia Laragon para activar el endpoint.
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
                Presiona <strong>Verificar Conexión</strong> para comprobar el estado de la API.
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-400">
        CEPS Paso del Norte &bull; Metodología de Desarrollo Dataholics &bull; Control estricto anti-vibecoding
      </footer>
    </div>
  )
}
