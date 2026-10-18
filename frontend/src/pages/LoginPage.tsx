import { Plane, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { isAuthenticated, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setError('Ingresa un correo válido.'); return }
    if (!password) { setError('Ingresa tu contraseña.'); return }
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      const destination = (location.state as { from?: string } | null)?.from || '/'
      navigate(destination, { replace: true })
    } catch { setError('Correo o contraseña incorrectos.') }
    finally { setSubmitting(false) }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-100 p-4"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"><div className="mb-7 flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white"><Plane size={22}/></div><div><h1 className="m-0 text-xl font-bold text-slate-900">+MundoTravel</h1><p className="m-0 mt-1 text-sm text-slate-500">Sistema administrativo interno</p></div></div><div className="mb-6"><h2 className="m-0 text-2xl font-bold text-slate-900">Iniciar sesión</h2><p className="mb-0 mt-2 text-sm text-slate-500">Ingresa con tu cuenta de la agencia.</p></div><form onSubmit={submit} noValidate className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Correo</span><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="ariadna@mundotravel.local"/></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Contraseña</span><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"/></label>{error&&<p role="alert" className="m-0 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button disabled={submitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><ShieldCheck size={17}/>{submitting?'Ingresando…':'Iniciar sesión'}</button></form></section></main>
}
