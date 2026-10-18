import type { ApiFlight } from '../types/api'; import { apiRequest } from './api'
type Input=Omit<ApiFlight,'id'|'quote_id'|'created_at'|'updated_at'>
export const flightsApi = { create: (quoteId: string, input: Input) => apiRequest<ApiFlight>(`/quotes/${quoteId}/flights`, { method:'POST', body:JSON.stringify(input) }), update:(quoteId:string,id:string,input:Partial<Input>)=>apiRequest<ApiFlight>(`/quotes/${quoteId}/flights/${id}`,{method:'PATCH',body:JSON.stringify(input)}), remove: (quoteId:string,id:string)=>apiRequest<void>(`/quotes/${quoteId}/flights/${id}`,{method:'DELETE'}) }
