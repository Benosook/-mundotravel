import { CalendarClock } from 'lucide-react'
import { upcomingPayments } from '../../data/dashboard'
import { formatCurrency } from '../../utils/currency'

function getDaysStyle(days: number) {
  if (days <= 3) return 'bg-red-50 text-red-700 ring-red-600/10'
  if (days <= 12) return 'bg-orange-50 text-orange-700 ring-orange-600/10'
  return 'bg-slate-100 text-slate-600 ring-slate-500/10'
}

function formatDays(days: number) {
  if (days < 0) return `${days} días`
  if (days === 0) return 'Hoy'
  return `${days} días`
}

export function UpcomingPaymentsTable() {
  return (
    <section
      aria-labelledby="upcoming-payments-title"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 id="upcoming-payments-title" className="m-0 text-base font-semibold text-slate-900">
            Próximos anticipos
          </h2>
          <p className="mb-0 mt-1 text-xs text-slate-500">
            Pagos que requieren seguimiento durante las próximas semanas.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
          <CalendarClock size={16} className="text-blue-600" aria-hidden="true" />
          {upcomingPayments.length} anticipos
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-245 border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-4 py-3">Paquete</th>
              <th className="px-4 py-3 text-center">Pasajeros</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3 text-center">Anticipo</th>
              <th className="px-4 py-3">Fecha límite</th>
              <th className="px-4 py-3">Días restantes</th>
              <th className="px-5 py-3 text-right">Pago pendiente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {upcomingPayments.map((payment) => (
              <tr key={payment.id} className="transition-colors hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                  {payment.client}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{payment.packageName}</td>
                <td className="px-4 py-4 text-center text-slate-600">{payment.passengers}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{payment.phone}</td>
                <td className="px-4 py-4 text-center font-medium text-slate-700">
                  #{payment.installment}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{payment.dueDate}</td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getDaysStyle(payment.daysRemaining)}`}
                  >
                    {formatDays(payment.daysRemaining)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                  {formatCurrency(payment.pendingAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
