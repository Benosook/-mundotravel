import { clients } from '../../data/clients'
import { quoteBranches } from '../../data/quotes'
import type {
  QuoteGeneralInfoErrors,
  QuoteGeneralInfoValue,
} from '../../types/quote'

type QuoteGeneralInfoProps = {
  value: QuoteGeneralInfoValue
  errors: QuoteGeneralInfoErrors
  onChange: (field: keyof QuoteGeneralInfoValue, value: string) => void
}

const fieldClass =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function QuoteGeneralInfo({ value, errors, onChange }: QuoteGeneralInfoProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="m-0 text-base font-semibold text-slate-900">Información general</h2>
        <p className="mb-0 mt-1 text-xs text-slate-500">
          Datos principales para identificar y dar seguimiento a la cotización.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Sucursal <span className="text-red-500">*</span>
          <select
            value={value.branch}
            onChange={(event) => onChange('branch', event.target.value)}
            aria-invalid={Boolean(errors.branch)}
            className={`${fieldClass} ${errors.branch ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
          >
            <option value="">Selecciona una sucursal</option>
            {quoteBranches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          {errors.branch && <span className="mt-1 block text-xs text-red-600">{errors.branch}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Fecha límite de pago
          <input
            type="date"
            value={value.paymentLimitDate}
            onChange={(event) => onChange('paymentLimitDate', event.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Titular / Cliente <span className="text-red-500">*</span>
          <input
            type="text"
            list="temporary-clients"
            value={value.holder}
            onChange={(event) => onChange('holder', event.target.value)}
            placeholder="Busca o escribe el nombre del cliente"
            aria-invalid={Boolean(errors.holder)}
            className={`${fieldClass} ${errors.holder ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
          />
          <datalist id="temporary-clients">
            {clients.filter((client) => client.status === 'active').map((client) => (
              <option key={client.id} value={client.fullName} />
            ))}
          </datalist>
          {errors.holder && <span className="mt-1 block text-xs text-red-600">{errors.holder}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Comentario interno
          <textarea
            value={value.internalComment}
            onChange={(event) => onChange('internalComment', event.target.value)}
            placeholder="Agrega información útil para el equipo"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </label>
      </div>
    </section>
  )
}
