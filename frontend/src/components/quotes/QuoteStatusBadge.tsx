import type { QuoteStatus } from '../../types/quote'

const statusStyles: Record<QuoteStatus, { label: string; className: string }> = {
  active: { label: 'Activa', className: 'bg-blue-50 text-blue-700 ring-blue-600/10' },
  pending: { label: 'Pendiente', className: 'bg-orange-50 text-orange-700 ring-orange-600/10' },
  paid: { label: 'Liquidada', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700 ring-red-600/10' },
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const style = statusStyles[status]
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.className}`}>{style.label}</span>
}
