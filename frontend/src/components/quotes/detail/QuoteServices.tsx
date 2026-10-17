import type { QuoteService } from '../../../types/quote'
import { FlightDetailCard } from './FlightDetailCard'
import { HotelDetailCard } from './HotelDetailCard'
import { TourDetailCard } from './TourDetailCard'
import { TransportDetailCard } from './TransportDetailCard'

const order: QuoteService['type'][] = ['flight', 'hotel', 'transport', 'tour']

export function QuoteServices({ services }: { services: QuoteService[] }) {
  const ordered = [...services].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
  return (
    <section aria-labelledby="services-title">
      <div className="mb-3 flex items-center justify-between"><h2 id="services-title" className="m-0 text-lg font-semibold text-slate-900">Servicios del viaje</h2><span className="text-xs text-slate-500">{services.length} servicios</span></div>
      <div className="space-y-4">{ordered.map((service) => {
        switch (service.type) {
          case 'flight': return <FlightDetailCard key={service.id} service={service} />
          case 'hotel': return <HotelDetailCard key={service.id} service={service} />
          case 'transport': return <TransportDetailCard key={service.id} service={service} />
          case 'tour': return <TourDetailCard key={service.id} service={service} />
        }
      })}</div>
    </section>
  )
}
