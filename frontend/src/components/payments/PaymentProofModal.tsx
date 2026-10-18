import type { Payment, PaymentType } from '../../types/quote'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { ModalShell } from '../ui/ModalShell'

const typeLabels: Record<PaymentType, string> = { cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro' }

export function PaymentProofModal({ payment, folio, holderName, onClose }: { payment: Payment | null; folio: string; holderName: string; onClose: () => void }) {
  if (!payment) return null
  return <ModalShell open title="Comprobante de pago" titleId="payment-proof-title" onClose={onClose} eyebrow="Pagos" maxWidthClass="max-w-xl">
    <div className="overflow-y-auto p-6"><div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="m-0 text-lg font-extrabold text-navy-900"><span className="text-blue-600">+</span>MundoTravel</p><p className="mb-0 mt-1 text-xs text-slate-500">Comprobante registrado</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{payment.id}</span></div><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs text-slate-400">Paquete</dt><dd className="m-0 mt-1 font-semibold">{folio}</dd></div><div><dt className="text-xs text-slate-400">Titular</dt><dd className="m-0 mt-1 font-semibold">{holderName}</dd></div><div><dt className="text-xs text-slate-400">Fecha</dt><dd className="m-0 mt-1 font-semibold">{formatDate(payment.date)}</dd></div><div><dt className="text-xs text-slate-400">Forma de pago</dt><dd className="m-0 mt-1 font-semibold">{typeLabels[payment.paymentType]}</dd></div><div><dt className="text-xs text-slate-400">Usuario</dt><dd className="m-0 mt-1 font-semibold">{payment.userName}</dd></div><div><dt className="text-xs text-slate-400">Monto</dt><dd className="m-0 mt-1 text-lg font-bold text-blue-700">{formatCurrency(payment.amount)}</dd></div></dl>{payment.comment && <p className="mb-0 mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">{payment.comment}</p>}</div><p className="mb-0 mt-4 text-xs text-slate-500">El almacenamiento de fotografías se habilitará cuando exista soporte de archivos.</p></div>
    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" onClick={onClose} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Cerrar</button></div>
  </ModalShell>
}
