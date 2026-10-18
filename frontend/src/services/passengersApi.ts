import type { ApiPassenger } from '../types/api'
import { apiRequest } from './api'

export type PassengerInput = { name: string; age: number; passenger_type: 'adult' | 'minor' }
export const passengersApi = {
  list: (quoteId: string) => apiRequest<ApiPassenger[]>(`/quotes/${quoteId}/passengers`),
  create: (quoteId: string, input: PassengerInput) => apiRequest<ApiPassenger>(`/quotes/${quoteId}/passengers`, { method: 'POST', body: JSON.stringify(input) }),
  update: (quoteId: string, id: string, input: Partial<PassengerInput>) => apiRequest<ApiPassenger>(`/quotes/${quoteId}/passengers/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (quoteId: string, id: string) => apiRequest<void>(`/quotes/${quoteId}/passengers/${id}`, { method: 'DELETE' }),
}
