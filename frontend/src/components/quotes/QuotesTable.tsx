import { ArrowRight, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { QuoteListItem } from '../../types/quote'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { QuoteStatusBadge } from './QuoteStatusBadge'

type QuotesTableProps = {
  quotes: QuoteListItem[]
  onClearFilters: () => void
}

export function QuotesTable({ quotes, onClearFilters }: QuotesTableProps) {
  if (quotes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-900/3">
        <SearchX size={30} className="mx-auto text-slate-400" aria-hidden="true" />
        <h2 className="mb-0 mt-4 text-base font-semibold text-slate-800">No encontramos cotizaciones con esos filtros.</h2>
        <p className="mb-0 mt-1 text-sm text-slate-500">Ajusta la búsqueda o restablece los filtros para ver todos los registros.</p>
        <button type="button" onClick={onClearFilters} className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          Limpiar filtros
        </button>
      </div>
    )
  }

  return (
    <section aria-label="Listado de cotizaciones" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="m-0 text-sm font-semibold text-slate-800">Cotizaciones encontradas</h2>
        <span className="text-xs font-medium text-slate-500">{quotes.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-320 border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Folio</th><th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Destino</th><th className="px-4 py-3">Servicios</th>
              <th className="px-4 py-3">Fechas</th><th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3 text-right">Precio público</th><th className="px-4 py-3 text-right">Abonado</th>
              <th className="px-4 py-3 text-right">Saldo</th><th className="px-4 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotes.map((quote) => {
              const visibleServices = quote.services.slice(0, 2)
              const remainingServices = quote.services.length - visibleServices.length
              return (
                <tr key={quote.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700">{quote.folio}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-800">{quote.clientName}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{quote.destination}</td>
                  <td className="px-4 py-4"><div className="flex items-center gap-1.5">
                    {visibleServices.map((service) => <span key={service} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{service}</span>)}
                    {remainingServices > 0 && <span className="text-xs font-semibold text-slate-500">+{remainingServices}</span>}
                  </div></td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">{formatDate(quote.departureDate)}<span className="mx-1 text-slate-300">—</span>{formatDate(quote.returnDate)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{quote.sellerName}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-slate-800">{formatCurrency(quote.publicPrice)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-slate-600">{formatCurrency(quote.totalPaid)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-slate-800">{formatCurrency(quote.remainingBalance)}</td>
                  <td className="px-4 py-4"><QuoteStatusBadge status={quote.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/cotizaciones/${quote.id}`} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                      Ver detalle <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
