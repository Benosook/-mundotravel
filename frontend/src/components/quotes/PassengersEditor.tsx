import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { Client } from '../../types/client'
import type { Passenger } from '../../types/quote'

type Props = {
  passengers: Passenger[]
  onChange: (items: Passenger[]) => void
  title?: string
  clients?: Client[]
  embedded?: boolean
}
const empty = { name: '', age: '', type: 'adult' as const }

export function PassengersEditor({ passengers, onChange, title = 'Agregar acompañantes', clients = [], embedded = false }: Props) {
  const [draft, setDraft] = useState<{ name: string; age: string; type: 'adult' | 'minor' }>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const submit = () => {
    const name = draft.name.trim()
    const age = Number(draft.age)
    if (!name || draft.age === '' || !Number.isInteger(age) || age < 0 || age > 120) { setError('Ingresa nombre y edad válida.'); return }
    const item: Passenger = { id: editingId ?? crypto.randomUUID(), name, age, type: draft.type }
    onChange(editingId ? passengers.map((passenger) => passenger.id === editingId ? item : passenger) : [...passengers, item])
    setDraft(empty); setEditingId(null); setError('')
  }
  const edit = (passenger: Passenger) => { setDraft({ name: passenger.name, age: String(passenger.age), type: passenger.type }); setEditingId(passenger.id); setError('') }

  const content = <div className="space-y-3">
    <div><h2 className="m-0 text-sm font-semibold text-slate-800">{title}</h2><p className="mb-0 mt-1 text-xs text-slate-500">Busca un cliente existente o escribe un acompañante nuevo.</p></div>
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_6rem_8rem_auto]">
      <div><label htmlFor="passenger-name" className="sr-only">Nombre del acompañante</label><input id="passenger-name" list="passenger-clients" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Escribe para buscar pasajeros..." className="h-11 w-full rounded-lg border border-slate-200 px-3 text-base outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 sm:text-sm" /><datalist id="passenger-clients">{clients.map((client) => <option key={client.id} value={client.fullName}>{client.phone}</option>)}</datalist></div>
      <label className="sr-only" htmlFor="passenger-age">Edad</label><input id="passenger-age" type="number" min="0" max="120" value={draft.age} onChange={(event) => setDraft((current) => ({ ...current, age: event.target.value }))} placeholder="Edad" className="h-11 rounded-lg border border-slate-200 px-3 text-base outline-none focus:border-blue-500 sm:text-sm" />
      <label className="sr-only" htmlFor="passenger-type">Tipo</label><select id="passenger-type" value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as 'adult' | 'minor' }))} className="h-11 rounded-lg border border-slate-200 px-3 text-base outline-none focus:border-blue-500 sm:text-sm"><option value="adult">Adulto</option><option value="minor">Menor</option></select>
      <div className="flex gap-2"><button type="button" onClick={submit} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white md:flex-none">{editingId ? <Pencil size={15} /> : <Plus size={15} />}{editingId ? 'Actualizar' : 'Agregar'}</button>{editingId && <button type="button" aria-label="Cancelar edición" onClick={() => { setEditingId(null); setDraft(empty) }} className="grid size-11 place-items-center rounded-lg border"><X size={16} /></button>}</div>
    </div>
    {error && <p className="m-0 text-xs text-red-600">{error}</p>}
    {passengers.length > 0 && <ul className="m-0 grid grid-cols-1 gap-2 p-0 sm:grid-cols-2">{passengers.map((passenger) => <li key={passenger.id} className="flex list-none items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"><div className="min-w-0"><p className="m-0 break-words text-sm font-semibold">{passenger.name}</p><p className="m-0 text-xs text-slate-500">{passenger.age} años · {passenger.type === 'adult' ? 'Adulto' : 'Menor'}</p></div><div className="flex shrink-0 gap-1"><button type="button" aria-label={`Editar ${passenger.name}`} onClick={() => edit(passenger)} className="grid size-10 place-items-center rounded-lg text-blue-700 hover:bg-blue-50"><Pencil size={15} /></button><button type="button" aria-label={`Eliminar ${passenger.name}`} onClick={() => onChange(passengers.filter((item) => item.id !== passenger.id))} className="grid size-10 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></div></li>)}</ul>}
  </div>

  if (embedded) return content
  return <section className="rounded-xl border border-slate-200 bg-white"><div className="p-5">{content}</div></section>
}
