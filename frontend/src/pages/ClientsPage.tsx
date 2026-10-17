import { CheckCircle2, Plus, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ClientDetailModal } from '../components/clients/ClientDetailModal'
import { ClientModal } from '../components/clients/ClientModal'
import { ClientsTable } from '../components/clients/ClientsTable'
import { clients as clientMocks } from '../data/clients'
import type { Client, ClientStatus } from '../types/client'

const inputClass = 'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function ClientsPage() {
  const [clientList, setClientList] = useState<Client[]>(clientMocks)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ClientStatus | ''>('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [message, setMessage] = useState('')

  const filteredClients = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es-MX')
    return clientList.filter((client) => (!status || client.status === status) && (!term || [client.fullName, client.phone, client.email].some((value) => value.toLocaleLowerCase('es-MX').includes(term))))
  }, [clientList, search, status])
  const clearFilters = () => { setSearch(''); setStatus('') }

  return <div className="space-y-6">
    <header className="flex items-start justify-between gap-5"><div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Directorio</p><h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">Clientes</h1><p className="mb-0 mt-2 text-sm text-slate-500">Consulta y administra los clientes de +MundoTravel.</p></div><button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={17} /> Nuevo cliente</button></header>
    {message && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} />{message}</div>}
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/3"><div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)_auto]"><label className="text-xs font-semibold text-slate-600">Buscar cliente<div className="relative"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 mt-0.75 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, teléfono o email" className={`${inputClass} pl-9`} /></div></label><label className="text-xs font-semibold text-slate-600">Estado<select value={status} onChange={(event) => setStatus(event.target.value as ClientStatus | '')} className={inputClass}><option value="">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label><div className="flex items-end"><button type="button" onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw size={16} /> Limpiar filtros</button></div></div></section>
    <ClientsTable clients={filteredClients} onView={setSelectedClient} onClearFilters={clearFilters} />
    <ClientModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={(client) => { setClientList((current) => [client, ...current]); setMessage('Cliente creado correctamente.') }} />
    <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />
  </div>
}
