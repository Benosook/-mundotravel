import type { ApiQuote, ApiQuoteListItem } from '../types/api'
import { apiRequest, queryString } from './api'

export type QuoteCreateInput = { client_id: string; branch_id: string; status: 'pending'; sale_date: string; payment_limit_date: string | null; departure_date: string; return_date: string; internal_comment: string | null; currency: 'MXN' }
export type QuoteUpdateInput = { client_id?: string; branch_id?: string; payment_limit_date?: string | null; departure_date?: string; return_date?: string; internal_comment?: string | null }
export const quotesApi = {
  list: (filters: Record<string, string | number | undefined> = {}) => apiRequest<ApiQuoteListItem[]>(`/quotes${queryString(filters)}`),
  get: (id: string) => apiRequest<ApiQuote>(`/quotes/${id}`),
  create: (input: QuoteCreateInput) => apiRequest<ApiQuote>('/quotes', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: QuoteUpdateInput) => apiRequest<ApiQuote>(`/quotes/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => apiRequest<void>(`/quotes/${id}`, { method: 'DELETE' }),
}
