import type { PaymentScheduleItem, PaymentScheduleStatus } from '../../../types/quote'
import { formatCurrency } from '../../../utils/currency'
import { formatDate } from '../../../utils/date'

const statuses: Record<PaymentScheduleStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-orange-50 text-orange-700' },
  paid: { label: 'Pagado', className: 'bg-emerald-50 text-emerald-700' },
  overdue: { label: 'Vencido', className: 'bg-red-50 text-red-700' },
}

export function PaymentScheduleList({ schedule }: { schedule: PaymentScheduleItem[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
      <div className="border-b border-slate-200 px-5 py-4"><h2 className="m-0 text-base font-semibold text-slate-900">Plan de anticipos</h2></div>
      <ol className="m-0 divide-y divide-slate-100 p-0">{schedule.map((item) => { const status = statuses[item.status]; return <li key={item.id} className="list-none px-5 py-3.5"><div className="flex items-center justify-between gap-3"><strong className="text-sm text-slate-800">{item.installmentNumber}. Anticipo</strong><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span></div><p className="mb-0 mt-2 text-xs text-slate-500">Fecha límite: {formatDate(item.dueDate)}</p><p className="mb-0 mt-1 text-sm font-semibold text-slate-800">{formatCurrency(item.amount)}</p></li> })}</ol>
    </section>
  )
}
