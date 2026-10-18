import {
  CalendarDays,
  CircleDollarSign,
  ChevronDown,
  CirclePlus,
  Clock3,
  House,
  NotebookTabs,
  Users,
  X,
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

export function Sidebar({ open = false, onNavigate }: { open?: boolean; onNavigate?: () => void }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col bg-navy-950 text-white shadow-xl transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-18 items-center justify-between border-b border-white/10 px-5 sm:px-6">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-blue-400">+</span>MundoTravel
        </span>
        <button type="button" onClick={onNavigate} aria-label="Cerrar menú" className="grid size-11 place-items-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden"><X size={20}/></button>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 space-y-1 px-4 py-6">
        <NavLink to="/" end className={linkClass} onClick={onNavigate}>
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
            <NavLink to="/cotizaciones/nueva" className={linkClass} onClick={onNavigate}>
              <CirclePlus size={17} aria-hidden="true" />
              Nueva cotización
            </NavLink>
            <NavLink to="/cotizaciones" end className={linkClass} onClick={onNavigate}>
              <Clock3 size={17} aria-hidden="true" />
              Historial
            </NavLink>
            <NavLink to="/pagos" className={linkClass} onClick={onNavigate}>
              <CircleDollarSign size={17} aria-hidden="true" />
              Pagos / Abonos
            </NavLink>
          </div>
        </div>

        <NavLink to="/salidas" className={linkClass} onClick={onNavigate}>
          <CalendarDays size={18} aria-hidden="true" />
          Próximas salidas
        </NavLink>
        <NavLink to="/clientes" className={linkClass} onClick={onNavigate}>
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
