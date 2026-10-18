import { ReceiptText, Trash2 } from 'lucide-react'
import type { Passenger, QuoteService } from '../../types/quote'
import { formatCurrency } from '../../utils/currency'
import { formatLocalDateTime } from '../../utils/date'

type QuoteSummaryProps = {
  services: QuoteService[]
  netTotal: number
  publicTotal: number
  margin: number
  isSaved: boolean
  onRemoveService: (id: string) => void
  onCancel: () => void
  onSave: () => void
  isSaving?: boolean
  saveError?: string
  holderName?: string
  passengers?: Passenger[]
}

const typeLabels: Record<QuoteService['type'], string> = {
  hotel: 'Hotel',
  tour: 'Tour',
  flight: 'Vuelo',
  transport: 'Transporte',
}

function getServiceName(service: QuoteService) {
  if (service.type === 'hotel') return service.hotelName
  if (service.type === 'transport') return service.transportType
  if (service.type === 'flight') return `${service.origin} → ${service.destination}`
  return service.name
}

export function QuoteSummary({
  services,
  netTotal,
  publicTotal,
  margin,
  isSaved,
  onRemoveService,
  onCancel,
  onSave,
  isSaving = false,
  saveError,
  holderName,
  passengers = [],
}: QuoteSummaryProps) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3 xl:sticky xl:top-25">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="m-0 text-base font-semibold text-slate-900">Resumen de cotización</h2>
        <p className="mb-0 mt-1 text-xs text-slate-500">Totales provisionales del paquete.</p>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-lg bg-slate-50 p-3 text-sm"><span className="block text-xs font-semibold uppercase text-slate-400">Titular</span><strong className="mt-1 block text-slate-800">{holderName || 'Sin seleccionar'}</strong>{passengers.length>0&&<div className="mt-3 border-t border-slate-200 pt-3"><span className="text-xs font-semibold text-slate-500">Acompañantes ({passengers.length})</span><ul className="mb-0 mt-2 space-y-1 p-0">{passengers.map(p=><li key={p.id} className="flex list-none justify-between gap-2 text-xs text-slate-600"><span>{p.name}</span><span>{p.age} años</span></li>)}</ul></div>}</div>
        <dl className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-slate-500">Precio neto</dt>
            <dd className="m-0 font-semibold text-slate-800">{formatCurrency(netTotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-slate-500">Precio público</dt>
            <dd className="m-0 text-lg font-bold text-slate-900">{formatCurrency(publicTotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm">
            <dt className="font-medium text-emerald-700">Margen</dt>
            <dd className="m-0 font-bold text-emerald-700">{formatCurrency(margin)}</dd>
          </div>
        </dl>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="m-0 text-sm font-semibold text-slate-900">Servicios agregados</h3>
            {services.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {services.length}
              </span>
            )}
          </div>

          {services.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-7 text-center">
              <ReceiptText size={22} className="mx-auto text-slate-400" aria-hidden="true" />
              <p className="mb-0 mt-2 text-sm text-slate-500">Aún no has agregado servicios.</p>
            </div>
          ) : (
            <ul className="m-0 max-h-80 space-y-3 overflow-y-auto p-0">
              {services.map((service) => (
                <li key={service.id} className="list-none rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {typeLabels[service.type]}
                      </span>
                      <p className="mb-0 mt-1 break-words text-sm font-semibold text-slate-800">
                        {getServiceName(service)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveService(service.id)}
                      aria-label={`Eliminar ${getServiceName(service)}`}
                      className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 sm:size-9"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                  {service.type === 'hotel' && (
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p className="m-0">{service.checkIn} al {service.checkOut}</p>
                      <p className="m-0">{service.plan} · {service.rooms} {service.rooms === 1 ? 'cuarto' : 'cuartos'}</p>
                    </div>
                  )}
                  {service.type === 'tour' && (
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p className="m-0">Inicio: {formatLocalDateTime(service.startDateTime)}</p>
                      {service.operator && <p className="m-0">Operadora: {service.operator}</p>}
                    </div>
                  )}
                  {service.type === 'transport' && (
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p className="m-0">{service.origin} → {service.destination}</p>
                      <p className="m-0">
                        {service.tripType === 'round' ? 'Redondo' : 'Sencillo'} · Salida: {formatLocalDateTime(service.departureDateTime)}
                      </p>
                      {service.returnDateTime && <p className="m-0">Regreso: {formatLocalDateTime(service.returnDateTime)}</p>}
                      {service.operator && <p className="m-0">Operadora: {service.operator}</p>}
                    </div>
                  )}
                  {service.type === 'flight' && (
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p className="m-0">{service.tripType === 'round' ? 'Redondo' : 'Sencillo'} · {service.airline}</p>
                      <p className="m-0">Salida: {formatLocalDateTime(service.departureDateTime)} · {service.outboundFlightNumber}</p>
                      {service.returnDateTime && (
                        <p className="m-0">Regreso: {formatLocalDateTime(service.returnDateTime)}{service.returnFlightNumber ? ` · ${service.returnFlightNumber}` : ''}</p>
                      )}
                      {service.operator && <p className="m-0">Operadora: {service.operator}</p>}
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-slate-400">Neto</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(service.netPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-slate-400">Público</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(service.publicPrice)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isSaved && (
          <p role="status" className="m-0 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
            Cotización preparada correctamente
          </p>
        )}
        {saveError && <p role="alert" className="m-0 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{saveError}</p>}

        <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="min-h-11 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? 'Guardando…' : 'Guardar cotización'}
          </button>
        </div>
      </div>
    </aside>
  )
}
