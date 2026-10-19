import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ClientModal } from '../components/clients/ClientModal'
import { FlightServiceModal } from '../components/quotes/FlightServiceModal'
import { HotelServiceModal } from '../components/quotes/HotelServiceModal'
import { QuoteSetupPanel } from '../components/quotes/QuoteSetupPanel'
import { QuoteSummary } from '../components/quotes/QuoteSummary'
import { ServiceSelector } from '../components/quotes/ServiceSelector'
import { TourServiceModal } from '../components/quotes/TourServiceModal'
import { TransportServiceModal } from '../components/quotes/TransportServiceModal'
import { clientsApi } from '../services/clientsApi'
import { flightsApi } from '../services/flightsApi'
import { hotelsApi } from '../services/hotelsApi'
import { mapClient } from '../services/mappers'
import { passengersApi } from '../services/passengersApi'
import { quotesApi } from '../services/quotesApi'
import { toursApi } from '../services/toursApi'
import { transportsApi } from '../services/transportsApi'
import type { Client } from '../types/client'
import type { Passenger, QuoteGeneralInfoErrors, QuoteGeneralInfoValue, QuoteService, ServiceType } from '../types/quote'

const emptyInfo: QuoteGeneralInfoValue = { branch: '', paymentLimitDate: '', internalComment: '', holder: '', departureDate: '', returnDate: '' }
const nullable = (value: string) => value.trim() || null
const datePart = (value?: string) => value?.slice(0, 10) ?? ''

function deriveTravelDates(services: QuoteService[]) {
  const ranges = services.flatMap((service) => {
    if (service.type === 'hotel') return [{ start: service.checkIn, end: service.checkOut }]
    if (service.type === 'tour') return [{ start: datePart(service.startDateTime), end: datePart(service.startDateTime) }]
    return [{ start: datePart(service.departureDateTime), end: datePart(service.returnDateTime) || datePart(service.departureDateTime) }]
  }).filter((range) => range.start && range.end)

  return {
    departureDate: ranges.map((range) => range.start).sort()[0] ?? '',
    returnDate: ranges.map((range) => range.end).sort().at(-1) ?? '',
  }
}

async function saveService(quoteId: string, service: QuoteService) {
  if (service.type === 'hotel') return hotelsApi.create(quoteId, { purchase_method: service.purchaseMethod, hotel_name: service.hotelName, check_in: service.checkIn, check_out: service.checkOut, plan: service.plan, rooms: service.rooms, operator: nullable(service.operator), reservation_code: nullable(service.reservationCode), cancellation_date: nullable(service.cancellationDate), comments: nullable(service.comments), net_price: service.netPrice, public_price: service.publicPrice })
  if (service.type === 'tour') return toursApi.create(quoteId, { purchase_method: service.purchaseMethod, name: service.name, start_datetime: service.startDateTime, cancellation_date: nullable(service.cancellationDate), operator: nullable(service.operator), operator_code: nullable(service.operatorCode), comments: nullable(service.comments), net_price: service.netPrice, public_price: service.publicPrice })
  if (service.type === 'transport') return transportsApi.create(quoteId, { purchase_method: service.purchaseMethod, transport_type: service.transportType, trip_type: service.tripType, origin: service.origin, destination: service.destination, departure_datetime: service.departureDateTime, return_datetime: service.returnDateTime ?? null, operator: nullable(service.operator), operator_code: nullable(service.operatorCode), cancellation_date: nullable(service.cancellationDate), comments: nullable(service.comments), net_price: service.netPrice, public_price: service.publicPrice })
  return flightsApi.create(quoteId, { purchase_method: service.purchaseMethod, trip_type: service.tripType, origin: service.origin, destination: service.destination, departure_datetime: service.departureDateTime, return_datetime: service.returnDateTime ?? null, airline: service.airline, outbound_flight_number: service.outboundFlightNumber, return_flight_number: service.returnFlightNumber ?? null, operator: nullable(service.operator), operator_code: nullable(service.operatorCode), comments: nullable(service.comments), net_price: service.netPrice, public_price: service.publicPrice })
}

export function NewQuotePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const selectedFromNavigation = (location.state as { selectedClient?: string } | null)?.selectedClient ?? ''
  const [info, setInfo] = useState<QuoteGeneralInfoValue>({ ...emptyInfo, branch: user?.branch_id ?? import.meta.env.VITE_DEFAULT_BRANCH_ID ?? '' })
  const [errors, setErrors] = useState<QuoteGeneralInfoErrors>({})
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<QuoteService[]>([])
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [hotelOpen, setHotelOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [transportOpen, setTransportOpen] = useState(false)
  const [flightOpen, setFlightOpen] = useState(false)

  useEffect(() => {
    clientsApi.list({ status: 'active' }).then((items) => {
      const mapped = items.map(mapClient)
      setClients(mapped)
      if (selectedFromNavigation) {
        const selected = mapped.find((client) => client.id === selectedFromNavigation || client.fullName === selectedFromNavigation)
        if (selected) setInfo((current) => ({ ...current, holder: selected.id }))
      }
    }).catch((error: unknown) => setSaveError(error instanceof Error ? error.message : 'No fue posible cargar clientes.'))
  }, [selectedFromNavigation])

  const totals = useMemo(() => services.reduce((total, service) => ({ net: total.net + service.netPrice, public: total.public + service.publicPrice }), { net: 0, public: 0 }), [services])
  const travelDates = useMemo(() => deriveTravelDates(services), [services])

  const changeInfo = (field: keyof QuoteGeneralInfoValue, value: string) => {
    setInfo((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const createClient = async (client: Omit<Client, 'id' | 'fullName' | 'createdAt' | 'status'>) => {
    const created = mapClient(await clientsApi.create({ first_name: client.firstName, last_name: client.lastName, phone: client.phone, email: nullable(client.email), notes: nullable(client.notes ?? '') }))
    setClients((current) => [created, ...current])
    changeInfo('holder', created.id)
  }

  const save = async () => {
    const nextErrors: QuoteGeneralInfoErrors = {}
    if (!info.branch) nextErrors.branch = 'Tu usuario no tiene una sucursal asignada. Configúrala antes de crear la cotización.'
    if (!info.holder) nextErrors.holder = 'Selecciona un cliente titular.'
    if (!travelDates.departureDate) nextErrors.departureDate = 'Agrega al menos un Hotel, Tour, Vuelo o Transporte con fechas para determinar el periodo del viaje.'
    if (info.paymentLimitDate && travelDates.departureDate && info.paymentLimitDate > travelDates.departureDate) nextErrors.departureDate = 'La fecha límite de pago no puede ser posterior al inicio del viaje.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    setSaveError('')
    let quoteId = ''
    try {
      const quote = await quotesApi.create({ client_id: info.holder, branch_id: info.branch, status: 'pending', sale_date: new Date().toISOString(), payment_limit_date: info.paymentLimitDate || null, departure_date: travelDates.departureDate, return_date: travelDates.returnDate, internal_comment: nullable(info.internalComment), currency: 'MXN' })
      quoteId = quote.id
      for (const service of services) await saveService(quote.id, service)
      for (const passenger of passengers) await passengersApi.create(quote.id, { name: passenger.name, age: passenger.age, passenger_type: passenger.type })
      navigate(`/cotizaciones/${quote.id}`)
    } catch (error: unknown) {
      setSaveError(`${quoteId ? 'La cotización fue creada parcialmente. ' : ''}${error instanceof Error ? error.message : 'No fue posible guardar la cotización.'}`)
    } finally {
      setSaving(false)
    }
  }

  const addService = (service: QuoteService) => setServices((current) => [...current, service])

  return <div className="mx-auto w-full max-w-[1600px]">
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="min-w-0 space-y-4">
        <QuoteSetupPanel value={info} errors={errors} clients={clients} passengers={passengers} onChange={changeInfo} onPassengersChange={setPassengers} onNewClient={() => setClientModalOpen(true)} />
        <ServiceSelector selectedType={selectedType} onSelect={setSelectedType} onOpenHotel={() => setHotelOpen(true)} onOpenTour={() => setTourOpen(true)} onOpenTransport={() => setTransportOpen(true)} onOpenFlight={() => setFlightOpen(true)} />
      </div>
      <QuoteSummary services={services} holderName={clients.find((client) => client.id === info.holder)?.fullName} passengers={passengers} netTotal={totals.net} publicTotal={totals.public} margin={totals.public - totals.net} isSaved={false} isSaving={saving} saveError={saveError} onRemoveService={(id) => setServices((current) => current.filter((service) => service.id !== id))} onCancel={() => navigate('/cotizaciones')} onSave={() => void save()} />
    </div>

    <ClientModal open={clientModalOpen} onClose={() => setClientModalOpen(false)} onSave={createClient} />
    <HotelServiceModal open={hotelOpen} onClose={() => setHotelOpen(false)} onSave={addService} />
    <TourServiceModal open={tourOpen} onClose={() => setTourOpen(false)} onSave={addService} />
    <TransportServiceModal open={transportOpen} onClose={() => setTransportOpen(false)} onSave={addService} />
    <FlightServiceModal open={flightOpen} onClose={() => setFlightOpen(false)} onSave={addService} />
  </div>
}
