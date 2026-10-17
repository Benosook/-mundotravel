import type { QuoteDetail } from '../../../types/quote'
import { formatCurrency } from '../../../utils/currency'

type Props = Pick<QuoteDetail, 'publicPrice' | 'netPrice' | 'totalPaid' | 'remainingBalance'>

export function QuoteFinancialSummary({ publicPrice, netPrice, totalPaid, remainingBalance }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/3">
      <h2 className="m-0 text-base font-semibold text-slate-900">Resumen financiero</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Precio público</dt><dd className="m-0 font-semibold text-slate-800">{formatCurrency(publicPrice)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Precio neto</dt><dd className="m-0 font-semibold text-slate-800">{formatCurrency(netPrice)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Total abonado</dt><dd className="m-0 font-semibold text-emerald-700">{formatCurrency(totalPaid)}</dd></div>
      </dl>
      <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-blue-600">Saldo por pagar</span>
        <strong className="mt-1 block text-2xl text-blue-900">{formatCurrency(remainingBalance)}</strong>
      </div>
      {remainingBalance === 0 && <p className="mb-0 mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700">Liquidada</p>}
    </section>
  )
}
