import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../components/ui/AsyncState'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen bg-slate-50 p-8"><LoadingState label="Validando sesión…" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
