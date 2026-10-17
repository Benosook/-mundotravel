import { Bell, Search } from 'lucide-react'

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-18 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm shadow-slate-900/2">
      <div className="relative w-full max-w-md">
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

      <div className="ml-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <Bell size={19} aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="m-0 text-sm font-semibold text-slate-800">Mariana López</p>
            <p className="m-0 mt-0.5 text-xs text-slate-500">Administración</p>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            ML
          </div>
        </div>
      </div>
    </header>
  )
}
