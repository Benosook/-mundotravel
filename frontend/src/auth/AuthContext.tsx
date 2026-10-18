import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/authApi'
import { authStorage } from '../services/authStorage'
import type { AuthUser } from '../types/auth'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    authStorage.clear()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    const restore = async () => {
      if (!authStorage.get()) { setLoading(false); return }
      try { setUser(await authApi.getMe()) }
      catch { authStorage.clear(); setUser(null) }
      finally { setLoading(false) }
    }
    void restore()
  }, [])

  useEffect(() => {
    const unauthorized = () => logout()
    window.addEventListener('mundotravel:unauthorized', unauthorized)
    return () => window.removeEventListener('mundotravel:unauthorized', unauthorized)
  }, [logout])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    authStorage.set(response.access_token)
    setUser(response.user)
  }

  const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user), login, logout }), [loading, logout, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  return value
}
