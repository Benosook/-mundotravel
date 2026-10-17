import { ArrowRight, CalendarDays, FileSearch, SearchX, Users, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DepartureStatus, DocumentStatus, UpcomingDeparture } from '../../types/departure'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'

type Props = { departures: UpcomingDeparture[]; onClearFilters: () => void; onTemporaryAction: (message: string) => void }

const departureStatuses: Record<DepartureStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmado', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' },
  pending: { label: 'Pendiente', className: 'bg-orange-50 text-orange-700 ring-orange-600/10' },
  cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-700 ring-red-600/10' },
  completed: { label: 'Completado', className: 'bg-blue-50 text-blue-700 ring-blue-600/10' },
}
const documentStatuses: Record<DocumentStatus, { label: string; className: string }> = {
  complete: { label: 'Completa', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 ring-amber-600/10' },
  attention: { label: 'Requiere atención', className: 'bg-red-50 text-red-700 ring-red-600/10' },
}

function Badge({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>{label}</span>
}

export function DeparturesList({ departures, onClearFilters, onTemporaryAction }: Props) {
  if (departures.length === 0) return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-900/3">
      <SearchX size={30} className="mx-auto text-slate-400" aria-hidden="true" /><h2 className="mb-0 mt-4 text-base font-semibold text-slate-800">No encontramos próximas salidas con esos filtros.</h2>
      <p className="mb-0 mt-1 text-sm text-slate-500">Ajusta la búsqueda o restablece los filtros para ver todos los viajes.</p>
      <button type="button" onClick={onClearFilters} className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Limpiar filtros</button>
    </div>
  )

  return <section aria-label="Listado de próximas salidas" className="space-y-3">
    <div className="flex items-center justify-between px-1"><h2 className="m-0 text-sm font-semibold text-slate-800">Salidas encontradas</h2><span className="text-xs font-medium text-slate-500">{departures.length} registros</span></div>
    {departures.map((departure) => <article key={departure.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/3">
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1.4fr_1.1fr_auto] xl:items-center">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-wide text-blue-700">{departure.folio}</span><Badge {...departureStatuses[departure.status]} /></div>
          <h3 className="mb-0 mt-2 truncate text-base font-semibold text-slate-900">{departure.clientName}</h3><p className="mb-0 mt-1 text-xs text-slate-500">{departure.branch} · {departure.sellerName}</p>
          <p className="mb-0 mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-600"><Users size={14} aria-hidden="true" /> {departure.adults} adultos · {departure.minors} menores</p>
        </div>
        <div className="min-w-0 border-slate-100 xl:border-l xl:pl-5"><p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Hospedaje y vuelo</p><p className="mb-0 mt-2 truncate text-sm font-semibold text-slate-800">{departure.hotelName}</p><p className="mb-0 mt-1 truncate text-sm text-slate-500">{departure.flightSummary}</p></div>
        <div className="border-slate-100 xl:border-l xl:pl-5"><p className="m-0 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"><CalendarDays size={14} aria-hidden="true" /> Fechas</p><p className="mb-0 mt-2 text-sm font-medium text-slate-700">{formatDate(departure.departureDate)} — {formatDate(departure.returnDate)}</p><p className="mb-0 mt-2 text-base font-bold text-slate-900">{formatCurrency(departure.publicPrice)}</p><div className="mt-2"><Badge {...documentStatuses[departure.documentStatus]} /></div></div>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 xl:w-48 xl:flex-col xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
          <Link to={`/cotizaciones/${departure.quoteId}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Ver detalle <ArrowRight size={14} aria-hidden="true" /></Link>
          <button type="button" onClick={() => onTemporaryAction(`Documentación de ${departure.folio}: función disponible próximamente.`)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><FileSearch size={14} aria-hidden="true" /> Revisar documentación</button>
          <button type="button" onClick={() => onTemporaryAction(`Cancelación de ${departure.folio}: función disponible próximamente.`)} className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><XCircle size={14} aria-hidden="true" /> Cancelar</button>
        </div>
      </div>
    </article>)}
  </section>
}
