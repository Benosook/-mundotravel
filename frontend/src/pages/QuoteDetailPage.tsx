import { ArrowLeft, CircleDollarSign, FileText, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PassengersEditor } from '../components/quotes/PassengersEditor'
import { QuoteStatusBadge } from '../components/quotes/QuoteStatusBadge'
import { PaymentScheduleList } from '../components/quotes/detail/PaymentScheduleList'
import { QuoteFinancialSummary } from '../components/quotes/detail/QuoteFinancialSummary'
import { QuoteSaleInfo } from '../components/quotes/detail/QuoteSaleInfo'
import { QuoteServices } from '../components/quotes/detail/QuoteServices'
import { PaymentModal } from '../components/quotes/payments/PaymentModal'
import { PaymentsHistory } from '../components/quotes/payments/PaymentsHistory'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { ModalShell } from '../components/ui/ModalShell'
import { mapQuoteDetail } from '../services/mappers'
import { passengersApi } from '../services/passengersApi'
import { paymentsApi } from '../services/paymentsApi'
import { quotesApi } from '../services/quotesApi'
import type { QuoteDetail } from '../types/quote'

export function QuoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true); setError('')
    try { setQuote(mapQuoteDetail(await quotesApi.get(id))) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No encontramos la cotización.') }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { void load() }, [load])

  const syncPassengers = async (next: QuoteDetail['passengers']) => {
    if (!id || !quote) return
    try {
      const previous = quote.passengers
      for (const removed of previous.filter((item) => !next.some((candidate) => candidate.id === item.id))) await passengersApi.remove(id, removed.id)
      for (const item of next) {
        const old = previous.find((candidate) => candidate.id === item.id)
        if (!old) await passengersApi.create(id, { name: item.name, age: item.age, passenger_type: item.type })
        else if (old.name !== item.name || old.age !== item.age || old.type !== item.type) await passengersApi.update(id, item.id, { name: item.name, age: item.age, passenger_type: item.type })
      }
      await load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible actualizar acompañantes.') }
  }

  if (loading) return <LoadingState label="Cargando detalle…" />
  if (error && !quote) return <ErrorState message={error} onRetry={() => void load()} />
  if (!quote) return null
  const payments = quote.payments ?? []

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    setDeleteError('')
    try {
      await quotesApi.remove(id)
      navigate('/cotizaciones', { replace: true, state: { message: 'Cotización eliminada correctamente.' } })
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : 'No fue posible eliminar la cotización.')
    } finally {
      setDeleting(false)
    }
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/cotizaciones" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/> Volver a cotizaciones</Link><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setDeleteError(''); setDeleteOpen(true) }} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 size={16}/> Eliminar</button><Link to={`/cotizaciones/${quote.id}/editar`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><Pencil size={16}/> Editar cotización</Link></div></div>
    {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <header className="rounded-xl border border-l-4 border-slate-200 border-l-blue-600 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-3"><h1 className="m-0 text-2xl font-bold">{quote.holderName}</h1><QuoteStatusBadge status={quote.status}/></div><p className="mb-0 mt-2 font-semibold text-blue-700">{quote.folio}</p><p className="mb-0 mt-1 text-sm text-slate-500">Viaje a {quote.destination}</p></div><div className="flex flex-wrap gap-2"><Link to={`/cotizaciones/${quote.id}/documento`} className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-semibold"><FileText size={16}/> Documento</Link><button onClick={() => setPaymentOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white"><CircleDollarSign size={16}/> Abonar</button></div></div></header>
    <PassengersEditor title="Acompañantes de la cotización" passengers={quote.passengers} onChange={(items) => void syncPassengers(items)} />
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]"><aside className="space-y-4"><QuoteFinancialSummary publicPrice={quote.publicPrice} netPrice={quote.netPrice} totalPaid={quote.totalPaid} remainingBalance={quote.remainingBalance}/><QuoteSaleInfo sellerName={quote.sellerName} branch={quote.branch} saleDate={quote.saleDate} paymentLimitDate={quote.paymentLimitDate} settlementDate={quote.settlementDate} departureDate={quote.departureDate} returnDate={quote.returnDate}/><PaymentScheduleList schedule={quote.paymentSchedule}/>{quote.internalComment&&<section className="rounded-xl border bg-white p-5"><h2 className="m-0 text-sm font-semibold">Comentario interno</h2><p className="mb-0 mt-2 text-sm text-slate-600">{quote.internalComment}</p></section>}</aside><main><QuoteServices services={quote.services}/></main></div>
    <section className="rounded-xl border bg-white p-5"><PaymentsHistory payments={payments}/></section>
    <PaymentModal open={paymentOpen} quoteId={quote.id} folio={quote.folio} holderName={quote.holderName} publicPrice={quote.publicPrice} totalPaid={quote.totalPaid} remainingBalance={quote.remainingBalance} payments={payments} onClose={() => setPaymentOpen(false)} onSave={async (payment) => { await paymentsApi.create(quote.id,{date:new Date(`${payment.date}T12:00:00`).toISOString(),payment_type:payment.paymentType,currency:'MXN',amount:payment.amount,status:'confirmed',comment:payment.comment||null}); await load() }}/>
    <ModalShell open={deleteOpen} title="Eliminar cotización" titleId="delete-quote-title" eyebrow="Acción permanente" maxWidthClass="max-w-lg" closeDisabled={deleting} onClose={() => setDeleteOpen(false)}>
      <div className="space-y-4 p-6">
        <p className="m-0 text-sm leading-6 text-slate-600">¿Seguro que deseas eliminar la cotización <strong className="text-slate-900">{quote.folio}</strong>? También se eliminarán sus pasajeros, servicios y plan de anticipos.</p>
        {payments.length > 0 && <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Esta cotización tiene pagos o abonos registrados. Por seguridad, no puede eliminarse; puedes cambiar su estado a cancelada.</p>}
        {deleteError && <p className="m-0 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" disabled={deleting} onClick={() => setDeleteOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">Cancelar</button>
        <button type="button" disabled={deleting || payments.length > 0} onClick={() => void handleDelete()} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={16}/>{deleting ? 'Eliminando…' : 'Sí, eliminar'}</button>
      </div>
    </ModalShell>
  </div>
}
