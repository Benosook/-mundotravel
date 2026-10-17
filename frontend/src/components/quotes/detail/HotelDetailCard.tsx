import type { HotelService } from '../../../types/quote'
import { formatDate } from '../../../utils/date'
import { ServiceCardShell, ServiceField } from './ServiceCardShell'

export function HotelDetailCard({ service }: { service: HotelService }) {
  return <ServiceCardShell label="Hotel" title={service.hotelName} netPrice={service.netPrice} publicPrice={service.publicPrice}>
    <ServiceField label="Check-in" value={formatDate(service.checkIn)} /><ServiceField label="Check-out" value={formatDate(service.checkOut)} />
    <ServiceField label="Plan" value={service.plan} /><ServiceField label="Cuartos" value={service.rooms} />
    <ServiceField label="Operadora" value={service.operator} /><ServiceField label="Clave de reservación" value={service.reservationCode} />
    <ServiceField label="Comentarios" value={service.comments} full />
  </ServiceCardShell>
}
