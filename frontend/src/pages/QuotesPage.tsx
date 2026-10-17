import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { QuoteFilters } from '../components/quotes/QuoteFilters'
import { QuotesTable } from '../components/quotes/QuotesTable'
import { quoteBranches, quoteHistory } from '../data/quotes'
import type { QuoteFiltersValue } from '../types/quote'
import { filterQuotes } from '../utils/quoteFilters'

const initialFilters: QuoteFiltersValue = {
  search: '', branch: '', seller: '', status: '', dateFrom: '', dateTo: '',
}

export function QuotesPage() {
  const [filters, setFilters] = useState<QuoteFiltersValue>(initialFilters)
  const sellers = useMemo(() => [...new Set(quoteHistory.map((quote) => quote.sellerName))], [])

  const filteredQuotes = useMemo(() => filterQuotes(quoteHistory, filters), [filters])

  const clearFilters = () => setFilters(initialFilters)

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Cotizaciones</p>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">Historial de cotizaciones</h1>
          <p className="mb-0 mt-2 text-sm text-slate-500">Consulta y da seguimiento a las cotizaciones creadas.</p>
        </div>
        <Link to="/cotizaciones/nueva" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
          <CirclePlus size={17} aria-hidden="true" /> Nueva cotización
        </Link>
      </header>

      <QuoteFilters
        value={filters}
        branches={quoteBranches}
        sellers={sellers}
        onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
        onClear={clearFilters}
      />
      <QuotesTable quotes={filteredQuotes} onClearFilters={clearFilters} />
    </div>
  )
}
