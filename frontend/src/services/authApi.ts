import type { AuthUser, LoginRequest, LoginResponse } from '../types/auth'
import { apiRequest } from './api'

export const authApi = {
  login: (input: LoginRequest) => apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  getMe: () => apiRequest<AuthUser>('/auth/me'),
}
