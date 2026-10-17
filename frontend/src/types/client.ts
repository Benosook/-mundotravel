export type ClientStatus = 'active' | 'inactive'

export type Client = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  email: string
  createdAt: string
  notes?: string
  status: ClientStatus
}
