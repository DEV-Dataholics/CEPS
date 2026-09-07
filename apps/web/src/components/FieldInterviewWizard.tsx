import React, { useState } from 'react'
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Brain,
  ShieldCheck,
  ClipboardList,
  AlertCircle,
  Save,
  Check,
  UserCheck,
} from 'lucide-react'
import { useCatalogStore } from '../store/catalogStore'
import { useDossierStore, calcularAuditoriaIntegridad } from '../store/dossierStore'
import type {
  DatosAbordaje,
  EscolaridadCandidato,
  ExamenRazonamientoRespuestas,
  ExamenRazonamientoEvaluacion,
  CuestionarioEntrevistaRespuestas,
  SolicitudEmpleoDigital,
  ChecklistPapeleriaOriginal,
  ExpedienteGuardia,
} from '../types/dossierTypes'

interface FieldInterviewWizardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (nuevoFolio: string) => void
}

export const FieldInterviewWizard: React.FC<FieldInterviewWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { modulos, puestos } = useCatalogStore()
  const { guardarNuevoExpediente, expedientes } = useDossierStore()

  const modulosActivos = modulos.filter((m) => m.estatus === 'activo')
  const puestosActivos = puestos.filter((p) => p.estatus === 'activo')

  const [paso, setPaso] = useState<1 | 2 | 3 | 4 | 5>(1)

  // 1. Datos de Abordaje
  const [abordaje, setAbordaje] = useState<DatosAbordaje>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    edad: '',
    escolaridad: 'Secundaria',
    puestoInteres: 'Guardia de Seguridad Industrial 12x12',
    moduloAbordaje: modulosActivos[0]?.nombre || 'Módulo S-Mart Independencia',
    fecha: new Date().toISOString().substring(0, 10),
  })

  // 2. Examen de Razonamiento VER5
  const [razonamiento, setRazonamiento] = useState<ExamenRazonamientoRespuestas>({
    dondeEncontroMochila: '',
    queHabiaEnMochila: '',
    queDeciaNota: '',
    comoSeSentioAna: '',
    op1_40_mas: '',
    op2_200_mas: '',
    op3_20_mas: '',
    op4_menos_60: '',
    op5_menos_50: '',
    op6_85_menos: '',
    op7_32_mas: '',
    op8_70_mas: '',
    op9_78_mas: '',
    op10_70_menos: '',
    op11_96_menos: '',
    op12_45_menos: '',
    palabraAuto: '',
    pastorOvejas: '',
    trenSobrevivientes: '',
    paradojaMentira: '',
    huevoGallo: '',
  })

  // 3. Cuestionario de Entrevista Oficial RH
  const [cuestionario, setCuestionario] = useState<CuestionarioEntrevistaRespuestas>({
    p1_valores: '',
    p2_experienciaSeguridad: 'no',
    p3_funcionesGuardia: '',
    p4_reporteIncidente: 'jefe_grupo_ceps',
    p5_reaccionRobo: 'reporto_jefe',
    p6_motivoInteres: 'sueldo',
    p6_motivoInteresDetalle: '',
    p7_motivoRenuncia: '',
    p8_descripcionExperiencia: '',
    p9_autorizaReferencias: 'si',
    p10_nivelTolerancia: 8,
  })

  // 4. Solicitud de Empleo Digital
  const [solicitud, setSolicitud] = useState<SolicitudEmpleoDigital>({
    curp: '',
    rfc: '',
    nss: '',
    fechaNacimiento: '',
    estadoCivil: 'Soltero',
    calleNumero: '',
    colonia: '',
    codigoPostal: '32000',
    entrecalles: '',
    tiempoEnJuarez: 'Más de 5 años',
    ultimoEmpleoEmpresa: '',
    ultimoEmpleoPuesto: '',
    ultimoEmpleoSueldo: '',
    nombreFamiliarReferencia: '',
    telefonoFamiliarReferencia: '',
  })

  // 5. Checklist Papelería
  const [checklist, setChecklist] = useState<ChecklistPapeleriaOriginal>({
    ineOriginalPresentada: true,
    curpPresentada: true,
    rfcPresentada: true,
    nssPresentada: true,
    comprobanteDomicilioPresentado: true,
    comprobanteEstudiosPresentado: true,
    actaNacimientoPresentada: true,
    cartaNoPenalesPresentada: false,
    papeleriaCompleta: false,
    documentosPendientes: ['Carta de No Antecedentes Penales'],
  })

  const [erroresPaso, setErroresPaso] = useState<string | null>(null)

  if (!isOpen) return null

  // Calcular evaluación del examen de razonamiento
  const evaluarRazonamiento = (): ExamenRazonamientoEvaluacion => {
    let erroresLectura = 0
    if (razonamiento.dondeEncontroMochila !== 'En el parque') erroresLectura++
    if (razonamiento.queHabiaEnMochila !== 'Una nota') erroresLectura++
    if (razonamiento.queDeciaNota !== '"Gracias por cuidar mis cosas. Mi nombre es Ana"') erroresLectura++
    if (razonamiento.comoSeSentioAna !== 'Agradecida') erroresLectura++

    let erroresAritmetica = 0
    if (razonamiento.op1_40_mas.trim() !== '40') erroresAritmetica++
    if (razonamiento.op2_200_mas.trim() !== '250') erroresAritmetica++
    if (razonamiento.op3_20_mas.trim() !== '25') erroresAritmetica++
    if (razonamiento.op4_menos_60.trim() !== '80') erroresAritmetica++
    if (razonamiento.op5_menos_50.trim() !== '200') erroresAritmetica++
    if (razonamiento.op6_85_menos.trim() !== '45') erroresAritmetica++
    if (razonamiento.op7_32_mas.trim() !== '0') erroresAritmetica++
    if (razonamiento.op8_70_mas.trim() !== '35') erroresAritmetica++
    if (razonamiento.op9_78_mas.trim() !== '22') erroresAritmetica++
    if (razonamiento.op10_70_menos.trim() !== '30') erroresAritmetica++
    if (razonamiento.op11_96_menos.trim() !== '60') erroresAritmetica++
    if (razonamiento.op12_45_menos.trim() !== '20') erroresAritmetica++

    let erroresLogica = 0
    const pAuto = razonamiento.palabraAuto.toLowerCase()
    if (!pAuto.includes('no') && !pAuto.includes('o') && !pAuto.includes('incorrecto')) erroresLogica++

    const pOvejas = razonamiento.pastorOvejas.toLowerCase()
    if (!pOvejas.includes('12') && !pOvejas.includes('doce') && !pOvejas.includes('todas')) erroresLogica++

    const pTren = razonamiento.trenSobrevivientes.toLowerCase()
    if (
      !pTren.includes('no se entierran') &&
      !pTren.includes('vivos') &&
      !pTren.includes('ningun') &&
      !pTren.includes('sobreviven')
    )
      erroresLogica++

    const pParadoja = razonamiento.paradojaMentira.toLowerCase()
    if (
      !pParadoja.includes('paradoja') &&
      !pParadoja.includes('ninguna') &&
      !pParadoja.includes('contradic') &&
      !pParadoja.includes('mentira') &&
      !pParadoja.includes('trampa')
    )
      erroresLogica++

    const pHuevo = razonamiento.huevoGallo.toLowerCase()
    if (
      !pHuevo.includes('no ponen') &&
      !pHuevo.includes('ningun') &&
      !pHuevo.includes('gallo no') &&
      !pHuevo.includes('gallina')
    )
      erroresLogica++

    const totalErrores = erroresLectura + erroresAritmetica + erroresLogica
    const aprobado = totalErrores <= 8

    return {
      erroresLectura,
      erroresAritmetica,
      erroresLogica,
      totalErrores,
      aprobado,
      requiereComitePerfiles: !aprobado,
      observaciones: aprobado
        ? `Aprobó el examen con ${totalErrores} errores (máximo permitido: 8).`
        : `Excedió el límite con ${totalErrores} errores. Requiere visto bueno de Comité de Perfiles.`,
    }
  }

  // Avanzar de paso con validación
  const avanzarPaso = () => {
    setErroresPaso(null)
    if (paso === 1) {
      if (!abordaje.nombre.trim() || !abordaje.apellidoPaterno.trim()) {
        setErroresPaso('Por favor capture el nombre y apellido paterno del candidato.')
        return
      }
      if (!abordaje.telefono.trim() || abordaje.telefono.length < 8) {
        setErroresPaso('Por favor capture un número de teléfono válido de contacto.')
        return
      }
      if (!abordaje.edad.trim() || isNaN(Number(abordaje.edad))) {
        setErroresPaso('Por favor capture la edad del aspirante.')
        return
      }
      setPaso(2)
      return
    }

    if (paso === 2) {
      // Examen de razonamiento
      if (!razonamiento.dondeEncontroMochila || !razonamiento.queHabiaEnMochila) {
        setErroresPaso('Por favor complete las preguntas de comprensión de lectura.')
        return
      }
      setPaso(3)
      return
    }

    if (paso === 3) {
      // Cuestionario de entrevista
      if (!cuestionario.p1_valores.trim()) {
        setErroresPaso('Por favor capture los valores que representan al candidato.')
        return
      }
      if (!cuestionario.p3_funcionesGuardia.trim()) {
        setErroresPaso('Por favor capture las funciones que el guardia conoce o desempeñará.')
        return
      }
      setPaso(4)
      return
    }

    if (paso === 4) {
      // Solicitud de empleo digital
      if (!solicitud.calleNumero.trim() || !solicitud.colonia.trim()) {
        setErroresPaso('Por favor capture el domicilio (calle, número y colonia).')
        return
      }
      setPaso(5)
      return
    }
  }

  const retrocederPaso = () => {
    setErroresPaso(null)
    if (paso > 1) setPaso((p) => (p - 1) as 1 | 2 | 3 | 4 | 5)
  }

  // Guardar y Finalizar Expediente Oficial
  const finalizarExpediente = () => {
    const evaluacionRaz = evaluarRazonamiento()
    const auditoriaInt = calcularAuditoriaIntegridad(
      cuestionario,
      evaluacionRaz,
      'Reclutador en Módulo CEPS'
    )

    // Generar Folio consecutivo oficial
    const siguienteNumero = 1200 + (expedientes.length + 1) * 3
    const folioGenerado = `CEPS-2026-${siguienteNumero}`

    // Determinar estatus inicial
    let estatusFinal: ExpedienteGuardia['estatus'] = 'aprobado_servicio'
    if (auditoriaInt.riesgoRobo === 'alto_critico') {
      estatusFinal = 'vetado_alerta'
    } else if (!evaluacionRaz.aprobado || auditoriaInt.dictamenReclutador === 'reserva') {
      estatusFinal = 'en_reserva'
    }

    const nuevoExpediente: ExpedienteGuardia = {
      id: `exp-${Date.now()}`,
      folio: folioGenerado,
      estatus: estatusFinal,
      fechaCreacion: new Date().toISOString().substring(0, 10),
      abordaje,
      examenRazonamiento: {
        respuestas: razonamiento,
        evaluacion: evaluacionRaz,
      },
      cuestionarioEntrevista: {
        respuestas: cuestionario,
        auditoria: auditoriaInt,
      },
      solicitudEmpleo: solicitud,
      checklistPapeleria: checklist,
      historialEventos: [
        {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          tipo: 'creacion',
          descripcion: `Abordaje y entrevista de campo completada en ${abordaje.moduloAbordaje}.`,
          autor: 'Reclutador en Campo CEPS',
        },
        {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          tipo: 'evaluacion_razonamiento',
          descripcion: `Examen de Razonamiento VER5: ${evaluacionRaz.totalErrores} errores (${
            evaluacionRaz.aprobado ? 'Aprobado' : 'Comité de Perfiles'
          }).`,
          autor: 'Reclutador en Campo CEPS',
        },
        {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          tipo: 'entrevista_rh',
          descripcion: `Cuestionario de Entrevista de RH: Dictamen ${auditoriaInt.dictamenReclutador.toUpperCase()}.`,
          autor: 'Reclutador en Campo CEPS',
        },
        {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          tipo: 'solicitud_completada',
          descripcion: 'Solicitud de empleo digital capturada en tablet sin tachaduras.',
          autor: 'Reclutador en Campo CEPS',
        },
      ],
    }

    guardarNuevoExpediente(nuevoExpediente)
    if (onSuccess) onSuccess(folioGenerado)
    onClose()
  }

  // Chips para valores rápidos en tablet
  const valoresComunes = [
    'Puntualidad',
    'Honestidad',
    'Lealtad',
    'Disciplina',
    'Respeto',
    'Compromiso',
    'Trabajo en Equipo',
  ]

  const toggleValorChip = (valor: string) => {
    if (cuestionario.p1_valores.includes(valor)) {
      setCuestionario({
        ...cuestionario,
        p1_valores: cuestionario.p1_valores.replace(valor, '').replace(', ,', ',').trim(),
      })
    } else {
      const nuevo = cuestionario.p1_valores
        ? `${cuestionario.p1_valores}, ${valor}`
        : valor
      setCuestionario({ ...cuestionario, p1_valores: nuevo })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#EDF2F7] w-full max-w-4xl rounded-3xl shadow-2xl border-4 border-[#0A162B] flex flex-col overflow-hidden my-auto max-h-[95vh]">
        {/* Encabezado Institucional Táctil */}
        <div className="bg-[#0A162B] text-white px-5 sm:px-8 py-4 border-b-4 border-[#D4AF37] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] text-[#0A162B] flex items-center justify-center font-black text-xl shadow-md">
              ⚡
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                Entrevista y Abordaje en Campo (Tablet)
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Protocolo Operativo de 5 Etapas &bull; CEPS Paso del Norte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper Táctil Superior (5 Pasos) */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b-2 border-slate-300 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {[
            { num: 1, label: '1. Recepción', icon: UserCheck },
            { num: 2, label: '2. Razonamiento', icon: Brain },
            { num: 3, label: '3. Cuestionario RH', icon: ShieldCheck },
            { num: 4, label: '4. Solicitud Digital', icon: FileText },
            { num: 5, label: '5. Checklist & Folio', icon: ClipboardList },
          ].map((item) => {
            const Icon = item.icon
            const activo = paso === item.num
            const completado = paso > item.num
            return (
              <div
                key={item.num}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  activo
                    ? 'bg-[#0A162B] text-[#D4AF37] ring-2 ring-[#D4AF37] shadow-sm'
                    : completado
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {completado ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.num}</span>
              </div>
            )
          })}
        </div>

        {/* Mensaje de error / validación */}
        {erroresPaso && (
          <div className="bg-amber-100 border-l-4 border-amber-600 p-3 text-amber-950 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            {erroresPaso}
          </div>
        )}

        {/* Contenido Dinámico por Paso */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================================= */}
          {/* PASO 1: RECEPCIÓN Y PAPELERÍA ORIGINAL                                    */}
          {/* ========================================================================= */}
          {paso === 1 && (
            <div className="space-y-5">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-xs text-blue-950 font-medium">
                <span className="font-extrabold text-blue-900 block text-sm mb-1">
                  Paso 1: Recepción inicial de papelería física y datos de contacto
                </span>
                El reclutador verifica visualmente que el aspirante presente sus documentos originales mientras captura su identidad básica de contacto.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Nombre(s) *
                  </label>
                  <input
                    type="text"
                    value={abordaje.nombre}
                    onChange={(e) => setAbordaje({ ...abordaje, nombre: e.target.value })}
                    placeholder="Ej. Juan Carlos"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    value={abordaje.apellidoPaterno}
                    onChange={(e) => setAbordaje({ ...abordaje, apellidoPaterno: e.target.value })}
                    placeholder="Ej. González"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    value={abordaje.apellidoMaterno}
                    onChange={(e) => setAbordaje({ ...abordaje, apellidoMaterno: e.target.value })}
                    placeholder="Ej. Morales"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Teléfono Celular *
                  </label>
                  <input
                    type="tel"
                    value={abordaje.telefono}
                    onChange={(e) => setAbordaje({ ...abordaje, telefono: e.target.value })}
                    placeholder="656 123 4567"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Edad *
                  </label>
                  <input
                    type="number"
                    value={abordaje.edad}
                    onChange={(e) => setAbordaje({ ...abordaje, edad: e.target.value })}
                    placeholder="Ej. 32"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Escolaridad Concluida *
                  </label>
                  <select
                    value={abordaje.escolaridad}
                    onChange={(e) =>
                      setAbordaje({ ...abordaje, escolaridad: e.target.value as EscolaridadCandidato })
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  >
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Preparatoria / Bachillerato">Preparatoria / Bachillerato</option>
                    <option value="Carrera Técnica">Carrera Técnica</option>
                    <option value="Licenciatura trunca o concluida">Licenciatura</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Módulo de Abordaje CEPS *
                  </label>
                  <select
                    value={abordaje.moduloAbordaje}
                    onChange={(e) => setAbordaje({ ...abordaje, moduloAbordaje: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  >
                    {modulosActivos.map((m) => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre} ({m.zona})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Puesto de Interés *
                  </label>
                  <select
                    value={abordaje.puestoInteres}
                    onChange={(e) => setAbordaje({ ...abordaje, puestoInteres: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#0A162B]"
                  >
                    {puestosActivos.map((p) => (
                      <option key={p.id} value={p.titulo}>
                        {p.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cotejo Rápido de Documentos en Mano */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-300">
                <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block mb-3">
                  Verificación de Papelería en Mano (Documentos Originales)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: 'ineOriginalPresentada', label: 'INE Original' },
                    { key: 'actaNacimientoPresentada', label: 'Acta de Nacimiento' },
                    { key: 'curpPresentada', label: 'CURP' },
                    { key: 'rfcPresentada', label: 'RFC / SAT' },
                    { key: 'nssPresentada', label: 'NSS (IMSS)' },
                    { key: 'comprobanteDomicilioPresentado', label: 'Comp. Domicilio' },
                    { key: 'comprobanteEstudiosPresentado', label: 'Comp. Estudios' },
                    { key: 'cartaNoPenalesPresentada', label: 'Carta No Penales' },
                  ].map((doc) => {
                    const k = doc.key as keyof ChecklistPapeleriaOriginal
                    const checked = !!checklist[k]
                    return (
                      <button
                        type="button"
                        key={doc.key}
                        onClick={() => setChecklist({ ...checklist, [k]: !checked })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition flex items-center justify-between text-left ${
                          checked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{doc.label}</span>
                        {checked ? (
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0"></span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 2: EXAMEN DE RAZONAMIENTO VER5 (PRIMER FILTRO)                       */}
          {/* ========================================================================= */}
          {paso === 2 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-950 font-medium flex items-start gap-3">
                <Brain className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-900 text-sm block">
                    Examen de Razonamiento (Versión Oficial 5)
                  </span>
                  El candidato contesta este filtro en la tablet mientras el reclutador organiza los documentos. Se permiten un máximo de 8 errores.
                </div>
              </div>

              {/* Bloque 1: Comprensión Lectora */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 italic leading-relaxed">
                  "Un guardia de seguridad encontró una mochila olvidada en el parque. La revisó cuidadosamente y encontró una nota que decía: 'Gracias por cuidar mis cosas. Mi nombre es Ana'. El guardia devolvió la mochila a Ana, quien estaba muy agradecida."
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-1.5">
                      1. ¿Dónde encontró el guardia la mochila?
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {['En la escuela', 'En el parque', 'En la tienda'].map((op) => (
                        <button
                          type="button"
                          key={op}
                          onClick={() => setRazonamiento({ ...razonamiento, dondeEncontroMochila: op })}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left border-2 transition ${
                            razonamiento.dondeEncontroMochila === op
                              ? 'bg-[#0A162B] text-white border-[#0A162B]'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-1.5">
                      2. ¿Qué había en la mochila que encontró el guardia?
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {['Juguetes', 'Una nota', 'Ropa'].map((op) => (
                        <button
                          type="button"
                          key={op}
                          onClick={() => setRazonamiento({ ...razonamiento, queHabiaEnMochila: op })}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left border-2 transition ${
                            razonamiento.queHabiaEnMochila === op
                              ? 'bg-[#0A162B] text-white border-[#0A162B]'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-1.5">
                      3. ¿Qué decía la nota en la mochila?
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {[
                        '"Te regalo mi mochila"',
                        '"Gracias por cuidar mis cosas. Mi nombre es Ana"',
                        '"No quiero mi mochila de vuelta"',
                      ].map((op) => (
                        <button
                          type="button"
                          key={op}
                          onClick={() => setRazonamiento({ ...razonamiento, queDeciaNota: op })}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left border-2 transition ${
                            razonamiento.queDeciaNota === op
                              ? 'bg-[#0A162B] text-white border-[#0A162B]'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-1.5">
                      4. ¿Cómo se sintió Ana cuando recuperó su mochila?
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {['Enojada', 'Agradecida', 'Triste'].map((op) => (
                        <button
                          type="button"
                          key={op}
                          onClick={() => setRazonamiento({ ...razonamiento, comoSeSentioAna: op })}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left border-2 transition ${
                            razonamiento.comoSeSentioAna === op
                              ? 'bg-[#0A162B] text-white border-[#0A162B]'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Aritmética Rápida Táctil */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
                <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block">
                  Operaciones Aritméticas (Complete el número faltante)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">40 + ___ = 80</span>
                    <input
                      type="text"
                      value={razonamiento.op1_40_mas}
                      onChange={(e) => setRazonamiento({ ...razonamiento, op1_40_mas: e.target.value })}
                      placeholder="?"
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-sm"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">200 + ___ = 450</span>
                    <input
                      type="text"
                      value={razonamiento.op2_200_mas}
                      onChange={(e) => setRazonamiento({ ...razonamiento, op2_200_mas: e.target.value })}
                      placeholder="?"
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-sm"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">20 + ___ = 45</span>
                    <input
                      type="text"
                      value={razonamiento.op3_20_mas}
                      onChange={(e) => setRazonamiento({ ...razonamiento, op3_20_mas: e.target.value })}
                      placeholder="?"
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-sm"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">___ - 60 = 20</span>
                    <input
                      type="text"
                      value={razonamiento.op4_menos_60}
                      onChange={(e) => setRazonamiento({ ...razonamiento, op4_menos_60: e.target.value })}
                      placeholder="?"
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-sm"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">___ - 50 = 150</span>
                    <input
                      type="text"
                      value={razonamiento.op5_menos_50}
                      onChange={(e) => setRazonamiento({ ...razonamiento, op5_menos_50: e.target.value })}
                      placeholder="?"
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-sm"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">85 - ___ = 40</span>
                    <input
                      type="text"
                      value={razonamiento.op6_85_menos}
                      onChange={(e) => setRazonamiento({ ...razonamiento, op6_85_menos: e.target.value })}
                      placeholder="?"
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-sm"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">32 + ___ = 32</span>
                    <input
                      type="text"
                      value={razonamiento.op7_32_mas}
                      onChange={(e) => setRazonamiento({ ...razonamiento, op7_32_mas: e.target.value })}
                      placeholder="?"
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-sm"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">70 - ___ = 40</span>
                    <input
                      type="text"
                      value={razonamiento.op10_70_menos}
                      onChange={(e) => setRazonamiento({ ...razonamiento, op10_70_menos: e.target.value })}
                      placeholder="?"
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 3: Preguntas de Lógica Capciosa */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
                <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block">
                  Preguntas de Razonamiento y Lógica
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      • La palabra "auto" empieza con la letra A y finaliza con F. ¿Es correcto?
                    </label>
                    <input
                      type="text"
                      value={razonamiento.palabraAuto}
                      onChange={(e) => setRazonamiento({ ...razonamiento, palabraAuto: e.target.value })}
                      placeholder="Ej. No, termina con la letra O"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      • Un pastor tiene 20 ovejas. 8 se mueren, 3 se enferman y 2 se escapan. ¿Cuántas sobreviven?
                    </label>
                    <input
                      type="text"
                      value={razonamiento.pastorOvejas}
                      onChange={(e) => setRazonamiento({ ...razonamiento, pastorOvejas: e.target.value })}
                      placeholder="Ej. 12 ovejas"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      • Un tren descarrila en la frontera México/EE.UU., ¿dónde entierran a los sobrevivientes?
                    </label>
                    <input
                      type="text"
                      value={razonamiento.trenSobrevivientes}
                      onChange={(e) =>
                        setRazonamiento({ ...razonamiento, trenSobrevivientes: e.target.value })
                      }
                      placeholder="Ej. A los sobrevivientes no se les entierra"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      • Hay un gallo en la cima de un granero. Si pone un huevo, ¿hacia qué lado rodaría?
                    </label>
                    <input
                      type="text"
                      value={razonamiento.huevoGallo}
                      onChange={(e) => setRazonamiento({ ...razonamiento, huevoGallo: e.target.value })}
                      placeholder="Ej. Los gallos no ponen huevos"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3: CUESTIONARIO DE ENTREVISTA OFICIAL RH (10 PREGUNTAS)              */}
          {/* ========================================================================= */}
          {paso === 3 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-xs text-emerald-950 font-medium">
                <span className="font-extrabold text-emerald-900 text-sm block mb-1">
                  Cuestionario de Entrevista Oficial CEPS (10 Preguntas)
                </span>
                Evaluación de valores, apego a protocolos de mando, honestidad patrimonial y nivel de tolerancia. Las opciones se presentan de forma neutral en la pantalla.
              </div>

              {/* P1. Valores */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-3">
                <label className="text-xs font-extrabold text-slate-900 block">
                  1. ¿Qué valores te representan? *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {valoresComunes.map((val) => {
                    const activo = cuestionario.p1_valores.includes(val)
                    return (
                      <button
                        type="button"
                        key={val}
                        onClick={() => toggleValorChip(val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          activo
                            ? 'bg-[#0A162B] text-[#D4AF37]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {activo && '✓ '}
                        {val}
                      </button>
                    )
                  })}
                </div>
                <textarea
                  rows={2}
                  value={cuestionario.p1_valores}
                  onChange={(e) => setCuestionario({ ...cuestionario, p1_valores: e.target.value })}
                  placeholder="Describa los valores principales o agregue detalles..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              {/* P2 y P3: Experiencia y Funciones */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-900 block mb-2">
                    2. ¿Cuenta usted con experiencia en seguridad industrial y patrimonial? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCuestionario({ ...cuestionario, p2_experienciaSeguridad: 'si' })}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition ${
                        cuestionario.p2_experienciaSeguridad === 'si'
                          ? 'bg-[#0A162B] text-white border-[#0A162B]'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      A) SÍ
                    </button>
                    <button
                      type="button"
                      onClick={() => setCuestionario({ ...cuestionario, p2_experienciaSeguridad: 'no' })}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition ${
                        cuestionario.p2_experienciaSeguridad === 'no'
                          ? 'bg-[#0A162B] text-white border-[#0A162B]'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      B) NO
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-900 block mb-2">
                    3. ¿Cuáles son las funciones que realiza un guardia? *
                  </label>
                  <textarea
                    rows={2}
                    value={cuestionario.p3_funcionesGuardia}
                    onChange={(e) =>
                      setCuestionario({ ...cuestionario, p3_funcionesGuardia: e.target.value })
                    }
                    placeholder="Ej. Control de accesos, rondines perimetrales, libro de novedades..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none"
                  />
                </div>
              </div>

              {/* P4 y P5: Cadena de Mando e Integridad ante Robo */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-extrabold text-slate-900 block mb-2">
                    4. ¿A quién acudiría para reportar un incidente o problema? *
                  </label>
                  <div className="space-y-2">
                    {[
                      { val: 'seguridad_interna', label: 'A) Seguridad (interna de la empresa/planta)' },
                      { val: 'jefe_grupo_ceps', label: 'B) Jefe de grupo (CEPS)' },
                      { val: 'supervisor_ceps', label: 'C) Supervisor (CEPS)' },
                    ].map((op) => (
                      <button
                        type="button"
                        key={op.val}
                        onClick={() =>
                          setCuestionario({
                            ...cuestionario,
                            p4_reporteIncidente: op.val as CuestionarioEntrevistaRespuestas['p4_reporteIncidente'],
                          })
                        }
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left border-2 transition ${
                          cuestionario.p4_reporteIncidente === op.val
                            ? 'bg-[#0A162B] text-white border-[#0A162B]'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-900 block mb-2">
                    5. ¿Si ves que un compañero está robando, qué harías? *
                  </label>
                  <div className="space-y-2">
                    {[
                      { val: 'reporto_jefe', label: 'A) Lo reporto con mi jefe inmediato' },
                      { val: 'ayudo', label: 'B) Le ayudo' },
                      { val: 'no_digo_nada', label: 'C) No digo nada' },
                    ].map((op) => (
                      <button
                        type="button"
                        key={op.val}
                        onClick={() =>
                          setCuestionario({
                            ...cuestionario,
                            p5_reaccionRobo: op.val as CuestionarioEntrevistaRespuestas['p5_reaccionRobo'],
                          })
                        }
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left border-2 transition ${
                          cuestionario.p5_reaccionRobo === op.val
                            ? 'bg-[#0A162B] text-white border-[#0A162B]'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* P6, P7, P8, P9: Motivación y Antecedentes */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-2">
                      6. ¿Por qué le interesa trabajar con nosotros? *
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[
                        { val: 'experiencia', label: 'Experiencia' },
                        { val: 'sueldo', label: 'Sueldo' },
                        { val: 'otros', label: 'Otros' },
                      ].map((op) => (
                        <button
                          type="button"
                          key={op.val}
                          onClick={() =>
                            setCuestionario({
                              ...cuestionario,
                              p6_motivoInteres: op.val as CuestionarioEntrevistaRespuestas['p6_motivoInteres'],
                            })
                          }
                          className={`py-2 rounded-xl text-xs font-bold border-2 transition ${
                            cuestionario.p6_motivoInteres === op.val
                              ? 'bg-[#0A162B] text-white border-[#0A162B]'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          {op.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={cuestionario.p6_motivoInteresDetalle}
                      onChange={(e) =>
                        setCuestionario({ ...cuestionario, p6_motivoInteresDetalle: e.target.value })
                      }
                      placeholder="Detalles adicionales del interés..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-2">
                      7. ¿Cuál fue el motivo de renuncia de su último empleo?
                    </label>
                    <textarea
                      rows={2}
                      value={cuestionario.p7_motivoRenuncia}
                      onChange={(e) =>
                        setCuestionario({ ...cuestionario, p7_motivoRenuncia: e.target.value })
                      }
                      placeholder="Ej. Cierre de línea, búsqueda de mejores ingresos..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-2">
                      8. Describe tu experiencia laboral previa:
                    </label>
                    <textarea
                      rows={2}
                      value={cuestionario.p8_descripcionExperiencia}
                      onChange={(e) =>
                        setCuestionario({ ...cuestionario, p8_descripcionExperiencia: e.target.value })
                      }
                      placeholder="Puestos anteriores, empresas o actividades realizadas..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-2">
                      9. ¿Podría CEPS pedir referencias laborales en su anterior empleo?
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setCuestionario({ ...cuestionario, p9_autorizaReferencias: 'si' })}
                        className={`py-3 rounded-xl text-xs font-bold border-2 transition ${
                          cuestionario.p9_autorizaReferencias === 'si'
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        ✓ SÍ AUTORIZA
                      </button>
                      <button
                        type="button"
                        onClick={() => setCuestionario({ ...cuestionario, p9_autorizaReferencias: 'no' })}
                        className={`py-3 rounded-xl text-xs font-bold border-2 transition ${
                          cuestionario.p9_autorizaReferencias === 'no'
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        ✗ NO AUTORIZA
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* P10: Nivel de Tolerancia (Escala del 1 al 10) */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900">
                    10. En una escala del 1 al 10, ¿cómo considera su nivel de tolerancia? *
                  </label>
                  <span className="text-sm font-black text-[#0A162B] bg-[#D4AF37] px-3 py-0.5 rounded-lg">
                    {cuestionario.p10_nivelTolerancia} / 10
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setCuestionario({ ...cuestionario, p10_nivelTolerancia: num })}
                      className={`py-3 rounded-xl text-xs sm:text-sm font-black transition border-2 ${
                        cuestionario.p10_nivelTolerancia === num
                          ? 'bg-[#0A162B] text-[#D4AF37] border-[#0A162B] shadow-md scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600 px-1">
                  <span>1: Muy Poca Tolerancia</span>
                  <span>5: Tolerancia Media</span>
                  <span>10: Máxima Tolerancia</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 4: SOLICITUD DE EMPLEO DIGITAL (SIN TACHADURAS)                      */}
          {/* ========================================================================= */}
          {paso === 4 && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border-2 border-indigo-300 rounded-2xl p-4 text-xs text-indigo-950 font-medium">
                <span className="font-extrabold text-indigo-900 text-sm block mb-1">
                  Solicitud de Empleo Digital (Captura en Tablet sin Descarte de Hojas)
                </span>
                Se desbloquea tras aprobar los filtros anteriores. Reemplaza la solicitud física a mano, eliminando el dolor de desechar formatos completos por tachaduras o borrones.
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
                <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block">
                  Identificadores Oficiales
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">CURP</label>
                    <input
                      type="text"
                      value={solicitud.curp}
                      onChange={(e) =>
                        setSolicitud({ ...solicitud, curp: e.target.value.toUpperCase() })
                      }
                      placeholder="18 caracteres"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">RFC</label>
                    <input
                      type="text"
                      value={solicitud.rfc}
                      onChange={(e) => setSolicitud({ ...solicitud, rfc: e.target.value.toUpperCase() })}
                      placeholder="13 caracteres"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      NSS (Número de Seguro Social)
                    </label>
                    <input
                      type="text"
                      value={solicitud.nss}
                      onChange={(e) => setSolicitud({ ...solicitud, nss: e.target.value })}
                      placeholder="11 dígitos"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Estado Civil
                    </label>
                    <select
                      value={solicitud.estadoCivil}
                      onChange={(e) =>
                        setSolicitud({
                          ...solicitud,
                          estadoCivil: e.target.value as SolicitudEmpleoDigital['estadoCivil'],
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Unión Libre">Unión Libre</option>
                      <option value="Divorciado">Divorciado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Tiempo radicado en Ciudad Juárez
                    </label>
                    <input
                      type="text"
                      value={solicitud.tiempoEnJuarez}
                      onChange={(e) => setSolicitud({ ...solicitud, tiempoEnJuarez: e.target.value })}
                      placeholder="Ej. Toda la vida / 5 años"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Domicilio en Ciudad Juárez */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
                <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block">
                  Domicilio en Ciudad Juárez
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Calle y Número *
                    </label>
                    <input
                      type="text"
                      value={solicitud.calleNumero}
                      onChange={(e) => setSolicitud({ ...solicitud, calleNumero: e.target.value })}
                      placeholder="Ej. Av. De las Torres 4500"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Colonia / Fraccionamiento *
                    </label>
                    <input
                      type="text"
                      value={solicitud.colonia}
                      onChange={(e) => setSolicitud({ ...solicitud, colonia: e.target.value })}
                      placeholder="Ej. Praderas del Sol"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Entrecalles y Referencias
                    </label>
                    <input
                      type="text"
                      value={solicitud.entrecalles}
                      onChange={(e) => setSolicitud({ ...solicitud, entrecalles: e.target.value })}
                      placeholder="Ej. Entre Hiedra y Sol de Mayo"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={solicitud.codigoPostal}
                      onChange={(e) => setSolicitud({ ...solicitud, codigoPostal: e.target.value })}
                      placeholder="32000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Referencia Familiar en Juárez */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Familiar de Referencia en Ciudad Juárez
                  </label>
                  <input
                    type="text"
                    value={solicitud.nombreFamiliarReferencia}
                    onChange={(e) =>
                      setSolicitud({ ...solicitud, nombreFamiliarReferencia: e.target.value })
                    }
                    placeholder="Ej. María Valles (Esposa / Madre)"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Teléfono del Familiar
                  </label>
                  <input
                    type="tel"
                    value={solicitud.telefonoFamiliarReferencia}
                    onChange={(e) =>
                      setSolicitud({ ...solicitud, telefonoFamiliarReferencia: e.target.value })
                    }
                    placeholder="656 999 8877"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 5: CHECKLIST FINAL, DICTAMEN Y GENERACIÓN DE FOLIO                   */}
          {/* ========================================================================= */}
          {paso === 5 && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-5 rounded-2xl border-2 border-[#D4AF37] space-y-2">
                <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider block">
                  Resumen de Integridad y Expediente en Construcción
                </span>
                <p className="text-sm font-bold">
                  {abordaje.nombre} {abordaje.apellidoPaterno} {abordaje.apellidoMaterno}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                  <span>📱 {abordaje.telefono}</span>
                  <span>&bull;</span>
                  <span>🎂 {abordaje.edad} años</span>
                  <span>&bull;</span>
                  <span>📍 {abordaje.moduloAbordaje}</span>
                  <span>&bull;</span>
                  <span>🛡️ {abordaje.puestoInteres}</span>
                </div>
              </div>

              {/* Dictamen del Examen de Razonamiento */}
              {(() => {
                const evalRaz = evaluarRazonamiento()
                return (
                  <div
                    className={`p-4 rounded-2xl border-2 text-xs flex items-center justify-between ${
                      evalRaz.aprobado
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold block text-sm">
                        {evalRaz.aprobado
                          ? '✓ Examen de Razonamiento Aprobado'
                          : '⚠️ Razonamiento Excedió Errores (Comité de Perfiles)'}
                      </span>
                      <p className="font-medium mt-0.5">
                        Total de errores registrados: {evalRaz.totalErrores} (Lectura: {evalRaz.erroresLectura}, Aritmética: {evalRaz.erroresAritmetica}, Lógica: {evalRaz.erroresLogica}).
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-xl font-black text-xs ${
                        evalRaz.aprobado ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {evalRaz.aprobado ? 'APTO' : 'EN REVISIÓN'}
                    </span>
                  </div>
                )
              })()}

              {/* Confirmación del Checklist de Papelería */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-3">
                <span className="text-xs font-black text-[#0A162B] uppercase tracking-wider block">
                  Checklist Final de Papelería Recibida
                </span>
                <p className="text-xs text-slate-600 font-medium">
                  El reclutador coteja los originales antes de registrar formalmente el expediente.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                  {[
                    { label: 'INE Original', ok: checklist.ineOriginalPresentada },
                    { label: 'Acta Nacimiento', ok: checklist.actaNacimientoPresentada },
                    { label: 'CURP', ok: checklist.curpPresentada },
                    { label: 'RFC / SAT', ok: checklist.rfcPresentada },
                    { label: 'NSS IMSS', ok: checklist.nssPresentada },
                    { label: 'Comp. Domicilio', ok: checklist.comprobanteDomicilioPresentado },
                    { label: 'Comp. Estudios', ok: checklist.comprobanteEstudiosPresentado },
                    { label: 'Carta No Penales', ok: checklist.cartaNoPenalesPresentada },
                  ].map((it, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                        it.ok
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {it.ok ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>
                      )}
                      <span className="truncate">{it.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Firma y Emisión */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-semibold text-slate-700">
                Al confirmar, el sistema generará un <strong>Folio Oficial CEPS</strong> (ej. CEPS-2026-XXXX) y creará la carpeta clasificada en el <strong>Archivador de Expedientes</strong>, calculando la auditoría de integridad interna.
              </div>
            </div>
          )}
        </div>

        {/* Barra Inferior de Navegación Táctil (Botones Grandes) */}
        <div className="bg-white px-5 sm:px-8 py-4 border-t-2 border-slate-300 flex items-center justify-between gap-3">
          {paso > 1 ? (
            <button
              onClick={retrocederPaso}
              className="px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-slate-100 text-slate-800 hover:bg-slate-200 transition flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
          )}

          {paso < 5 ? (
            <button
              onClick={avanzarPaso}
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#0A162B] text-[#D4AF37] hover:bg-slate-800 transition flex items-center gap-2 shadow-lg"
            >
              Siguiente Paso
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={finalizarExpediente}
              className="px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 shadow-xl hover:scale-102"
            >
              <Save className="w-5 h-5" />
              Generar Expediente y Folio CEPS
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
