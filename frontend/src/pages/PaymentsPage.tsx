import { ArrowRight, Eye, Printer, RotateCcw, Search, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PaymentProofModal } from '../components/payments/PaymentProofModal'
import { payments } from '../data/payments'
import { quoteHistory } from '../data/quotes'
import type { PaymentStatus, PaymentType } from '../types/quote'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'

type Filters = { search: string; branch: string; type: PaymentType | ''; status: PaymentStatus | ''; dateFrom: string; dateTo: string }
const initialFilters: Filters = { search: '', branch: '', type: '', status: '', dateFrom: '', dateTo: '' }
const types: Record<PaymentType, string> = { cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro' }
const statuses: Record<PaymentStatus, { label: string; className: string }> = {
  confirmed: { label: 'Aprobado', className: 'bg-emerald-50 text-emerald-700' }, pending: { label: 'Pendiente', className: 'bg-orange-50 text-orange-700' }, cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-700' },
}
const fieldClass = 'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function PaymentsPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const branches = [...new Set(quoteHistory.map((quote) => quote.branch))]
  const rows = useMemo(() => payments.map((payment) => ({ payment, quote: quoteHistory.find((quote) => quote.id === payment.quoteId) })).filter(({ quote }) => quote), [])
  const filtered = useMemo(() => {
    const term = filters.search.trim().toLocaleLowerCase('es-MX')
    return rows.filter(({ payment, quote }) => quote
      && (!term || [payment.id, quote.folio, quote.clientName].some((value) => value.toLocaleLowerCase('es-MX').includes(term)))
      && (!filters.branch || quote.branch === filters.branch)
      && (!filters.type || payment.paymentType === filters.type)
      && (!filters.status || payment.status === filters.status)
      && (!filters.dateFrom || payment.date >= filters.dateFrom)
      && (!filters.dateTo || payment.date <= filters.dateTo))
  }, [filters, rows])
  const change = (field: keyof Filters, value: string) => setFilters((current) => ({ ...current, [field]: value }))
  const clear = () => setFilters(initialFilters)
  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId) ?? null
  const selectedQuote = selectedPayment ? quoteHistory.find((quote) => quote.id === selectedPayment.quoteId) : undefined

  return <div className="space-y-6">
    <header><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Cotizaciones</p><h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">Historial de pagos</h1><p className="mb-0 mt-2 text-sm text-slate-500">Consulta los abonos registrados en las cotizaciones.</p></header>
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/3"><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      <label className="text-xs font-semibold text-slate-600 xl:col-span-2">Búsqueda<div className="relative"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 mt-0.75 -translate-y-1/2 text-slate-400" /><input type="search" value={filters.search} onChange={(event) => change('search', event.target.value)} placeholder="ID, folio o titular" className={`${fieldClass} pl-9`} /></div></label>
      <label className="text-xs font-semibold text-slate-600">Sucursal<select value={filters.branch} onChange={(event) => change('branch', event.target.value)} className={fieldClass}><option value="">Todas</option>{branches.map((branch) => <option key={branch}>{branch}</option>)}</select></label>
      <label className="text-xs font-semibold text-slate-600">Tipo de pago<select value={filters.type} onChange={(event) => change('type', event.target.value)} className={fieldClass}><option value="">Todos</option>{Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-xs font-semibold text-slate-600">Estado<select value={filters.status} onChange={(event) => change('status', event.target.value)} className={fieldClass}><option value="">Todos</option>{Object.entries(statuses).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></label>
      <div className="flex items-end"><button type="button" onClick={clear} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw size={16} /> Limpiar filtros</button></div>
      <label className="text-xs font-semibold text-slate-600">Fecha inicial<input type="date" value={filters.dateFrom} onChange={(event) => change('dateFrom', event.target.value)} className={fieldClass} /></label>
      <label className="text-xs font-semibold text-slate-600">Fecha final<input type="date" value={filters.dateTo} onChange={(event) => change('dateTo', event.target.value)} className={fieldClass} /></label>
    </div></section>
    {filtered.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center"><SearchX size={30} className="mx-auto text-slate-400" /><h2 className="mb-0 mt-4 text-base font-semibold text-slate-800">No encontramos pagos con esos filtros.</h2><button type="button" onClick={clear} className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Limpiar filtros</button></div> : <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="m-0 text-sm font-semibold text-slate-800">Pagos registrados</h2><span className="text-xs text-slate-500">{filtered.length} registros</span></div><div className="overflow-x-auto"><table className="w-full min-w-300 text-left text-sm"><thead><tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><th className="px-5 py-3">ID</th><th className="px-4 py-3">Sucursal</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Paquete</th><th className="px-4 py-3">Titular</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Comentario</th><th className="px-4 py-3 text-right">Monto</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(({ payment, quote }) => { if (!quote) return null; const status = statuses[payment.status]; return <tr key={payment.id} className="hover:bg-slate-50/80"><td className="px-5 py-4 text-xs font-semibold text-slate-600">{payment.id}</td><td className="px-4 py-4 text-xs text-slate-600">{quote.branch}</td><td className="px-4 py-4 whitespace-nowrap text-slate-600">{formatDate(payment.date)}</td><td className="px-4 py-4 text-slate-600">{payment.userName}</td><td className="px-4 py-4 font-semibold text-blue-700">{quote.folio}</td><td className="px-4 py-4 font-medium text-slate-800">{quote.clientName}</td><td className="px-4 py-4"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{types[payment.paymentType]}</span></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td><td className="max-w-55 truncate px-4 py-4 text-slate-600" title={payment.comment}>{payment.comment || '—'}</td><td className="px-4 py-4 text-right font-bold text-slate-800">{formatCurrency(payment.amount)}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => setSelectedPaymentId(payment.id)} title="Ver comprobante" className="grid size-8 place-items-center rounded-lg text-blue-700 hover:bg-blue-50"><Eye size={15} /></button><Link to={`/pagos/${payment.id}/comprobante`} title="Imprimir comprobante" className="grid size-8 place-items-center rounded-lg text-violet-700 hover:bg-violet-50"><Printer size={15} /></Link><Link to={`/cotizaciones/${quote.id}`} title="Ver cotización" className="grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"><ArrowRight size={15} /></Link></div></td></tr> })}</tbody></table></div></section>}
    <PaymentProofModal payment={selectedPayment} folio={selectedQuote?.folio ?? ''} holderName={selectedQuote?.clientName ?? ''} onClose={() => setSelectedPaymentId(null)} />
  </div>
}
