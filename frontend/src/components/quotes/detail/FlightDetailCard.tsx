import type { FlightService } from '../../../types/quote'
import { formatLocalDateTime } from '../../../utils/date'
import { ServiceCardShell, ServiceField } from './ServiceCardShell'

export function FlightDetailCard({ service }: { service: FlightService }) {
  return <ServiceCardShell label="Vuelo" title={`${service.origin} → ${service.destination}`} netPrice={service.netPrice} publicPrice={service.publicPrice}>
    <ServiceField label="Modalidad" value={service.tripType === 'round' ? 'Redondo' : 'Sencillo'} /><ServiceField label="Aerolínea" value={service.airline} />
    <ServiceField label="Salida" value={formatLocalDateTime(service.departureDateTime)} /><ServiceField label="Clave de salida" value={service.outboundFlightNumber} />
    <ServiceField label="Regreso" value={service.returnDateTime ? formatLocalDateTime(service.returnDateTime) : ''} /><ServiceField label="Clave de regreso" value={service.returnFlightNumber ?? ''} />
    <ServiceField label="Operadora" value={service.operator} /><ServiceField label="Clave operadora" value={service.operatorCode} />
    <ServiceField label="Comentarios" value={service.comments} full />
  </ServiceCardShell>
}
