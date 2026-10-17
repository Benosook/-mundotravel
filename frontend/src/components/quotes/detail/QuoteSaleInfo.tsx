import type { QuoteDetail } from '../../../types/quote'
import { formatDate } from '../../../utils/date'

type Props = Pick<QuoteDetail, 'sellerName' | 'branch' | 'saleDate' | 'paymentLimitDate' | 'settlementDate' | 'departureDate' | 'returnDate'>

export function QuoteSaleInfo(props: Props) {
  const items = [
    ['Vendedor', props.sellerName], ['Sucursal', props.branch], ['Fecha de venta', formatDate(props.saleDate)],
    ['Límite de pago', formatDate(props.paymentLimitDate)],
    ...(props.settlementDate ? [['Fecha de liquidación', formatDate(props.settlementDate)]] : []),
    ['Fecha de salida', formatDate(props.departureDate)], ['Fecha de regreso', formatDate(props.returnDate)],
  ]
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
      <div className="border-b border-slate-200 px-5 py-4"><h2 className="m-0 text-base font-semibold text-slate-900">Datos de venta</h2></div>
      <dl className="grid grid-cols-1 gap-3 p-5">
        {items.map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-slate-400">{label}</dt><dd className="m-0 mt-1 text-sm font-semibold text-slate-700">{value}</dd></div>)}
      </dl>
    </section>
  )
}
