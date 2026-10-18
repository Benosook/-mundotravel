import type { ApiHotel } from '../types/api'; import { apiRequest } from './api'
type Input=Omit<ApiHotel,'id'|'quote_id'|'created_at'|'updated_at'>
export const hotelsApi = { create: (quoteId: string, input: Input) => apiRequest<ApiHotel>(`/quotes/${quoteId}/hotels`, { method:'POST', body:JSON.stringify(input) }), update:(quoteId:string,id:string,input:Partial<Input>)=>apiRequest<ApiHotel>(`/quotes/${quoteId}/hotels/${id}`,{method:'PATCH',body:JSON.stringify(input)}), remove: (quoteId:string,id:string)=>apiRequest<void>(`/quotes/${quoteId}/hotels/${id}`,{method:'DELETE'}) }
