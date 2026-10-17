import { CalendarDays, CirclePlus, Clock3, Users, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type QuickAction = {
  label: string
  description: string
  to: string
  icon: LucideIcon
}

const actions: QuickAction[] = [
  { label: 'Nueva cotización', description: 'Crear paquete', to: '/cotizaciones/nueva', icon: CirclePlus },
  { label: 'Historial de cotizaciones', description: 'Consultar paquetes', to: '/cotizaciones', icon: Clock3 },
  { label: 'Próximas salidas', description: 'Revisar viajes', to: '/salidas', icon: CalendarDays },
  { label: 'Clientes', description: 'Consultar titulares', to: '/clientes', icon: Users },
]

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title" className="mb-3 mt-0 text-base font-semibold text-slate-900">
        Accesos rápidos
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ label, description, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left no-underline shadow-sm shadow-slate-900/3 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-700">
              <Icon size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-semibold text-slate-800">{label}</p>
              <p className="mb-0 mt-0.5 text-xs text-slate-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
