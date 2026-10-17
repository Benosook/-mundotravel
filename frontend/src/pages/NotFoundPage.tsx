import { CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-8 py-20 text-center shadow-sm">
      <CircleAlert className="mx-auto text-slate-400" size={40} aria-hidden="true" />
      <h1 className="mb-0 mt-5 text-2xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">La dirección solicitada no existe en +MundoTravel.</p>
      <Link to="/" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
        Volver al inicio
      </Link>
    </section>
  )
}
