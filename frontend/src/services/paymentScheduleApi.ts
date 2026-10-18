import type { ApiPaymentSchedule } from '../types/api'; import { apiRequest } from './api'
export const paymentScheduleApi = { list:(quoteId:string)=>apiRequest<ApiPaymentSchedule[]>(`/quotes/${quoteId}/payment-schedule`) }
