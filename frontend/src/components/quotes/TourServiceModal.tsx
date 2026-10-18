import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { z } from 'zod'
import { hotelOperators, hotelPurchaseMethods } from '../../data/serviceCatalogs'
import type { TourService } from '../../types/quote'
import { ModalShell } from '../ui/ModalShell'

const tourSchema = z
  .object({
    purchaseMethod: z.string().min(1, 'Selecciona un método de compra.'),
    name: z.string().trim().min(1, 'Ingresa el nombre del tour.'),
    startDateTime: z.string().min(1, 'Selecciona la fecha y hora de inicio.'),
    cancellationDate: z.string(),
    operator: z.string(),
    operatorCode: z.string(),
    comments: z.string(),
    netPrice: z.number().min(0, 'El precio neto no puede ser negativo.'),
    publicPrice: z.number().min(0, 'El precio público no puede ser negativo.'),
  })
  .refine(
    (data) =>
      !data.cancellationDate ||
      !data.startDateTime ||
      data.cancellationDate <= data.startDateTime.slice(0, 10),
    {
      message: 'La cancelación no puede ser posterior al inicio del tour.',
      path: ['cancellationDate'],
    },
  )

type TourFormData = z.infer<typeof tourSchema>

type TourServiceModalProps = {
  open: boolean
  onClose: () => void
  onSave: (tour: TourService) => void | Promise<void>
  initialValue?: TourService | null
}

const defaultValues: TourFormData = {
  purchaseMethod: '',
  name: '',
  startDateTime: '',
  cancellationDate: '',
  operator: '',
  operatorCode: '',
  comments: '',
  netPrice: 0,
  publicPrice: 0,
}

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function TourServiceModal({ open, onClose, onSave, initialValue }: TourServiceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues,
  })
  useEffect(() => { if (open) reset(initialValue ? { ...initialValue } : defaultValues) }, [open, initialValue, reset])

  const closeModal = () => {
    if (isSubmitting) return
    reset(defaultValues)
    onClose()
  }

  const submitTour = async (data: TourFormData) => {
    await onSave({ id: initialValue?.id ?? crypto.randomUUID(), type: 'tour', ...data })
    reset(defaultValues)
    onClose()
  }

  const errorClass = 'mt-1 block text-xs text-red-600'

  return (
    <ModalShell open={open} title={initialValue ? "Editar servicio - Tour" : "Agregar servicio - Tour"} titleId="tour-modal-title" onClose={closeModal} closeDisabled={isSubmitting} maxWidthClass="max-w-2xl">
        <form onSubmit={handleSubmit(submitTour)} className="flex min-h-0 flex-1 flex-col">
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
              Nombre del tour <span className="text-red-500">*</span>
              <input {...register('name')} className={inputClass} placeholder="Ej. Recorrido por el centro histórico" />
              {errors.name && <span className={errorClass}>{errors.name.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fecha/Hora Inicio <span className="text-red-500">*</span>
              <input type="datetime-local" {...register('startDateTime')} className={inputClass} />
              {errors.startDateTime && <span className={errorClass}>{errors.startDateTime.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fecha Cancelación Operadora
              <input type="date" {...register('cancellationDate')} className={inputClass} />
              {errors.cancellationDate && <span className={errorClass}>{errors.cancellationDate.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Operadora
              <select {...register('operator')} className={inputClass}>
                <option value="">Sin operadora</option>
                {hotelOperators.map((operator) => <option key={operator}>{operator}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Clave Operadora
              <input {...register('operatorCode')} className={inputClass} placeholder="Ej. TOUR-4821" />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Comentarios
              <textarea
                {...register('comments')}
                rows={3}
                className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                placeholder="Información adicional del tour"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Precio Neto <span className="text-red-500">*</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 mt-0.75 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input type="number" min="0" step="0.01" {...register('netPrice', { valueAsNumber: true })} className={`${inputClass} pl-7`} />
              </div>
              {errors.netPrice && <span className={errorClass}>{errors.netPrice.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Precio Público <span className="text-red-500">*</span>
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
              {initialValue ? 'Guardar cambios' : 'Agregar Tour'}
            </button>
          </div>
        </form>
    </ModalShell>
  )
}
