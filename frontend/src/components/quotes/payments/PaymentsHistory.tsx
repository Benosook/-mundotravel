import { Link } from 'react-router-dom'
import type { Payment, PaymentStatus, PaymentType } from '../../../types/quote'
import { formatCurrency } from '../../../utils/currency'
import { formatDate } from '../../../utils/date'

const statusMap: Record<PaymentStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmado', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pendiente', className: 'bg-orange-50 text-orange-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-700' },
}
const typeMap: Record<PaymentType, string> = { cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro' }

export function PaymentsHistory({ payments }: { payments: Payment[] }) {
  return <section>
    <div className="mb-3 flex items-center justify-between gap-3"><h3 className="m-0 text-sm font-semibold text-slate-900">Historial de abonos</h3><span className="shrink-0 text-xs text-slate-500">{payments.length} registros</span></div>
    <div className="divide-y rounded-lg border border-slate-200 md:hidden">{payments.map((payment) => { const status = statusMap[payment.status]; return <article key={payment.id} className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="m-0 text-sm font-semibold">{formatDate(payment.date)}</p><p className="mb-0 mt-1 text-xs text-slate-500">{payment.userName}</p></div><strong className="text-sm">{formatCurrency(payment.amount)}</strong></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{typeMap[payment.paymentType]}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></div>{payment.comment && <p className="m-0 break-words text-sm text-slate-600">{payment.comment}</p>}<Link to={`/cotizaciones/${payment.quoteId}/pagos/${payment.id}/comprobante`} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-200 px-3 text-sm font-semibold text-blue-700">Ver comprobante</Link></article> })}</div>
    <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block"><table className="w-full min-w-210 text-left text-sm"><thead><tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Moneda</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Comentario</th><th className="px-4 py-3 text-right">Monto</th><th className="px-4 py-3"><span className="sr-only">Acciones</span></th></tr></thead><tbody className="divide-y divide-slate-100">{payments.map((payment) => { const status = statusMap[payment.status]; return <tr key={payment.id}><td className="whitespace-nowrap px-4 py-3">{formatDate(payment.date)}</td><td className="px-4 py-3">{payment.userName}</td><td className="px-4 py-3">{typeMap[payment.paymentType]}</td><td className="px-4 py-3">{payment.currency}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td><td className="max-w-55 truncate px-4 py-3 text-slate-600" title={payment.comment}>{payment.comment || '—'}</td><td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatCurrency(payment.amount)}</td><td className="px-4 py-3"><Link to={`/cotizaciones/${payment.quoteId}/pagos/${payment.id}/comprobante`} className="text-xs font-semibold text-blue-700">Comprobante</Link></td></tr> })}</tbody></table></div>
  </section>
}
