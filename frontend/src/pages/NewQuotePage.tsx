import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QuoteGeneralInfo } from '../components/quotes/QuoteGeneralInfo'
import { HotelServiceModal } from '../components/quotes/HotelServiceModal'
import { QuoteSummary } from '../components/quotes/QuoteSummary'
import { ServiceSelector } from '../components/quotes/ServiceSelector'
import { TourServiceModal } from '../components/quotes/TourServiceModal'
import { TransportServiceModal } from '../components/quotes/TransportServiceModal'
import { FlightServiceModal } from '../components/quotes/FlightServiceModal'
import type {
  QuoteGeneralInfoErrors,
  QuoteGeneralInfoValue,
  QuoteService,
  ServiceType,
} from '../types/quote'

const initialGeneralInfo: QuoteGeneralInfoValue = {
  branch: '',
  paymentLimitDate: '',
  internalComment: '',
  holder: '',
}

export function NewQuotePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedClient = (location.state as { selectedClient?: string } | null)?.selectedClient ?? ''
  const [generalInfo, setGeneralInfo] = useState(() => ({ ...initialGeneralInfo, holder: selectedClient }))
  const [errors, setErrors] = useState<QuoteGeneralInfoErrors>({})
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null)
  const [services, setServices] = useState<QuoteService[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false)
  const [isTourModalOpen, setIsTourModalOpen] = useState(false)
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false)
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false)

  const totals = useMemo(
    () =>
      services.reduce(
        (result, service) => ({
          netTotal: result.netTotal + service.netPrice,
          publicTotal: result.publicTotal + service.publicPrice,
        }),
        { netTotal: 0, publicTotal: 0 },
      ),
    [services],
  )

  const handleGeneralInfoChange = (field: keyof QuoteGeneralInfoValue, value: string) => {
    setGeneralInfo((current) => ({ ...current, [field]: value }))
    setIsSaved(false)

    if (field === 'branch' || field === 'holder') {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const handleSave = () => {
    const nextErrors: QuoteGeneralInfoErrors = {}

    if (!generalInfo.branch) nextErrors.branch = 'Selecciona una sucursal.'
    if (!generalInfo.holder.trim()) nextErrors.holder = 'Ingresa el titular de la cotización.'

    setErrors(nextErrors)
    setIsSaved(Object.keys(nextErrors).length === 0)
  }

  const handleAddService = (service: QuoteService) => {
    setServices((current) => [...current, service])
    setIsSaved(false)
  }

  return (
    <div>
      <header className="mb-7">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Cotizaciones</p>
        <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">Nueva cotización</h1>
        <p className="mb-0 mt-2 text-sm text-slate-500">Crea y arma una cotización para tu cliente.</p>
      </header>

      {Object.keys(errors).length > 0 && (
        <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Revisa los campos obligatorios antes de guardar la cotización.
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-6">
          <QuoteGeneralInfo value={generalInfo} errors={errors} onChange={handleGeneralInfoChange} />
          <ServiceSelector
            selectedType={selectedType}
            onSelect={(type) => {
              setSelectedType(type)
              setIsSaved(false)
            }}
            onOpenHotel={() => setIsHotelModalOpen(true)}
            onOpenTour={() => setIsTourModalOpen(true)}
            onOpenTransport={() => setIsTransportModalOpen(true)}
            onOpenFlight={() => setIsFlightModalOpen(true)}
          />
        </div>

        <QuoteSummary
          services={services}
          netTotal={totals.netTotal}
          publicTotal={totals.publicTotal}
          margin={totals.publicTotal - totals.netTotal}
          isSaved={isSaved}
          onRemoveService={(id) => {
            setServices((current) => current.filter((service) => service.id !== id))
            setIsSaved(false)
          }}
          onCancel={() => navigate('/cotizaciones')}
          onSave={handleSave}
        />
      </div>

      <HotelServiceModal
        open={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
        onSave={handleAddService}
      />
      <TourServiceModal
        open={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onSave={handleAddService}
      />
      <TransportServiceModal
        open={isTransportModalOpen}
        onClose={() => setIsTransportModalOpen(false)}
        onSave={handleAddService}
      />
      <FlightServiceModal
        open={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
        onSave={handleAddService}
      />
    </div>
  )
}
