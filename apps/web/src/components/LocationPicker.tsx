import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Navigation, Compass, AlertCircle, Sparkles, Home, CheckCircle2, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'

export interface DomicilioData {
  calleNumero: string
  colonia: string
  codigoPostal: string
  entrecalles: string
  referencias: string
  tiempoEnJuarez: string
  latitud: number
  longitud: number
}

interface LocationPickerProps {
  valor: DomicilioData
  onChange: (nuevoValor: DomicilioData) => void
}

// Zonas de referencia rápida en Ciudad Juárez
const ZONAS_JUAREZ = [
  { nombre: 'Centro / Monumento', lat: 31.7394, lng: -106.4869 },
  { nombre: 'S-Mart Independencia', lat: 31.6421, lng: -106.4022 },
  { nombre: 'Las Torres / Henequén', lat: 31.6215, lng: -106.3892 },
  { nombre: 'Sendero / Gómez Morín', lat: 31.6852, lng: -106.3985 },
  { nombre: 'Riberas del Bravo', lat: 31.5794, lng: -106.2842 },
]

export const LocationPicker: React.FC<LocationPickerProps> = ({
  valor,
  onChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [gpsCargando, setGpsCargando] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [gpsExitoso, setGpsExitoso] = useState(false)
  const [geocodificando, setGeocodificando] = useState(false)
  const [camposAutollenados, setCamposAutollenados] = useState<string[] | null>(null)

  // Refs estables para callbacks de eventos en Leaflet
  const valorRef = useRef(valor)
  valorRef.current = valor
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Crear icono personalizado CEPS con SVG dorado para evitar problemas de assets 404 de Leaflet
  const cepsPinIcon = L.divIcon({
    className: 'custom-ceps-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: #0A162B;
        border: 3px solid #D4AF37;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      ">
        <div style="
          transform: rotate(45deg);
          width: 14px;
          height: 14px;
          background: #D4AF37;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  })

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Inicializar mapa centrado en las coordenadas guardadas o en Cd. Juárez
    const latInicial = valorRef.current.latitud || 31.6904
    const lngInicial = valorRef.current.longitud || -106.4245

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latInicial, lngInicial],
        zoom: 14,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([latInicial, lngInicial], {
        icon: cepsPinIcon,
        draggable: true,
      }).addTo(map)

      marker.bindPopup('<b style="color:#0A162B;">Ubicación de tu Domicilio</b><br>Arrastra este pin o haz clic en el mapa para ubicar tu casa.')

      // Evento de arrastre del pin
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChangeRef.current({
          ...valorRef.current,
          latitud: Number(pos.lat.toFixed(6)),
          longitud: Number(pos.lng.toFixed(6)),
        })
      })

      // Evento de clic en cualquier punto del mapa
      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        onChangeRef.current({
          ...valorRef.current,
          latitud: Number(e.latlng.lat.toFixed(6)),
          longitud: Number(e.latlng.lng.toFixed(6)),
        })
      })

      mapInstanceRef.current = map
      markerRef.current = marker

      // Reajuste de tamaño de contenedor
      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sincronizar pin si cambian externamente las coordenadas
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && valor.latitud && valor.longitud) {
      const currentPos = markerRef.current.getLatLng()
      if (currentPos.lat !== valor.latitud || currentPos.lng !== valor.longitud) {
        markerRef.current.setLatLng([valor.latitud, valor.longitud])
        mapInstanceRef.current.panTo([valor.latitud, valor.longitud])
      }
    }
  }, [valor.latitud, valor.longitud])

  // Geocodificación inversa para autollenar campos de formulario
  const autollenarDesdeCoordenadas = async (lat: number, lng: number) => {
    setGeocodificando(true)
    setGpsError(null)
    try {
      const res = await api.reverseGeocode(lat, lng)
      const autollenados: string[] = []
      const nuevoValor: DomicilioData = {
        ...valorRef.current,
        latitud: lat,
        longitud: lng,
      }

      if (res.calleNumero) {
        nuevoValor.calleNumero = res.calleNumero
        autollenados.push('Calle y Número')
      }
      if (res.colonia) {
        nuevoValor.colonia = res.colonia
        autollenados.push('Colonia')
      }
      if (res.codigoPostal) {
        nuevoValor.codigoPostal = res.codigoPostal
        autollenados.push('Código Postal')
      }
      if (
        !nuevoValor.tiempoEnJuarez &&
        (res.ciudad?.toLowerCase().includes('juárez') ||
          res.ciudad?.toLowerCase().includes('juarez'))
      ) {
        nuevoValor.tiempoEnJuarez = 'Toda la vida'
        autollenados.push('Tiempo en Juárez')
      }

      onChangeRef.current(nuevoValor)
      if (autollenados.length > 0) {
        setCamposAutollenados(autollenados)
        setGpsExitoso(true)
      }
    } catch {
      onChangeRef.current({
        ...valorRef.current,
        latitud: lat,
        longitud: lng,
      })
    } finally {
      setGeocodificando(false)
    }
  }

  // Obtener geolocalización GPS del dispositivo y autollenar formulario
  const usarGpsActual = () => {
    setGpsCargando(true)
    setGpsError(null)
    setCamposAutollenados(null)

    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización por GPS.')
      setGpsCargando(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17)
          markerRef.current.setLatLng([lat, lng])
          markerRef.current.openPopup()
        }

        setGpsCargando(false)
        await autollenarDesdeCoordenadas(lat, lng)
      },
      (err) => {
        setGpsError(
          'No se pudo obtener la señal GPS: ' +
            err.message +
            '. Por favor, ubica el pin manualmente en el mapa.'
        )
        setGpsCargando(false)
        setGpsExitoso(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const centrarEnZona = (lat: number, lng: number) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15)
      markerRef.current.setLatLng([lat, lng])
      onChange({
        ...valor,
        latitud: lat,
        longitud: lng,
      })
    }
  }

  return (
    <div className="flex flex-col gap-5 text-slate-800">
      {/* Explicación del Croquis Digital */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3">
        <Compass className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm">Croquis Domiciliario Digital (Sustituye el dibujo a mano)</h4>
          <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
            Arrastra el marcador dorado en el mapa hasta posicionarlo exactamente sobre el techo o entrada de tu domicilio. Esto permite a los supervisores de CEPS validar tu ruta de transporte.
          </p>
        </div>
      </div>

      {/* Botón Destacado: Llenado Automático (Estoy en Casa) */}
      <div className="bg-gradient-to-r from-[#0A162B] via-[#0f203c] to-[#162746] p-4 sm:p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded-xl text-[#D4AF37] flex-shrink-0 shadow-inner">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded border border-[#D4AF37]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Llenado Inteligente
              </span>
              {gpsExitoso && (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Domicilio fijado por GPS
                </span>
              )}
            </div>
            <h4 className="text-base sm:text-lg font-black text-white mt-1">
              Llenado automático (estoy en casa)
            </h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
              Si estás en tu domicilio, llena automáticamente tu ubicación exacta en el mapa con un solo clic.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={usarGpsActual}
          disabled={gpsCargando || geocodificando}
          className="px-5 py-3 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#0A162B] font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2.5 flex-shrink-0 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {geocodificando ? (
            <RefreshCw className="w-4 h-4 text-[#0A162B] animate-spin" />
          ) : (
            <Navigation className={`w-4 h-4 text-[#0A162B] ${gpsCargando ? 'animate-spin' : ''}`} />
          )}
          <span>
            {gpsCargando
              ? 'Localizando domicilio...'
              : geocodificando
              ? 'Autollenando formulario...'
              : gpsExitoso
              ? 'Actualizar mi Domicilio'
              : 'Usar mi Ubicación'}
          </span>
        </button>
      </div>

      {/* Selector de zonas rápidas alternativo */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <span className="text-xs font-bold text-slate-600">
          ¿No estás en casa? Zonas rápidas de referencia en Cd. Juárez:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {ZONAS_JUAREZ.map((z, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => centrarEnZona(z.lat, z.lng)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 whitespace-nowrap transition shadow-2xs"
            >
              {z.nombre}
            </button>
          ))}
        </div>
      </div>

      {gpsError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          {gpsError}
        </div>
      )}

      {/* Contenedor del Mapa Interactivo */}
      <div className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-sm relative">
        <div
          ref={mapContainerRef}
          style={{ height: '320px', width: '100%', zIndex: 1 }}
          className="bg-slate-200"
        />
        <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-800 shadow pointer-events-auto">
            Lat: {valor.latitud || 31.6904} &bull; Lng: {valor.longitud || -106.4245}
          </div>
          <button
            type="button"
            onClick={() =>
              autollenarDesdeCoordenadas(valor.latitud || 31.6904, valor.longitud || -106.4245)
            }
            disabled={geocodificando}
            className="bg-[#0A162B]/95 hover:bg-[#0A162B] backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#D4AF37]/50 shadow flex items-center gap-1.5 pointer-events-auto transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#D4AF37] ${geocodificando ? 'animate-spin' : ''}`}
            />
            {geocodificando ? 'Autollenando...' : 'Sincronizar campos con el mapa'}
          </button>
        </div>
      </div>

      {/* Banner de confirmación de autollenado */}
      {camposAutollenados && camposAutollenados.length > 0 && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 font-bold animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="block font-black text-emerald-900 text-sm">
                ¡Formulario autollenado con éxito!
              </span>
              <span className="font-semibold text-emerald-800">
                Se completaron los campos:{' '}
                <span className="font-bold underline">{camposAutollenados.join(', ')}</span>.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 flex-shrink-0 shadow-2xs">
            Puedes afinar cualquier dato si lo requieres
          </span>
        </div>
      )}

      {/* Campos de Dirección Estructurada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-900">
              Calle y Número Exterior / Interior *
            </label>
            {camposAutollenados?.includes('Calle y Número') && (
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Autollenado
              </span>
            )}
          </div>
          <input
            type="text"
            required
            placeholder="Ej. Av. De las Torres #1420 Int. 4"
            value={valor.calleNumero}
            onChange={(e) => onChange({ ...valor, calleNumero: e.target.value })}
            className={`px-3.5 py-2.5 border-2 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none transition ${
              camposAutollenados?.includes('Calle y Número')
                ? 'bg-emerald-50/40 border-emerald-400'
                : 'bg-white border-slate-300'
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-900">
              Colonia / Fraccionamiento *
            </label>
            {camposAutollenados?.includes('Colonia') && (
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Autollenado
              </span>
            )}
          </div>
          <input
            type="text"
            required
            placeholder="Ej. Fracc. Praderas del Sol"
            value={valor.colonia}
            onChange={(e) => onChange({ ...valor, colonia: e.target.value })}
            className={`px-3.5 py-2.5 border-2 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none transition ${
              camposAutollenados?.includes('Colonia')
                ? 'bg-emerald-50/40 border-emerald-400'
                : 'bg-white border-slate-300'
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-900">
              Código Postal *
            </label>
            {camposAutollenados?.includes('Código Postal') && (
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Autollenado
              </span>
            )}
          </div>
          <input
            type="text"
            required
            placeholder="Ej. 32590"
            maxLength={5}
            value={valor.codigoPostal}
            onChange={(e) => onChange({ ...valor, codigoPostal: e.target.value })}
            className={`px-3.5 py-2.5 border-2 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none transition ${
              camposAutollenados?.includes('Código Postal')
                ? 'bg-emerald-50/40 border-emerald-400'
                : 'bg-white border-slate-300'
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-slate-900">
            Tiempo Viviendo en Ciudad Juárez *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Toda la vida / 8 años"
            value={valor.tiempoEnJuarez}
            onChange={(e) => onChange({ ...valor, tiempoEnJuarez: e.target.value })}
            className="px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-extrabold text-slate-900">
            Entrecalles *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Entre Calle Sol de Mayo y Calle Praderas de la Sierra"
            value={valor.entrecalles}
            onChange={(e) => onChange({ ...valor, entrecalles: e.target.value })}
            className="px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-extrabold text-slate-900">
            Referencias Visuales de la Fachada (Crucial para el Estudio Socioeconómico) *
          </label>
          <textarea
            rows={2}
            required
            placeholder="Ej. Casa de un piso color beige con barandal negro, portón corredizo, árbol grande al frente, tienda de abarrotes a dos casas."
            value={valor.referencias}
            onChange={(e) => onChange({ ...valor, referencias: e.target.value })}
            className="px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-[#0A162B]/20 outline-none"
          />
        </div>
      </div>
    </div>
  )
}
