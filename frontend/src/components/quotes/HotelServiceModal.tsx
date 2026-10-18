import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { z } from 'zod'
import { hotelOperators, hotelPlans, hotelPurchaseMethods } from '../../data/serviceCatalogs'
import type { HotelService } from '../../types/quote'
import { ModalShell } from '../ui/ModalShell'

const hotelSchema = z
  .object({
    purchaseMethod: z.string().min(1, 'Selecciona un método de compra.'),
    hotelName: z.string().trim().min(1, 'Ingresa el nombre del hotel.'),
    checkIn: z.string().min(1, 'Selecciona la fecha de check-in.'),
    checkOut: z.string().min(1, 'Selecciona la fecha de check-out.'),
    plan: z.string().min(1, 'Selecciona un plan.'),
    rooms: z.number().min(1, 'Debe existir al menos un cuarto.'),
    operator: z.string(),
    reservationCode: z.string(),
    cancellationDate: z.string(),
    comments: z.string(),
    netPrice: z.number().min(0, 'El precio neto no puede ser negativo.'),
    publicPrice: z.number().min(0, 'El precio público no puede ser negativo.'),
  })
  .refine((data) => !data.checkIn || !data.checkOut || data.checkOut >= data.checkIn, {
    message: 'El check-out no puede ser anterior al check-in.',
    path: ['checkOut'],
  })

type HotelFormData = z.infer<typeof hotelSchema>

type HotelServiceModalProps = {
  open: boolean
  onClose: () => void
  onSave: (hotel: HotelService) => void | Promise<void>
  initialValue?: HotelService | null
}

const defaultValues: HotelFormData = {
  purchaseMethod: '',
  hotelName: '',
  checkIn: '',
  checkOut: '',
  plan: '',
  rooms: 1,
  operator: '',
  reservationCode: '',
  cancellationDate: '',
  comments: '',
  netPrice: 0,
  publicPrice: 0,
}

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function HotelServiceModal({ open, onClose, onSave, initialValue }: HotelServiceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues,
  })
  useEffect(() => { if (open) reset(initialValue ? { ...initialValue } : defaultValues) }, [open, initialValue, reset])

  const closeModal = () => {
    if (isSubmitting) return
    reset(defaultValues)
    onClose()
  }

  const submitHotel = async (data: HotelFormData) => {
    await onSave({ id: initialValue?.id ?? crypto.randomUUID(), type: 'hotel', ...data })
    reset(defaultValues)
    onClose()
  }

  const errorClass = 'mt-1 block text-xs text-red-600'

  return (
    <ModalShell open={open} title={initialValue ? "Editar servicio - Hotel" : "Agregar servicio - Hotel"} titleId="hotel-modal-title" onClose={closeModal} closeDisabled={isSubmitting}>
        <form onSubmit={handleSubmit(submitHotel)} className="flex min-h-0 flex-1 flex-col">
          <div className="grid grid-cols-1 gap-4 overflow-y-auto px-4 py-4 sm:grid-cols-2 sm:gap-5 sm:px-6 sm:py-5">
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Método de compra <span className="text-red-500">*</span>
              <select {...register('purchaseMethod')} className={inputClass} aria-invalid={Boolean(errors.purchaseMethod)}>
                <option value="">Selecciona una opción</option>
                {hotelPurchaseMethods.map((method) => <option key={method}>{method}</option>)}
              </select>
              {errors.purchaseMethod && <span className={errorClass}>{errors.purchaseMethod.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Nombre del hotel <span className="text-red-500">*</span>
              <input {...register('hotelName')} className={inputClass} placeholder="Ej. Hotel Costa Azul" />
              {errors.hotelName && <span className={errorClass}>{errors.hotelName.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Check-in <span className="text-red-500">*</span>
              <input type="date" {...register('checkIn')} className={inputClass} />
              {errors.checkIn && <span className={errorClass}>{errors.checkIn.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Check-out <span className="text-red-500">*</span>
              <input type="date" {...register('checkOut')} className={inputClass} />
              {errors.checkOut && <span className={errorClass}>{errors.checkOut.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Plan <span className="text-red-500">*</span>
              <select {...register('plan')} className={inputClass}>
                <option value="">Selecciona un plan</option>
                {hotelPlans.map((plan) => <option key={plan}>{plan}</option>)}
              </select>
              {errors.plan && <span className={errorClass}>{errors.plan.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Cuartos <span className="text-red-500">*</span>
              <input type="number" min="1" step="1" {...register('rooms', { valueAsNumber: true })} className={inputClass} />
              {errors.rooms && <span className={errorClass}>{errors.rooms.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Operadora
              <select {...register('operator')} className={inputClass}>
                <option value="">Sin operadora</option>
                {hotelOperators.map((operator) => <option key={operator}>{operator}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Clave de reservación
              <input {...register('reservationCode')} className={inputClass} placeholder="Ej. RES-00125" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fecha de cancelación de operadora
              <input type="date" {...register('cancellationDate')} className={inputClass} />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Comentarios
              <textarea
                {...register('comments')}
                rows={3}
                className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                placeholder="Información adicional del hospedaje"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Precio neto <span className="text-red-500">*</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 mt-0.75 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input type="number" min="0" step="0.01" {...register('netPrice', { valueAsNumber: true })} className={`${inputClass} pl-7`} />
              </div>
              {errors.netPrice && <span className={errorClass}>{errors.netPrice.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Precio público <span className="text-red-500">*</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 mt-0.75 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input type="number" min="0" step="0.01" {...register('publicPrice', { valueAsNumber: true })} className={`${inputClass} pl-7`} />
              </div>
              {errors.publicPrice && <span className={errorClass}>{errors.publicPrice.message}</span>}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex sm:justify-end sm:px-6 sm:py-4">
            <button type="button" onClick={closeModal} disabled={isSubmitting} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {initialValue ? 'Guardar cambios' : 'Agregar Hotel'}
            </button>
          </div>
        </form>
    </ModalShell>
  )
}
