import {
  CalendarDays,
  CircleDollarSign,
  ChevronDown,
  CirclePlus,
  Clock3,
  House,
  NotebookTabs,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const baseLink =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors'

function linkClass({ isActive }: { isActive: boolean }) {
  return `${baseLink} ${
    isActive
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-slate-300 hover:bg-white/8 hover:text-white'
  }`
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-navy-950 text-white shadow-xl shadow-slate-950/10">
      <div className="flex h-18 items-center border-b border-white/10 px-6">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-blue-400">+</span>MundoTravel
        </span>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 space-y-1 px-4 py-6">
        <NavLink to="/" end className={linkClass}>
          <House size={18} aria-hidden="true" />
          Inicio
        </NavLink>

        <div className="pt-2">
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-100">
            <NotebookTabs size={18} aria-hidden="true" />
            <span className="flex-1">Cotizaciones</span>
            <ChevronDown size={15} className="text-slate-500" aria-hidden="true" />
          </div>
          <div className="ml-5 space-y-1 border-l border-white/10 pl-3">
            <NavLink to="/cotizaciones/nueva" className={linkClass}>
              <CirclePlus size={17} aria-hidden="true" />
              Nueva cotización
            </NavLink>
            <NavLink to="/cotizaciones" end className={linkClass}>
              <Clock3 size={17} aria-hidden="true" />
              Historial
            </NavLink>
            <NavLink to="/pagos" className={linkClass}>
              <CircleDollarSign size={17} aria-hidden="true" />
              Pagos / Abonos
            </NavLink>
          </div>
        </div>

        <NavLink to="/salidas" className={linkClass}>
          <CalendarDays size={18} aria-hidden="true" />
          Próximas salidas
        </NavLink>
        <NavLink to="/clientes" className={linkClass}>
          <Users size={18} aria-hidden="true" />
          Clientes
        </NavLink>
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-xs text-slate-500">
        Sistema interno · Fase 1
      </div>
    </aside>
  )
}
