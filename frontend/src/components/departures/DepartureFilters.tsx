import { RotateCcw, Search } from 'lucide-react'
import type { DepartureFiltersValue, DepartureStatus } from '../../types/departure'

type Props = {
  value: DepartureFiltersValue
  branches: string[]
  sellers: string[]
  clients: string[]
  onChange: (field: keyof DepartureFiltersValue, value: string) => void
  onClear: () => void
}

const inputClass = 'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100'
const statuses: Array<{ value: DepartureStatus; label: string }> = [
  { value: 'confirmed', label: 'Confirmado' }, { value: 'pending', label: 'Pendiente' },
  { value: 'cancelled', label: 'Cancelado' }, { value: 'completed', label: 'Completado' },
]

export function DepartureFilters({ value, branches, sellers, clients, onChange, onClear }: Props) {
  return (
    <section aria-label="Filtros de próximas salidas" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold text-slate-600 xl:col-span-2">Búsqueda general
          <div className="relative"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 mt-0.75 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={value.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Folio, cliente u hotel" className={`${inputClass} pl-9`} />
          </div>
        </label>
        <label className="text-xs font-semibold text-slate-600">Cliente
          <select value={value.client} onChange={(event) => onChange('client', event.target.value)} className={inputClass}><option value="">Todos</option>{clients.map((client) => <option key={client}>{client}</option>)}</select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Sucursal
          <select value={value.branch} onChange={(event) => onChange('branch', event.target.value)} className={inputClass}><option value="">Todas</option>{branches.map((branch) => <option key={branch}>{branch}</option>)}</select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Vendedor
          <select value={value.seller} onChange={(event) => onChange('seller', event.target.value)} className={inputClass}><option value="">Todos</option>{sellers.map((seller) => <option key={seller}>{seller}</option>)}</select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Estado
          <select value={value.status} onChange={(event) => onChange('status', event.target.value)} className={inputClass}><option value="">Todos</option>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Fecha desde
          <input type="date" value={value.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} className={inputClass} />
        </label>
        <label className="text-xs font-semibold text-slate-600">Fecha hasta
          <input type="date" value={value.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} className={inputClass} />
        </label>
        <div className="flex items-end md:col-start-2 xl:col-start-4"><button type="button" onClick={onClear} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw size={16} aria-hidden="true" /> Limpiar filtros</button></div>
      </div>
    </section>
  )
}
