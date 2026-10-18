import type { ApiTour } from '../types/api'; import { apiRequest } from './api'
type Input=Omit<ApiTour,'id'|'quote_id'|'created_at'|'updated_at'>
export const toursApi = { create: (quoteId: string, input: Input) => apiRequest<ApiTour>(`/quotes/${quoteId}/tours`, { method:'POST', body:JSON.stringify(input) }), update:(quoteId:string,id:string,input:Partial<Input>)=>apiRequest<ApiTour>(`/quotes/${quoteId}/tours/${id}`,{method:'PATCH',body:JSON.stringify(input)}), remove: (quoteId:string,id:string)=>apiRequest<void>(`/quotes/${quoteId}/tours/${id}`,{method:'DELETE'}) }
