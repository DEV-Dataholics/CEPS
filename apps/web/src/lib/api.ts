// Cliente HTTP canónico para CEPS (Regla obligatoria de vibe-coding-guard).
// Todas las peticiones al backend de Laragon pasan obligatoriamente por este módulo.

const BASE = '/api/v1'

let tokenActual: string | null = localStorage.getItem('ceps_token')

export class ApiError extends Error {
  constructor(
    public status: number,
    public codigo: string,
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function setAuthToken(token: string | null): void {
  tokenActual = token
  if (token) {
    localStorage.setItem('ceps_token', token)
  } else {
    localStorage.removeItem('ceps_token')
  }
}

export function getAuthToken(): string | null {
  return tokenActual
}

async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(opciones.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(opciones.headers as Record<string, string> | undefined),
  }
  if (tokenActual) headers.Authorization = `Bearer ${tokenActual}`

  const respuesta = await fetch(BASE + ruta, { ...opciones, headers })

  if (respuesta.status === 204) return undefined as unknown as T

  const cuerpo = (await respuesta.json().catch(() => null)) as {
    error?: string
    message?: string
    fields?: Record<string, string[]>
    real_status?: number
    [key: string]: unknown
  } | null

  const isRealError = cuerpo && typeof cuerpo === 'object' && typeof cuerpo.real_status === 'number' && cuerpo.real_status >= 400

  if (!respuesta.ok || isRealError) {
    const status = isRealError ? (cuerpo?.real_status ?? respuesta.status) : respuesta.status
    throw new ApiError(
      status,
      cuerpo?.error ?? 'server_error',
      cuerpo?.message ?? 'Error del servidor.',
      cuerpo?.fields,
    )
  }

  return cuerpo as T
}

export interface HealthCheckResponse {
  status: string
  version: string
  database?: string
  timestamp: string
}

export interface ReverseGeocodeResponse {
  status: string
  calleNumero?: string
  colonia?: string
  codigoPostal?: string
  ciudad?: string
  estado?: string
  displayName?: string
  message?: string
}

export const api = {
  getHealth: () => pedir<HealthCheckResponse>('/health'),
  reverseGeocode: (lat: number, lng: number) =>
    pedir<ReverseGeocodeResponse>(
      `/geocoding/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
    ),
}
