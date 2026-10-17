import { ArrowLeft, Ban, CircleDollarSign, Copy, FileText, Pencil, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QuoteStatusBadge } from '../components/quotes/QuoteStatusBadge'
import { PassengersList } from '../components/quotes/detail/PassengersList'
import { PaymentScheduleList } from '../components/quotes/detail/PaymentScheduleList'
import { QuoteFinancialSummary } from '../components/quotes/detail/QuoteFinancialSummary'
import { QuoteSaleInfo } from '../components/quotes/detail/QuoteSaleInfo'
import { QuoteServices } from '../components/quotes/detail/QuoteServices'
import { PaymentModal } from '../components/quotes/payments/PaymentModal'
import { PaymentsHistory } from '../components/quotes/payments/PaymentsHistory'
import { payments as paymentMocks } from '../data/payments'
import { quoteDetails } from '../data/quoteDetails'

const actions = [
  { label: 'Abonar', icon: CircleDollarSign, tone: 'primary' },
  { label: 'Añadir servicio', icon: Plus, tone: 'secondary' },
  { label: 'Editar', icon: Pencil, tone: 'secondary' },
  { label: 'Clonar', icon: Copy, tone: 'secondary' },
  { label: 'Cancelar', icon: Ban, tone: 'danger' },
] as const

export function QuoteDetailPage() {
  const { id } = useParams()
  const [message, setMessage] = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [localPayments, setLocalPayments] = useState(() => paymentMocks.filter((payment) => payment.quoteId === id))
  const quote = quoteDetails.find((item) => item.id === id)

  useEffect(() => {
    setLocalPayments(paymentMocks.filter((payment) => payment.quoteId === id))
    setIsPaymentModalOpen(false)
  }, [id])

  const totalPaid = useMemo(
    () => localPayments.reduce((total, payment) => payment.status === 'confirmed' ? total + payment.amount : total, 0),
    [localPayments],
  )
  const remainingBalance = Math.max((quote?.publicPrice ?? 0) - totalPaid, 0)

  if (!quote) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white px-8 py-20 text-center shadow-sm shadow-slate-900/3">
        <h1 className="m-0 text-2xl font-bold text-slate-900">Cotización no encontrada</h1>
        <p className="mb-0 mt-2 text-sm text-slate-500">No pudimos encontrar la cotización solicitada.</p>
        <Link to="/cotizaciones" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          <ArrowLeft size={16} aria-hidden="true" /> Volver al historial
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/cotizaciones" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft size={16} aria-hidden="true" /> Volver a cotizaciones
      </Link>

      <header className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-5 shadow-sm shadow-slate-900/3">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">{quote.holderName}</h1>
              <QuoteStatusBadge status={quote.status} />
            </div>
            <p className="mb-0 mt-2 text-sm font-semibold text-blue-700">{quote.folio}</p>
            <p className="mb-0 mt-1 text-sm text-slate-500">Viaje a {quote.destination}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link to={`/cotizaciones/${quote.id}/documento`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <FileText size={16} aria-hidden="true" /> Documento
            </Link>
            {actions.map(({ label, icon: Icon, tone }) => (
              <button key={label} type="button" onClick={() => label === 'Abonar' ? setIsPaymentModalOpen(true) : setMessage(`${label}: disponible en la siguiente fase.`)} className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${tone === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : tone === 'danger' ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                <Icon size={16} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        </div>
        {message && <p role="status" className="mb-0 mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p>}
      </header>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <QuoteFinancialSummary publicPrice={quote.publicPrice} netPrice={quote.netPrice} totalPaid={totalPaid} remainingBalance={remainingBalance} />
          <QuoteSaleInfo sellerName={quote.sellerName} branch={quote.branch} saleDate={quote.saleDate} paymentLimitDate={quote.paymentLimitDate} settlementDate={quote.settlementDate} departureDate={quote.departureDate} returnDate={quote.returnDate} />
          <PassengersList passengers={quote.passengers} />
          <PaymentScheduleList schedule={quote.paymentSchedule} />
          {quote.internalComment && <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/3"><h2 className="m-0 text-sm font-semibold text-slate-900">Comentario interno</h2><p className="mb-0 mt-2 text-sm leading-6 text-slate-600">{quote.internalComment}</p></section>}
        </aside>

        <main className="min-w-0">
          <QuoteServices services={quote.services} />
        </main>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/3">
        <PaymentsHistory payments={localPayments} />
      </section>

      <PaymentModal
        open={isPaymentModalOpen}
        quoteId={quote.id}
        folio={quote.folio}
        holderName={quote.holderName}
        publicPrice={quote.publicPrice}
        totalPaid={totalPaid}
        remainingBalance={remainingBalance}
        payments={localPayments}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={(payment) => setLocalPayments((current) => [payment, ...current])}
      />
    </div>
  )
}
