import { ArrowRight, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { mapPayment } from '../services/mappers'
import { paymentsApi } from '../services/paymentsApi'
import { quotesApi } from '../services/quotesApi'
import type { Payment } from '../types/quote'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'

type Row = { payment: Payment; folio: string; holder: string; branch: string; quoteId: string }

export function PaymentsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { (async () => { try { const quotes = await quotesApi.list({ limit: 100 }); const groups = await Promise.all(quotes.map(async (quote) => (await paymentsApi.list(quote.id)).map((payment) => ({ payment: mapPayment(payment), folio: quote.folio, holder: quote.client_name, branch: quote.branch_name, quoteId: quote.id })))); setRows(groups.flat().sort((a, b) => b.payment.date.localeCompare(a.payment.date))) } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar pagos.') } finally { setLoading(false) } })() }, [])

  return <div className="space-y-6">
    <header><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Cotizaciones</p><h1 className="m-0 text-2xl font-bold">Historial de pagos</h1><p className="mb-0 mt-2 text-sm text-slate-500">Consulta los abonos registrados en PostgreSQL.</p></header>
    {loading ? <LoadingState label="Cargando pagos…" /> : error ? <ErrorState message={error} /> : rows.length === 0 ? <div className="rounded-xl border bg-white px-4 py-14 text-center text-sm text-slate-500 sm:px-6">Aún no hay pagos registrados.</div> : <section className="overflow-hidden rounded-xl border bg-white">
      <div className="divide-y divide-slate-100 md:hidden">{rows.map((row) => <article key={row.payment.id} className="space-y-4 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="m-0 break-words font-semibold text-slate-900">{row.holder}</p><p className="mb-0 mt-1 text-xs font-semibold text-blue-700">{row.folio}</p></div><strong className="shrink-0 text-sm text-slate-900">{formatCurrency(row.payment.amount)}</strong></div><dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><div><dt className="text-xs text-slate-400">Fecha</dt><dd className="m-0 mt-0.5 text-slate-700">{formatDate(row.payment.date)}</dd></div><div><dt className="text-xs text-slate-400">Sucursal</dt><dd className="m-0 mt-0.5 break-words text-slate-700">{row.branch}</dd></div><div><dt className="text-xs text-slate-400">Tipo</dt><dd className="m-0 mt-0.5 capitalize text-slate-700">{row.payment.paymentType}</dd></div><div><dt className="text-xs text-slate-400">Estado</dt><dd className="m-0 mt-0.5 capitalize text-slate-700">{row.payment.status}</dd></div></dl><div className="grid grid-cols-2 gap-3"><Link to={`/cotizaciones/${row.quoteId}/pagos/${row.payment.id}/comprobante`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 text-sm font-semibold text-blue-700"><ReceiptText size={18} />Comprobante</Link><Link to={`/cotizaciones/${row.quoteId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white">Cotización<ArrowRight size={18} /></Link></div></article>)}</div>
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-220 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Fecha</th><th className="px-4 py-3">Folio</th><th className="px-4 py-3">Titular</th><th className="px-4 py-3">Sucursal</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Monto</th><th className="px-5 py-3"><span className="sr-only">Acciones</span></th></tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row.payment.id}><td className="px-5 py-4">{formatDate(row.payment.date)}</td><td className="px-4 py-4 font-semibold text-blue-700">{row.folio}</td><td className="px-4 py-4">{row.holder}</td><td className="px-4 py-4">{row.branch}</td><td className="px-4 py-4 capitalize">{row.payment.paymentType}</td><td className="px-4 py-4 capitalize">{row.payment.status}</td><td className="px-4 py-4 text-right font-bold">{formatCurrency(row.payment.amount)}</td><td className="px-5 py-4"><div className="flex gap-1"><Link aria-label="Imprimir comprobante" title="Imprimir comprobante" to={`/cotizaciones/${row.quoteId}/pagos/${row.payment.id}/comprobante`} className="grid size-10 place-items-center rounded-lg text-blue-700 hover:bg-blue-50"><ReceiptText size={18} /></Link><Link aria-label="Ver cotización" title="Ver cotización" to={`/cotizaciones/${row.quoteId}`} className="grid size-10 place-items-center rounded-lg text-blue-700 hover:bg-blue-50"><ArrowRight size={18} /></Link></div></td></tr>)}</tbody></table></div>
    </section>}
  </div>
}
