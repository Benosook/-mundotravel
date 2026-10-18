import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

export function Topbar({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  const { user, logout } = useAuth()
  const initials = user?.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'MT'
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 shadow-sm shadow-slate-900/2 sm:px-6 lg:h-18 lg:px-8">
      <button type="button" onClick={onOpenNavigation} aria-label="Abrir menú" className="grid size-11 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"><Menu size={21}/></button>
      <span className="min-w-0 flex-1 truncate text-base font-bold text-slate-900 sm:hidden"><span className="text-blue-600">+</span>MundoTravel</span>
      <div className="relative hidden w-full max-w-md sm:block">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Buscar"
          placeholder="Buscar cotización, folio o cliente..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-center gap-1.5 sm:ml-4 sm:gap-3 lg:ml-8 lg:gap-4">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative hidden size-10 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 sm:grid"
        >
          <Bell size={19} aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="m-0 text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="m-0 mt-0.5 text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
          <div className="hidden size-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 sm:grid">
            {initials}
          </div>
          <button type="button" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión" className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"><LogOut size={18}/></button>
        </div>
      </div>
    </header>
  )
}
