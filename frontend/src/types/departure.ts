export type DepartureStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
export type UpcomingDeparture = {
  id: string
  quoteId: string
  folio: string
  clientName: string
  sellerName: string
  branch: string
  adults: number
  minors: number
  hotelName: string
  flightSummary: string
  departureDate: string
  returnDate: string
  publicPrice: number
  status: DepartureStatus
}

export type DepartureFiltersValue = {
  search: string
  branch: string
  seller: string
  status: DepartureStatus | ''
  dateFrom: string
  dateTo: string
  client: string
}
