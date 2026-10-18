const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) { super(message); this.name = 'ApiError' }
}

function errorMessage(status: number, body: unknown) {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((item) => item && typeof item === 'object' && 'msg' in item ? String(item.msg) : 'Dato inválido').join('. ')
  }
  if (status === 404) return 'No encontramos el recurso solicitado.'
  if (status >= 500) return 'Hubo un problema al procesar la solicitud.'
  return 'No fue posible completar la solicitud.'
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    const token = authStorage.get()
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  } catch (error) {
    throw new ApiError(0, 'No fue posible conectar con el servidor.', error)
  }
  if (response.status === 204) return undefined as T
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      authStorage.clear()
      window.dispatchEvent(new Event('mundotravel:unauthorized'))
    }
    throw new ApiError(response.status, errorMessage(response.status, body), body)
  }
  return body as T
}

export function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)) })
  const query = params.toString()
  return query ? `?${query}` : ''
}
import { authStorage } from './authStorage'

