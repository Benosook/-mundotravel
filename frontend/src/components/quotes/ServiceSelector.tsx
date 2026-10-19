import { CirclePlus } from 'lucide-react'
import circuitImage from '../../assets/service-categories/circuit.jpg'
import cruiseImage from '../../assets/service-categories/cruise.jpg'
import extrasImage from '../../assets/service-categories/extras.jpg'
import flightImage from '../../assets/service-categories/flight.jpg'
import hotelImage from '../../assets/service-categories/hotel.jpg'
import tourImage from '../../assets/service-categories/tour.jpg'
import transportImage from '../../assets/service-categories/transport.jpg'
import type { ServiceType } from '../../types/quote'

type ServiceSelectorProps = {
  selectedType: ServiceType | null
  onSelect: (type: ServiceType) => void
  onOpenHotel: () => void
  onOpenTour: () => void
  onOpenTransport: () => void
  onOpenFlight: () => void
}

type ServiceOption = { type: ServiceType; name: string; image: string; available: boolean }

const serviceOptions: ServiceOption[] = [
  { type: 'hotel', name: 'Hotel', image: hotelImage, available: true },
  { type: 'tour', name: 'Tour', image: tourImage, available: true },
  { type: 'flight', name: 'Vuelo', image: flightImage, available: true },
  { type: 'transport', name: 'Transporte', image: transportImage, available: true },
  { type: 'cruise', name: 'Crucero', image: cruiseImage, available: false },
  { type: 'circuit', name: 'Circuito', image: circuitImage, available: false },
  { type: 'extras', name: 'Extras', image: extrasImage, available: false },
]

export function ServiceSelector({ selectedType, onSelect, onOpenHotel, onOpenTour, onOpenTransport, onOpenFlight }: ServiceSelectorProps) {
  const selectedOption = serviceOptions.find((option) => option.type === selectedType)
  const openForm = (type: ServiceType) => {
    if (type === 'hotel') onOpenHotel()
    if (type === 'tour') onOpenTour()
    if (type === 'transport') onOpenTransport()
    if (type === 'flight') onOpenFlight()
  }

  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
    <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
      <h2 className="m-0 text-sm font-bold text-slate-900">Agregar servicios</h2>
      <p className="mb-0 mt-1 text-xs text-slate-500">Selecciona una categoría para agregarla al paquete.</p>
    </div>
    <div className="p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {serviceOptions.map((option) => {
          const isSelected = selectedType === option.type
          return <button key={option.type} type="button" onClick={() => { onSelect(option.type); if (option.available) openForm(option.type) }} aria-pressed={isSelected} aria-label={`${option.name}${option.available ? '' : ', próximamente'}`} className={`group relative aspect-[4/3] min-h-24 overflow-hidden rounded-xl border text-left transition focus:outline-none focus:ring-3 focus:ring-blue-200 ${isSelected ? 'border-blue-500 ring-3 ring-blue-100' : 'border-slate-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md'}`}>
            <img src={option.image} alt="" className={`absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105 ${option.available ? '' : 'grayscale-[35%]'}`} />
            <span className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/10 to-transparent" />
            {!option.available ? <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">Próximamente</span> : null}
            <span className="absolute bottom-0 left-0 right-0 px-3 py-2.5 text-sm font-bold text-white">{option.name}</span>
          </button>
        })}
      </div>
      {selectedOption ? <div className="mt-4 flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-sm text-blue-950"><span className="font-semibold">{selectedOption.name}</span>{selectedOption.available ? ': completa los datos en el formulario.' : ': esta categoría estará disponible próximamente.'}</p>
        {selectedOption.available ? <button type="button" onClick={() => openForm(selectedOption.type)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"><CirclePlus size={17} aria-hidden="true" /> Abrir formulario</button> : null}
      </div> : null}
    </div>
  </section>
}
