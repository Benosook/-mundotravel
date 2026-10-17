import type { QuoteService } from '../../../types/quote'
import { formatDate, formatLocalDateTime } from '../../../utils/date'

type ServiceRow = { id: string; type: string; name: string; start: string; end: string; details: string }

function toRow(service: QuoteService): ServiceRow {
  if (service.type === 'flight') return { id: service.id, type: 'Vuelo', name: `${service.airline} · ${service.origin} a ${service.destination}`, start: formatLocalDateTime(service.departureDateTime), end: service.returnDateTime ? formatLocalDateTime(service.returnDateTime) : '—', details: `Modalidad ${service.tripType === 'round' ? 'redondo' : 'sencillo'}. Claves disponibles después de liquidar el paquete.` }
  if (service.type === 'hotel') return { id: service.id, type: 'Hotel', name: service.hotelName, start: formatDate(service.checkIn), end: formatDate(service.checkOut), details: `${service.plan}. ${service.rooms} habitación${service.rooms === 1 ? '' : 'es'}. Clave disponible después de liquidar el paquete.` }
  if (service.type === 'transport') return { id: service.id, type: 'Transporte', name: `${service.origin} a ${service.destination}`, start: formatLocalDateTime(service.departureDateTime), end: service.returnDateTime ? formatLocalDateTime(service.returnDateTime) : '—', details: `${service.transportType}. Modalidad ${service.tripType === 'round' ? 'redondo' : 'sencillo'}.` }
  return { id: service.id, type: 'Tour', name: service.name, start: formatLocalDateTime(service.startDateTime), end: '—', details: service.comments || 'Servicio incluido en el paquete.' }
}

export function DocumentServices({ services }: { services: QuoteService[] }) {
  const rows = services.map(toRow)
  return <section className="document-section print-block"><table className="document-services-table"><thead><tr><th>Servicio</th><th>Nombre</th><th>Fecha inicio</th><th>Fecha fin</th><th>Detalles</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.type}</td><td>{row.name}</td><td>{row.start}</td><td>{row.end}</td><td>{row.details}</td></tr>)}</tbody></table></section>
}
