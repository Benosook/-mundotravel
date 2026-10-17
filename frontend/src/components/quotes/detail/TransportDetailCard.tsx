import type { TransportService } from '../../../types/quote'
import { formatLocalDateTime } from '../../../utils/date'
import { ServiceCardShell, ServiceField } from './ServiceCardShell'

export function TransportDetailCard({ service }: { service: TransportService }) {
  return <ServiceCardShell label="Transporte" title={service.transportType} netPrice={service.netPrice} publicPrice={service.publicPrice}>
    <ServiceField label="Modalidad" value={service.tripType === 'round' ? 'Redondo' : 'Sencillo'} /><ServiceField label="Ruta" value={`${service.origin} → ${service.destination}`} />
    <ServiceField label="Salida" value={formatLocalDateTime(service.departureDateTime)} /><ServiceField label="Regreso" value={service.returnDateTime ? formatLocalDateTime(service.returnDateTime) : ''} />
    <ServiceField label="Operadora" value={service.operator} /><ServiceField label="Clave" value={service.operatorCode} />
    <ServiceField label="Comentarios" value={service.comments} full />
  </ServiceCardShell>
}
