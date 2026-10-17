import type { ReactNode } from 'react'
import { formatCurrency } from '../../../utils/currency'

type Props = { label: string; title: string; netPrice: number; publicPrice: number; children: ReactNode }

export function ServiceCardShell({ label, title, netPrice, publicPrice, children }: Props) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-900 px-5 py-3 text-white">
        <h3 className="m-0 text-sm font-semibold"><span className="mr-2 text-blue-300">{label}</span>{title}</h3>
        <div className="flex gap-4 text-xs text-slate-200"><span>Neto: <strong className="text-white">{formatCurrency(netPrice)}</strong></span><span>Público: <strong className="text-white">{formatCurrency(publicPrice)}</strong></span></div>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-2 xl:grid-cols-4">{children}</dl>
    </article>
  )
}

export function ServiceField({ label, value, full = false }: { label: string; value: string | number; full?: boolean }) {
  if (value === '') return null
  return <div className={full ? 'sm:col-span-2 xl:col-span-4' : ''}><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="m-0 mt-1 text-sm font-medium text-slate-700">{value}</dd></div>
}
