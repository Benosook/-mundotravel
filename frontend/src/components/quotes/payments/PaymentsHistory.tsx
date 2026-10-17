import type { Payment, PaymentStatus, PaymentType } from '../../../types/quote'
import { formatCurrency } from '../../../utils/currency'
import { formatDate } from '../../../utils/date'

const statusMap: Record<PaymentStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmado', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pendiente', className: 'bg-orange-50 text-orange-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-700' },
}

const typeMap: Record<PaymentType, string> = {
  cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro',
}

export function PaymentsHistory({ payments }: { payments: Payment[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between"><h3 className="m-0 text-sm font-semibold text-slate-900">Historial de abonos</h3><span className="text-xs text-slate-500">{payments.length} registros</span></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-210 text-left text-sm">
          <thead><tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Moneda</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Comentario</th><th className="px-4 py-3 text-right">Monto</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{payments.map((payment) => { const status = statusMap[payment.status]; return <tr key={payment.id}><td className="whitespace-nowrap px-4 py-3">{formatDate(payment.date)}</td><td className="px-4 py-3">{payment.userName}</td><td className="px-4 py-3">{typeMap[payment.paymentType]}</td><td className="px-4 py-3">{payment.currency}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td><td className="max-w-55 truncate px-4 py-3 text-slate-600" title={payment.comment}>{payment.comment || '—'}</td><td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatCurrency(payment.amount)}</td></tr> })}</tbody>
        </table>
      </div>
    </section>
  )
}
