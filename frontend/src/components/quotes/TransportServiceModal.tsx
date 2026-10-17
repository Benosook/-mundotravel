import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { hotelOperators, hotelPurchaseMethods, transportTypes } from '../../data/quotes'
import type { TransportService } from '../../types/quote'
import { ModalShell } from '../ui/ModalShell'

const transportSchema = z
  .object({
    purchaseMethod: z.string().min(1, 'Selecciona un método de compra.'),
    transportType: z.string().min(1, 'Selecciona un tipo de transporte.'),
    tripType: z.enum(['round', 'one-way'], { message: 'Selecciona una modalidad.' }),
    origin: z.string().trim().min(1, 'Ingresa el origen.'),
    destination: z.string().trim().min(1, 'Ingresa el destino.'),
    departureDateTime: z.string().min(1, 'Selecciona la fecha de salida.'),
    returnDateTime: z.string(),
    operator: z.string(),
    operatorCode: z.string(),
    cancellationDate: z.string(),
    comments: z.string(),
    netPrice: z.number().min(0, 'El precio neto no puede ser negativo.'),
    publicPrice: z.number().min(0, 'El precio público no puede ser negativo.'),
  })
  .superRefine((data, context) => {
    if (data.tripType === 'round' && !data.returnDateTime) {
      context.addIssue({
        code: 'custom',
        message: 'La fecha de regreso es obligatoria para un traslado redondo.',
        path: ['returnDateTime'],
      })
    }

    if (
      data.tripType === 'round' &&
      data.departureDateTime &&
      data.returnDateTime &&
      data.returnDateTime < data.departureDateTime
    ) {
      context.addIssue({
        code: 'custom',
        message: 'El regreso no puede ser anterior a la salida.',
        path: ['returnDateTime'],
      })
    }

    if (
      data.cancellationDate &&
      data.departureDateTime &&
      data.cancellationDate > data.departureDateTime.slice(0, 10)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'La autocancelación no puede ser posterior a la salida.',
        path: ['cancellationDate'],
      })
    }
  })

type TransportFormData = z.infer<typeof transportSchema>

type TransportServiceModalProps = {
  open: boolean
  onClose: () => void
  onSave: (transport: TransportService) => void
}

const defaultValues: TransportFormData = {
  purchaseMethod: '',
  transportType: '',
  tripType: 'round',
  origin: '',
  destination: '',
  departureDateTime: '',
  returnDateTime: '',
  operator: '',
  operatorCode: '',
  cancellationDate: '',
  comments: '',
  netPrice: 0,
  publicPrice: 0,
}

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function TransportServiceModal({ open, onClose, onSave }: TransportServiceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransportFormData>({ resolver: zodResolver(transportSchema), defaultValues })

  const tripType = watch('tripType')

  const closeModal = () => {
    if (isSubmitting) return
    reset(defaultValues)
    onClose()
  }

  const submitTransport = (data: TransportFormData) => {
    onSave({
      id: crypto.randomUUID(),
      type: 'transport',
      ...data,
      returnDateTime: data.tripType === 'one-way' ? undefined : data.returnDateTime,
    })
    reset(defaultValues)
    onClose()
  }

  const errorClass = 'mt-1 block text-xs text-red-600'

  return (
    <ModalShell open={open} title="Agregar servicio - Transporte" titleId="transport-modal-title" onClose={closeModal} closeDisabled={isSubmitting}>
        <form onSubmit={handleSubmit(submitTransport)} className="flex min-h-0 flex-1 flex-col">
          <div className="grid grid-cols-1 gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Método de compra <span className="text-red-500">*</span>
              <select {...register('purchaseMethod')} className={inputClass}>
                <option value="">Selecciona una opción</option>
                {hotelPurchaseMethods.map((method) => <option key={method}>{method}</option>)}
              </select>
              {errors.purchaseMethod && <span className={errorClass}>{errors.purchaseMethod.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Tipo <span className="text-red-500">*</span>
              <select {...register('transportType')} className={inputClass}>
                <option value="">Selecciona un tipo</option>
                {transportTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              {errors.transportType && <span className={errorClass}>{errors.transportType.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Transporte / modalidad <span className="text-red-500">*</span>
              <select {...register('tripType')} className={inputClass}>
                <option value="round">Redondo</option>
                <option value="one-way">Sencillo</option>
              </select>
              {errors.tripType && <span className={errorClass}>{errors.tripType.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Origen <span className="text-red-500">*</span>
              <input {...register('origin')} className={inputClass} placeholder="Ej. Aeropuerto de Cancún" />
              {errors.origin && <span className={errorClass}>{errors.origin.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Destino <span className="text-red-500">*</span>
              <input {...register('destination')} className={inputClass} placeholder="Ej. Hotel Costa Azul" />
              {errors.destination && <span className={errorClass}>{errors.destination.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fecha salida <span className="text-red-500">*</span>
              <input type="datetime-local" {...register('departureDateTime')} className={inputClass} />
              {errors.departureDateTime && <span className={errorClass}>{errors.departureDateTime.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fecha regreso {tripType === 'round' && <span className="text-red-500">*</span>}
              <input type="datetime-local" {...register('returnDateTime')} disabled={tripType === 'one-way'} className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`} />
              {errors.returnDateTime && <span className={errorClass}>{errors.returnDateTime.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Operadora
              <select {...register('operator')} className={inputClass}>
                <option value="">Sin operadora</option>
                {hotelOperators.map((operator) => <option key={operator}>{operator}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Clave
              <input {...register('operatorCode')} className={inputClass} placeholder="Ej. TRA-4821" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fecha AutoCancelación
              <input type="date" {...register('cancellationDate')} className={inputClass} />
              {errors.cancellationDate && <span className={errorClass}>{errors.cancellationDate.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Comentarios
              <textarea {...register('comments')} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Información adicional del traslado" />
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

          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button type="button" onClick={closeModal} disabled={isSubmitting} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Agregar Transporte</button>
          </div>
        </form>
    </ModalShell>
  )
}
