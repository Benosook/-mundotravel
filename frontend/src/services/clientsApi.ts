import type { ApiClient } from '../types/api'
import { apiRequest, queryString } from './api'

export type ClientCreateInput = { first_name: string; last_name: string; phone: string; email: string | null; notes: string | null }
export const clientsApi = {
  list: (filters: { search?: string; status?: string } = {}) => apiRequest<ApiClient[]>(`/clients${queryString(filters)}`),
  get: (id: string) => apiRequest<ApiClient>(`/clients/${id}`),
  create: (input: ClientCreateInput) => apiRequest<ApiClient>('/clients', { method: 'POST', body: JSON.stringify(input) }),
}
