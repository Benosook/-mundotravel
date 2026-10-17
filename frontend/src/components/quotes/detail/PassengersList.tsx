import type { Passenger } from '../../../types/quote'

export function PassengersList({ passengers }: { passengers: Passenger[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="m-0 text-base font-semibold text-slate-900">Pasajeros</h2><span className="text-xs text-slate-500">{passengers.length} registrados</span></div>
      <ul className="m-0 divide-y divide-slate-100 p-0">
        {passengers.map((passenger) => <li key={passenger.id} className="flex list-none items-center justify-between gap-4 px-5 py-3.5"><div><p className="m-0 text-sm font-semibold text-slate-800">{passenger.name}</p><p className="mb-0 mt-0.5 text-xs text-slate-500">{passenger.age} años</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${passenger.type === 'adult' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>{passenger.type === 'adult' ? 'Adulto' : 'Menor'}</span></li>)}
      </ul>
    </section>
  )
}
