import React, { useState } from 'react'
import { X, Building2, PlusCircle, AlertCircle } from 'lucide-react'
import { vacancySchema, type VacancyInput } from '../schemas/vacancySchema'
import { useVacancyStore } from '../store/vacancyStore'

interface NewVacancyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NewVacancyModal: React.FC<NewVacancyModalProps> = ({ isOpen, onClose }) => {
  const { crearVacante } = useVacancyStore()

  const [formData, setFormData] = useState<VacancyInput>({
    empresa: '',
    planta: '',
    zona: 'Parque Industrial San Jerónimo',
    puesto: 'Guardia de Seguridad Industrial 12x12',
    turno: '12x12 Rol de Turnos (4x3)',
    plazasTotales: 3,
    sueldoSemanal: '$3,400 netos',
    prestaciones: 'Transporte gratuito + Comedor subsidiado + Bono puntualidad',
    requisitos: 'Experiencia mínima 1 año en seguridad industrial, cartas laborales.',
  })

  const [errores, setErrores] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validacion = vacancySchema.safeParse(formData)

    if (!validacion.success) {
      const errMap: Record<string, string> = {}
      for (const issue of validacion.error.issues) {
        if (issue.path[0]) errMap[String(issue.path[0])] = issue.message
      }
      setErrores(errMap)
      return
    }

    crearVacante(validacion.data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-6 py-4 bg-[#0A162B] text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Registrar Nueva Vacante por Empresa</h3>
              <p className="text-[11px] text-slate-300">
                Apertura de plazas para maquiladora o servicio en Ciudad Juárez
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

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
          {Object.keys(errores).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-900 font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p>Revisa los siguientes campos antes de guardar:</p>
                <ul className="list-disc list-inside font-semibold text-[11px] mt-0.5">
                  {Object.values(errores).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="font-extrabold text-slate-900">
                Empresa Cliente / Maquiladora *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Lear Corporation, Foxconn, BRP, Flex..."
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-900">Planta o Instalación *</label>
              <input
                type="text"
                required
                placeholder="Ej. Planta San Lorenzo, Campus Lomas..."
                value={formData.planta}
                onChange={(e) => setFormData({ ...formData, planta: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-900">Parque Industrial / Zona *</label>
              <input
                type="text"
                required
                placeholder="Ej. Parque Industrial San Jerónimo"
                value={formData.zona}
                onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="font-extrabold text-slate-900">Puesto Requerido *</label>
              <input
                type="text"
                required
                placeholder="Ej. Guardia de Seguridad Industrial 12x12"
                value={formData.puesto}
                onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-900">Turno y Horario *</label>
              <select
                value={formData.turno}
                onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
              >
                <option>12x12 Rol de Turnos (4x3)</option>
                <option>Turno 1 (Mañana 5x2 de 06:00 a 15:30)</option>
                <option>Turno 2 (Tarde 5x2 de 15:30 a 23:00)</option>
                <option>12x12 Nocturno</option>
                <option>Turno Especial Fin de Semana</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-900">Plazas Requeridas (Cupo) *</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={formData.plazasTotales}
                onChange={(e) =>
                  setFormData({ ...formData, plazasTotales: Math.max(1, Number(e.target.value)) })
                }
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="font-extrabold text-slate-900">Sueldo Neto Semanal *</label>
              <input
                type="text"
                required
                placeholder="Ej. $3,450 netos semanales"
                value={formData.sueldoSemanal}
                onChange={(e) => setFormData({ ...formData, sueldoSemanal: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="font-extrabold text-slate-900">Prestaciones y Beneficios</label>
              <input
                type="text"
                placeholder="Ej. Transporte gratuito + Comedor subsidiado + Bono puntualidad"
                value={formData.prestaciones}
                onChange={(e) => setFormData({ ...formData, prestaciones: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0A162B] outline-none"
              />
            </div>
          </div>

          {/* ACCIONES */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0A162B] hover:bg-slate-800 text-white font-extrabold text-xs transition shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>Guardar Vacante</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
