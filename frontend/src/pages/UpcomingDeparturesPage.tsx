import { CheckCircle2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DepartureFilters } from '../components/departures/DepartureFilters'
import { DeparturesList } from '../components/departures/DeparturesList'
import { upcomingDepartures } from '../data/departures'
import type { DepartureFiltersValue } from '../types/departure'

const initialFilters: DepartureFiltersValue = {
  search: '', branch: '', seller: '', status: '', dateFrom: '', dateTo: '', client: '',
}

export function UpcomingDeparturesPage() {
  const [filters, setFilters] = useState<DepartureFiltersValue>(initialFilters)
  const [actionMessage, setActionMessage] = useState('')
  const branches = useMemo(() => [...new Set(upcomingDepartures.map((item) => item.branch))], [])
  const sellers = useMemo(() => [...new Set(upcomingDepartures.map((item) => item.sellerName))], [])
  const clients = useMemo(() => [...new Set(upcomingDepartures.map((item) => item.clientName))], [])

  const filteredDepartures = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase('es-MX')
    return upcomingDepartures.filter((departure) => {
      const matchesSearch = !search || [departure.folio, departure.clientName, departure.hotelName]
        .some((value) => value.toLocaleLowerCase('es-MX').includes(search))
      return matchesSearch
        && (!filters.branch || departure.branch === filters.branch)
        && (!filters.seller || departure.sellerName === filters.seller)
        && (!filters.status || departure.status === filters.status)
        && (!filters.client || departure.clientName === filters.client)
        && (!filters.dateFrom || departure.departureDate >= filters.dateFrom)
        && (!filters.dateTo || departure.departureDate <= filters.dateTo)
    })
  }, [filters])

  const clearFilters = () => setFilters(initialFilters)

  return <div className="space-y-6">
    <header>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Operación</p>
      <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">Próximas salidas</h1>
      <p className="mb-0 mt-2 text-sm text-slate-500">Consulta los viajes próximos y su estado operativo.</p>
    </header>
    {actionMessage && <div role="status" className="flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
      <span className="flex items-center gap-2"><CheckCircle2 size={17} aria-hidden="true" />{actionMessage}</span>
      <button type="button" onClick={() => setActionMessage('')} aria-label="Cerrar mensaje" className="rounded-md p-1 hover:bg-blue-100"><X size={16} aria-hidden="true" /></button>
    </div>}
    <DepartureFilters value={filters} branches={branches} sellers={sellers} clients={clients} onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))} onClear={clearFilters} />
    <DeparturesList departures={filteredDepartures} onClearFilters={clearFilters} onTemporaryAction={setActionMessage} />
  </div>
}
