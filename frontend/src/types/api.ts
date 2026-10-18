import type { PaymentStatus, PaymentType, QuoteStatus } from './quote'

export type ApiMoney = string | number

export type ApiClient = {
  id: string; first_name: string; last_name: string; full_name: string; phone: string
  email: string | null; notes: string | null; status: 'active' | 'inactive'; created_at: string; updated_at: string
}

export type ApiServiceBase = { id: string; quote_id: string; net_price: ApiMoney; public_price: ApiMoney; created_at: string; updated_at: string }
export type ApiHotel = ApiServiceBase & { purchase_method: string; hotel_name: string; check_in: string; check_out: string; plan: string; rooms: number; operator: string | null; reservation_code: string | null; cancellation_date: string | null; comments: string | null }
export type ApiTour = ApiServiceBase & { purchase_method: string; name: string; start_datetime: string; cancellation_date: string | null; operator: string | null; operator_code: string | null; comments: string | null }
export type ApiTransport = ApiServiceBase & { purchase_method: string; transport_type: string; trip_type: 'round' | 'one-way'; origin: string; destination: string; departure_datetime: string; return_datetime: string | null; operator: string | null; operator_code: string | null; cancellation_date: string | null; comments: string | null }
export type ApiFlight = ApiServiceBase & { purchase_method: string; trip_type: 'round' | 'one-way'; origin: string; destination: string; departure_datetime: string; return_datetime: string | null; airline: string; outbound_flight_number: string; return_flight_number: string | null; operator: string | null; operator_code: string | null; comments: string | null }
export type ApiPayment = { id: string; quote_id: string; user_id: string | null; user_name: string | null; date: string; payment_type: PaymentType; currency: 'MXN'; amount: ApiMoney; status: PaymentStatus; comment: string | null; created_at: string; updated_at: string }
export type ApiPaymentSchedule = { id: string; quote_id: string; installment_number: number; due_date: string; amount: ApiMoney; status: 'pending' | 'paid' | 'overdue'; created_at: string; updated_at: string }
export type ApiPassenger = { id: string; quote_id: string; name: string; age: number; passenger_type: 'adult' | 'minor'; created_at: string; updated_at: string }

export type ApiQuoteListItem = {
  id: string; folio: string; client_id: string; client_name: string; seller_id: string | null; seller_name: string | null
  branch_id: string; branch_name: string; status: QuoteStatus; sale_date: string | null; departure_date: string | null
  return_date: string | null; currency: string; public_price: ApiMoney; net_price: ApiMoney; total_paid: ApiMoney
  remaining_balance: ApiMoney; created_at: string
}

export type ApiQuote = {
  id: string; folio: string; client_id: string; seller_id: string | null; branch_id: string; status: QuoteStatus
  sale_date: string | null; payment_limit_date: string | null; departure_date: string | null; return_date: string | null
  internal_comment: string | null; currency: string; public_price: ApiMoney; net_price: ApiMoney; total_paid: ApiMoney; remaining_balance: ApiMoney
  client: { id: string; full_name: string; phone: string; email: string | null }
  seller: { id: string; name: string } | null; branch: { id: string; name: string }
  hotels: ApiHotel[]; tours: ApiTour[]; transports: ApiTransport[]; flights: ApiFlight[]
  payments: ApiPayment[]; payment_schedule: ApiPaymentSchedule[]; created_at: string; updated_at: string
  passengers: ApiPassenger[]
}
