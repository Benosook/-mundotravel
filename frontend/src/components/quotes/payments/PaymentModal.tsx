import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Payment, PaymentType } from '../../../types/quote'
import { formatCurrency } from '../../../utils/currency'
import { ModalShell } from '../../ui/ModalShell'
import { PaymentsHistory } from './PaymentsHistory'

type PaymentModalProps = {
  open: boolean
  quoteId: string
  folio: string
  holderName: string
  publicPrice: number
  totalPaid: number
  remainingBalance: number
  payments: Payment[]
  onClose: () => void
  onSave: (payment: Omit<Payment, 'id' | 'userName'>) => void | Promise<void>
}

const paymentTypes: Array<{ value: PaymentType; label: string }> = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'other', label: 'Otro' },
]

const today = new Date().toISOString().slice(0, 10)
const inputClass = 'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400'

export function PaymentModal(props: PaymentModalProps) {
  const [success, setSuccess] = useState(false)
  const schema = useMemo(() => z.object({
    date: z.string().min(1, 'Selecciona la fecha.'),
    paymentType: z.enum(['cash', 'transfer', 'card', 'other'], { message: 'Selecciona el tipo de pago.' }),
    amount: z.number().positive('El monto debe ser mayor que cero.').max(props.remainingBalance, `El monto no puede superar ${formatCurrency(props.remainingBalance)}.`),
    comment: z.string(),
  }), [props.remainingBalance])

  type PaymentFormData = z.infer<typeof schema>
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentFormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, paymentType: 'transfer', amount: 0, comment: '' },
  })

  const closeModal = () => {
    if (isSubmitting) return
    setSuccess(false)
    reset({ date: today, paymentType: 'transfer', amount: 0, comment: '' })
    props.onClose()
  }

  const submitPayment = async (data: PaymentFormData) => {
    if (props.remainingBalance <= 0) return
    await props.onSave({
      quoteId: props.quoteId, date: data.date,
      paymentType: data.paymentType, currency: 'MXN', amount: data.amount, status: 'confirmed', comment: data.comment,
    })
    setSuccess(true)
    reset({ date: today, paymentType: 'transfer', amount: 0, comment: '' })
  }

  const disabled = props.remainingBalance <= 0
  const errorClass = 'mt-1 block text-xs text-red-600'

  return (
    <ModalShell open={props.open} title="Registrar abono" titleId="payment-modal-title" eyebrow="Cotización" onClose={closeModal} closeDisabled={isSubmitting} maxWidthClass="max-w-5xl">
      <div className="overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:grid-cols-5">
          <div><span className="text-xs text-slate-400">Folio</span><strong className="block text-sm text-slate-800">{props.folio}</strong></div>
          <div><span className="text-xs text-slate-400">Titular</span><strong className="block truncate text-sm text-slate-800">{props.holderName}</strong></div>
          <div><span className="text-xs text-slate-400">Precio público</span><strong className="block text-sm text-slate-800">{formatCurrency(props.publicPrice)}</strong></div>
          <div><span className="text-xs text-slate-400">Total abonado</span><strong className="block text-sm text-emerald-700">{formatCurrency(props.totalPaid)}</strong></div>
          <div><span className="text-xs text-slate-400">Saldo pendiente</span><strong className="block text-sm text-blue-800">{formatCurrency(props.remainingBalance)}</strong></div>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="m-0 text-sm font-semibold text-slate-900">Nuevo abono</h3>
            {disabled ? (
              <p className="mb-0 mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Esta cotización no tiene saldo pendiente.</p>
            ) : (
              <form onSubmit={handleSubmit(submitPayment)} className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-xs font-semibold text-slate-600">Fecha <span className="text-red-500">*</span><input type="date" {...register('date')} className={inputClass} />{errors.date && <span className={errorClass}>{errors.date.message}</span>}</label>
                <label className="text-xs font-semibold text-slate-600">Tipo de pago <span className="text-red-500">*</span><select {...register('paymentType')} className={inputClass}>{paymentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>{errors.paymentType && <span className={errorClass}>{errors.paymentType.message}</span>}</label>
                <label className="text-xs font-semibold text-slate-600">Moneda<input value="MXN" disabled readOnly className={inputClass} /></label>
                <label className="text-xs font-semibold text-slate-600">Monto <span className="text-red-500">*</span><input type="number" min="0.01" step="0.01" {...register('amount', { valueAsNumber: true })} className={inputClass} />{errors.amount && <span className={errorClass}>{errors.amount.message}</span>}</label>
                <label className="text-xs font-semibold text-slate-600 sm:col-span-2 lg:col-span-3">Comentario<textarea {...register('comment')} rows={2} className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Descripción opcional del abono" /></label>
                <div className="flex items-end"><button type="submit" disabled={isSubmitting} className="h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Registrar abono</button></div>
              </form>
            )}
            {success && <p role="status" className="mb-0 mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Abono registrado correctamente.</p>}
          </section>
          <PaymentsHistory payments={props.payments} />
        </div>
      </div>
    </ModalShell>
  )
}
