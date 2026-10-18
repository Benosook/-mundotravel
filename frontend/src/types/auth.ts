export type AuthUser = {
  id: string
  email: string
  name: string
  active: boolean
  role: string
  branch_id: string | null
}

export type LoginRequest = { email: string; password: string }
export type LoginResponse = { access_token: string; token_type: 'bearer'; user: AuthUser }
