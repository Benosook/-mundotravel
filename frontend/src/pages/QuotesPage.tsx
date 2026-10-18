import { CirclePlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QuoteFilters } from '../components/quotes/QuoteFilters'
import { QuotesTable } from '../components/quotes/QuotesTable'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { mapQuoteListItem } from '../services/mappers'
import { quotesApi } from '../services/quotesApi'
import type { QuoteFiltersValue, QuoteListItem } from '../types/quote'

const initial: QuoteFiltersValue = { search: '', branch: '', seller: '', status: '', dateFrom: '', dateTo: '' }

export function QuotesPage() {
  const [filters, setFilters] = useState(initial)
  const [quotes, setQuotes] = useState<QuoteListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { setQuotes((await quotesApi.list({ search: filters.search || undefined, status: filters.status || undefined, branch_id: filters.branch || undefined, seller_id: filters.seller || undefined, departure_from: filters.dateFrom || undefined, departure_to: filters.dateTo || undefined, limit: 100 })).map(mapQuoteListItem)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar cotizaciones.') } finally { setLoading(false) } }, [filters])
  useEffect(() => { const timeout = setTimeout(() => void load(), 250); return () => clearTimeout(timeout) }, [load])
  const clear = () => setFilters(initial)

  return <div className="space-y-6">
    <header className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
      <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Cotizaciones</p><h1 className="m-0 text-2xl font-bold text-slate-900">Historial de cotizaciones</h1><p className="mb-0 mt-2 text-sm text-slate-500">Consulta y da seguimiento a las cotizaciones creadas.</p></div>
      <Link to="/cotizaciones/nueva" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><CirclePlus size={17} /> Nueva cotización</Link>
    </header>
    <QuoteFilters value={filters} branches={[...(filters.branch ? [filters.branch] : [])]} sellers={[...(filters.seller ? [filters.seller] : [])]} onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))} onClear={clear} />
    {loading ? <LoadingState label="Cargando cotizaciones…" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : <QuotesTable quotes={quotes} onClearFilters={clear} />}
  </div>
}
