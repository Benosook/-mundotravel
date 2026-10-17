import {
  BusFront,
  CirclePlus,
  Hotel,
  MapPinned,
  Plane,
  Route,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceType } from '../../types/quote'

type ServiceSelectorProps = {
  selectedType: ServiceType | null
  onSelect: (type: ServiceType) => void
  onOpenHotel: () => void
  onOpenTour: () => void
  onOpenTransport: () => void
  onOpenFlight: () => void
}

type ServiceOption = {
  type: ServiceType
  name: string
  description: string
  icon: LucideIcon
  available: boolean
}

const serviceOptions: ServiceOption[] = [
  { type: 'hotel', name: 'Hotel', description: 'Hospedaje y habitaciones', icon: Hotel, available: true },
  { type: 'tour', name: 'Tour', description: 'Actividades y experiencias', icon: MapPinned, available: true },
  { type: 'flight', name: 'Vuelo', description: 'Traslados aéreos', icon: Plane, available: true },
  { type: 'transport', name: 'Transporte', description: 'Traslados terrestres', icon: BusFront, available: true },
  { type: 'circuit', name: 'Circuito', description: 'Disponible próximamente', icon: Route, available: false },
]

export function ServiceSelector({ selectedType, onSelect, onOpenHotel, onOpenTour, onOpenTransport, onOpenFlight }: ServiceSelectorProps) {
  const selectedOption = serviceOptions.find((option) => option.type === selectedType)

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="m-0 text-base font-semibold text-slate-900">Agregar servicios</h2>
        <p className="mb-0 mt-1 text-xs text-slate-500">
          Selecciona el tipo de servicio que formará parte del paquete.
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {serviceOptions.map(({ type, name, description, icon: Icon, available }) => {
            const isSelected = selectedType === type

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onSelect(type)
                  if (type === 'hotel') onOpenHotel()
                  if (type === 'tour') onOpenTour()
                  if (type === 'transport') onOpenTransport()
                  if (type === 'flight') onOpenFlight()
                }}
                aria-pressed={isSelected}
                className={`min-h-29 rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-3 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                } ${available ? '' : 'opacity-70'}`}
              >
                <Icon size={21} className={isSelected ? 'text-blue-600' : 'text-slate-500'} aria-hidden="true" />
                <span className="mt-3 block text-sm font-semibold text-slate-800">{name}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
              </button>
            )
          })}
        </div>

        {selectedOption && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 text-sm text-blue-900">
              <span className="font-semibold">{selectedOption.name} seleccionado</span>
              {' — '}
              {selectedOption.available
                ? 'completa los datos en el formulario.'
                : 'esta opción todavía no está disponible.'}
            </p>
            {selectedOption.available && (
              <button
                type="button"
                onClick={
                  selectedOption.type === 'hotel'
                    ? onOpenHotel
                    : selectedOption.type === 'tour'
                      ? onOpenTour
                      : selectedOption.type === 'transport'
                        ? onOpenTransport
                        : onOpenFlight
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <CirclePlus size={17} aria-hidden="true" />
                {selectedOption.type === 'hotel'
                  ? 'Abrir formulario de Hotel'
                  : selectedOption.type === 'tour'
                    ? 'Abrir formulario de Tour'
                    : selectedOption.type === 'transport'
                      ? 'Abrir formulario de Transporte'
                      : 'Abrir formulario de Vuelo'}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
