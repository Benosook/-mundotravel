import type { TourService } from '../../../types/quote'
import { formatLocalDateTime } from '../../../utils/date'
import { ServiceCardShell, ServiceField } from './ServiceCardShell'

export function TourDetailCard({ service }: { service: TourService }) {
  return <ServiceCardShell label="Tour" title={service.name} netPrice={service.netPrice} publicPrice={service.publicPrice}>
    <ServiceField label="Fecha y hora" value={formatLocalDateTime(service.startDateTime)} /><ServiceField label="Operadora" value={service.operator} />
    <ServiceField label="Clave" value={service.operatorCode} /><ServiceField label="Comentarios" value={service.comments} full />
  </ServiceCardShell>
}
