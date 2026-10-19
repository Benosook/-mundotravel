import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Client } from '../../types/client'
import type { Passenger, QuoteGeneralInfoErrors, QuoteGeneralInfoValue } from '../../types/quote'
import { PassengersEditor } from './PassengersEditor'

type Props = {
  value: QuoteGeneralInfoValue
  errors: QuoteGeneralInfoErrors
  clients: Client[]
  passengers: Passenger[]
  onChange: (field: keyof QuoteGeneralInfoValue, value: string) => void
  onPassengersChange: (passengers: Passenger[]) => void
  onNewClient: () => void
}

const fieldClass = 'mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 sm:text-sm'

export function QuoteSetupPanel({ value, errors, clients, passengers, onChange, onPassengersChange, onNewClient }: Props) {
  const activeClients = clients.filter((client) => client.status === 'active')
  const selectedClient = activeClients.find((client) => client.id === value.holder)
  const [holderQuery, setHolderQuery] = useState(selectedClient?.fullName ?? '')

  useEffect(() => {
    setHolderQuery(selectedClient?.fullName ?? '')
  }, [selectedClient])

  const selectClient = (name: string) => {
    setHolderQuery(name)
    const match = activeClients.find((client) => client.fullName.toLocaleLowerCase('es-MX') === name.trim().toLocaleLowerCase('es-MX'))
    onChange('holder', match?.id ?? '')
  }

  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
    <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
      <h1 className="m-0 text-lg font-bold text-slate-900">Nueva cotización</h1>
      <p className="mb-0 mt-1 text-xs text-slate-500">Prepara la información del cliente y los datos operativos del paquete.</p>
    </div>

    <div className="space-y-5 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(13rem,.7fr)_minmax(0,1.3fr)]">
        <label className="text-xs font-semibold text-slate-600">Fecha límite de pago
          <input type="date" value={value.paymentLimitDate} onChange={(event) => onChange('paymentLimitDate', event.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold text-slate-600">Comentario interno
          <input value={value.internalComment} onChange={(event) => onChange('internalComment', event.target.value)} placeholder="Agrega información útil para el equipo" className={fieldClass} />
        </label>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <label htmlFor="quote-holder" className="text-xs font-semibold text-slate-600">Titular / Cliente <span className="text-red-500">*</span></label>
        <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="quote-holder" list="quote-clients" value={holderQuery} onChange={(event) => selectClient(event.target.value)} placeholder="Escribe para buscar un titular..." className={`${fieldClass} mt-0 pl-9 ${errors.holder ? 'border-red-400' : ''}`} />
            <datalist id="quote-clients">{activeClients.map((client) => <option key={client.id} value={client.fullName}>{client.phone} · {client.email ?? 'Sin email'}</option>)}</datalist>
          </div>
          <button type="button" onClick={onNewClient} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"><Plus size={17} /> Cliente</button>
        </div>
        {selectedClient && <p className="mb-0 mt-2 text-xs font-medium text-emerald-700">Seleccionado: {selectedClient.fullName}</p>}
        {errors.holder && <p className="mb-0 mt-1 text-xs text-red-600">{errors.holder}</p>}
      </div>

      <div className="border-t border-slate-100 pt-5">
        <PassengersEditor embedded clients={activeClients} passengers={passengers} onChange={onPassengersChange} />
      </div>

      {errors.branch || errors.departureDate ? <div className="space-y-2">
        {errors.branch ? <p className="mb-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.branch}</p> : null}
        {errors.departureDate ? <p className="mb-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{errors.departureDate}</p> : null}
      </div> : null}
    </div>
  </section>
}
