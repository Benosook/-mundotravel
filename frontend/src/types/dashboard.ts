export type PendingDocumentTone = 'danger' | 'warning' | 'info' | 'success'

export type PendingDocument = {
  id: string
  label: string
  count: number
  tone: PendingDocumentTone
  icon: 'documents' | 'payments' | 'policies' | 'itineraries'
}

export type UpcomingPayment = {
  id: string
  client: string
  packageName: string
  passengers: number
  phone: string
  installment: number
  dueDate: string
  daysRemaining: number
  pendingAmount: number
}
