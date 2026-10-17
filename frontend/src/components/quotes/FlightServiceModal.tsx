import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { hotelOperators, hotelPurchaseMethods } from '../../data/quotes'
import type { FlightService } from '../../types/quote'
import { ModalShell } from '../ui/ModalShell'

const flightSchema = z
  .object({
    purchaseMethod: z.string().min(1, 'Selecciona un método de compra.'),
    tripType: z.enum(['round', 'one-way'], { message: 'Selecciona un tipo de vuelo.' }),
    origin: z.string().trim().min(1, 'Ingresa el origen.'),
    destination: z.string().trim().min(1, 'Ingresa el destino.'),
    departureDateTime: z.string().min(1, 'Selecciona la fecha y hora de salida.'),
    returnDateTime: z.string(),
    airline: z.string().trim().min(1, 'Ingresa la aerolínea.'),
    outboundFlightNumber: z.string().trim().min(1, 'Ingresa la clave del vuelo de salida.'),
    returnFlightNumber: z.string(),
    operator: z.string(),
    operatorCode: z.string(),
    comments: z.string(),
    netPrice: z.number().min(0, 'El precio neto no puede ser negativo.'),
    publicPrice: z.number().min(0, 'El precio público no puede ser negativo.'),
  })
  .superRefine((data, context) => {
    if (data.tripType === 'round' && !data.returnDateTime) {
      context.addIssue({
        code: 'custom',
        message: 'La fecha de regreso es obligatoria para un vuelo redondo.',
        path: ['returnDateTime'],
      })
    }

    if (data.tripType === 'round' && !data.returnFlightNumber.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Ingresa la clave del vuelo de regreso.',
        path: ['returnFlightNumber'],
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
  })

type FlightFormData = z.infer<typeof flightSchema>

type FlightServiceModalProps = {
  open: boolean
  onClose: () => void
  onSave: (flight: FlightService) => void
}

const defaultValues: FlightFormData = {
  purchaseMethod: '',
  tripType: 'round',
  origin: '',
  destination: '',
  departureDateTime: '',
  returnDateTime: '',
  airline: '',
  outboundFlightNumber: '',
  returnFlightNumber: '',
  operator: '',
  operatorCode: '',
  comments: '',
  netPrice: 0,
  publicPrice: 0,
}

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function FlightServiceModal({ open, onClose, onSave }: FlightServiceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FlightFormData>({ resolver: zodResolver(flightSchema), defaultValues })

  const tripType = watch('tripType')

  useEffect(() => {
    if (tripType === 'one-way') {
      setValue('returnDateTime', '')
      setValue('returnFlightNumber', '')
    }
  }, [setValue, tripType])

  const closeModal = () => {
    if (isSubmitting) return
    reset(defaultValues)
    onClose()
  }

  const submitFlight = (data: FlightFormData) => {
    onSave({
      id: crypto.randomUUID(),
      type: 'flight',
      ...data,
      returnDateTime: data.tripType === 'one-way' ? undefined : data.returnDateTime,
      returnFlightNumber: data.tripType === 'one-way' ? undefined : data.returnFlightNumber,
    })
    reset(defaultValues)
    onClose()
  }

  const errorClass = 'mt-1 block text-xs text-red-600'
  const returnDisabled = tripType === 'one-way'

  return (
    <ModalShell open={open} title="Agregar servicio - Vuelo" titleId="flight-modal-title" onClose={closeModal} closeDisabled={isSubmitting} maxWidthClass="max-w-4xl">
        <form onSubmit={handleSubmit(submitFlight)} className="flex min-h-0 flex-1 flex-col">
          <div className="grid grid-cols-1 gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Método de compra <span className="text-red-500">*</span>
              <select {...register('purchaseMethod')} className={inputClass}>
                <option value="">Selecciona una opción</option>
                {hotelPurchaseMethods.map((method) => <option key={method}>{method}</option>)}
              </select>
              {errors.purchaseMethod && <span className={errorClass}>{errors.purchaseMethod.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Tipo de vuelo <span className="text-red-500">*</span>
              <select {...register('tripType')} className={inputClass}>
                <option value="round">Redondo</option>
                <option value="one-way">Sencillo</option>
              </select>
              {errors.tripType && <span className={errorClass}>{errors.tripType.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Origen <span className="text-red-500">*</span>
              <input {...register('origin')} className={inputClass} placeholder="Ej. Ciudad de México" />
              {errors.origin && <span className={errorClass}>{errors.origin.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Destino <span className="text-red-500">*</span>
              <input {...register('destination')} className={inputClass} placeholder="Ej. Cancún" />
              {errors.destination && <span className={errorClass}>{errors.destination.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fecha/Hora salida <span className="text-red-500">*</span>
              <input type="datetime-local" {...register('departureDateTime')} className={inputClass} />
              {errors.departureDateTime && <span className={errorClass}>{errors.departureDateTime.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fecha/Hora regreso {tripType === 'round' && <span className="text-red-500">*</span>}
              <input type="datetime-local" {...register('returnDateTime')} disabled={returnDisabled} className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`} />
              {errors.returnDateTime && <span className={errorClass}>{errors.returnDateTime.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Aerolínea <span className="text-red-500">*</span>
              <input {...register('airline')} className={inputClass} placeholder="Ej. Aerolínea Demo" />
              {errors.airline && <span className={errorClass}>{errors.airline.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Clave vuelo salida <span className="text-red-500">*</span>
              <input {...register('outboundFlightNumber')} className={inputClass} placeholder="Ej. MT 4821" />
              {errors.outboundFlightNumber && <span className={errorClass}>{errors.outboundFlightNumber.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Clave vuelo regreso {tripType === 'round' && <span className="text-red-500">*</span>}
              <input {...register('returnFlightNumber')} disabled={returnDisabled} className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`} placeholder="Ej. MT 4822" />
              {errors.returnFlightNumber && <span className={errorClass}>{errors.returnFlightNumber.message}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Operadora
              <select {...register('operator')} className={inputClass}>
                <option value="">Sin operadora</option>
                {hotelOperators.map((operator) => <option key={operator}>{operator}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Clave operadora
              <input {...register('operatorCode')} className={inputClass} placeholder="Ej. OP-4821" />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Comentarios
              <textarea {...register('comments')} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Información adicional del vuelo" />
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
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Agregar Vuelo</button>
          </div>
        </form>
    </ModalShell>
  )
}
