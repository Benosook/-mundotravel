export type ServiceType = 'hotel' | 'tour' | 'flight' | 'transport' | 'circuit'

export type HotelService = {
  id: string
  type: 'hotel'
  purchaseMethod: string
  hotelName: string
  checkIn: string
  checkOut: string
  plan: string
  rooms: number
  operator: string
  reservationCode: string
  cancellationDate: string
  comments: string
  netPrice: number
  publicPrice: number
}

export type TourService = {
  id: string
  type: 'tour'
  purchaseMethod: string
  name: string
  startDateTime: string
  cancellationDate: string
  operator: string
  operatorCode: string
  comments: string
  netPrice: number
  publicPrice: number
}

export type TransportService = {
  id: string
  type: 'transport'
  purchaseMethod: string
  transportType: string
  tripType: 'round' | 'one-way'
  origin: string
  destination: string
  departureDateTime: string
  returnDateTime?: string
  operator: string
  operatorCode: string
  cancellationDate: string
  comments: string
  netPrice: number
  publicPrice: number
}

export type FlightService = {
  id: string
  type: 'flight'
  purchaseMethod: string
  tripType: 'round' | 'one-way'
  origin: string
  destination: string
  departureDateTime: string
  returnDateTime?: string
  airline: string
  outboundFlightNumber: string
  returnFlightNumber?: string
  operator: string
  operatorCode: string
  comments: string
  netPrice: number
  publicPrice: number
}

export type QuoteService = HotelService | TourService | TransportService | FlightService

export type QuoteGeneralInfoValue = {
  branch: string
  paymentLimitDate: string
  internalComment: string
  holder: string
  departureDate: string
  returnDate: string
}

export type QuoteGeneralInfoErrors = Partial<Record<'branch' | 'holder' | 'departureDate' | 'returnDate', string>>

export type QuoteStatus = 'active' | 'pending' | 'paid' | 'cancelled'

export type QuoteListItem = {
  id: string
  folio: string
  clientName: string
  sellerName: string
  destination: string
  services: string[]
  departureDate: string
  returnDate: string
  publicPrice: number
  netPrice: number
  totalPaid: number
  remainingBalance: number
  status: QuoteStatus
  branch: string
  createdAt: string
}

export type QuoteFiltersValue = {
  search: string
  branch: string
  seller: string
  status: QuoteStatus | ''
  dateFrom: string
  dateTo: string
}

export type Passenger = {
  id: string
  name: string
  age: number
  type: 'adult' | 'minor'
}

export type PaymentScheduleStatus = 'pending' | 'paid' | 'overdue'

export type PaymentScheduleItem = {
  id: string
  installmentNumber: number
  dueDate: string
  amount: number
  status: PaymentScheduleStatus
}

export type PaymentStatus = 'confirmed' | 'pending' | 'cancelled'

export type PaymentType = 'cash' | 'transfer' | 'card' | 'other'

export type Payment = {
  id: string
  quoteId: string
  date: string
  userName: string
  paymentType: PaymentType
  currency: 'MXN'
  amount: number
  status: PaymentStatus
  comment: string
}

export type QuoteDetail = {
  id: string
  folio: string
  status: QuoteStatus
  holderName: string
  sellerName: string
  branch: string
  destination: string
  saleDate: string
  paymentLimitDate: string
  departureDate: string
  returnDate: string
  settlementDate?: string
  internalComment: string
  publicPrice: number
  netPrice: number
  totalPaid: number
  remainingBalance: number
  passengers: Passenger[]
  paymentSchedule: PaymentScheduleItem[]
  services: QuoteService[]
  payments?: Payment[]
}

