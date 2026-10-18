import { CheckCircle2, Plus, RotateCcw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ClientDetailModal } from '../components/clients/ClientDetailModal'
import { ClientModal } from '../components/clients/ClientModal'
import { ClientsTable } from '../components/clients/ClientsTable'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { clientsApi } from '../services/clientsApi'
import { mapClient } from '../services/mappers'
import type { Client, ClientStatus } from '../types/client'

const inputClass = 'mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ClientStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)
  const [message, setMessage] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { setClients((await clientsApi.list({ search: search || undefined, status: status || undefined })).map(mapClient)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar clientes.') } finally { setLoading(false) } }, [search, status])
  useEffect(() => { const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer) }, [load])
  const clear = () => { setSearch(''); setStatus('') }

  return <div className="space-y-6">
    <header className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5"><div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Directorio</p><h1 className="m-0 text-2xl font-bold text-slate-900">Clientes</h1><p className="mb-0 mt-2 text-sm text-slate-500">Consulta y administra los clientes de +MundoTravel.</p></div><button onClick={() => setCreateOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Plus size={17} /> Nuevo cliente</button></header>
    {message && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 size={17} className="shrink-0" /><span className="break-words">{message}</span></div>}
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_auto]"><label className="text-xs font-semibold text-slate-600">Buscar cliente<div className="relative"><Search size={17} className="absolute left-3 top-1/2 mt-0.75 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClass} pl-9`} placeholder="Nombre, teléfono o email" /></div></label><label className="text-xs font-semibold text-slate-600">Estado<select value={status} onChange={(event) => setStatus(event.target.value as ClientStatus | '')} className={inputClass}><option value="">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label><div className="flex items-end"><button onClick={clear} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold md:w-auto"><RotateCcw size={16} /> Limpiar filtros</button></div></div></section>
    {loading ? <LoadingState label="Cargando clientes…" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : <ClientsTable clients={clients} onView={setSelected} onClearFilters={clear} />}
    <ClientModal open={isCreateOpen} onClose={() => setCreateOpen(false)} onSave={async (input) => { const saved = mapClient(await clientsApi.create({ first_name: input.firstName, last_name: input.lastName, phone: input.phone, email: input.email || null, notes: input.notes || null })); setClients((current) => [saved, ...current]); setMessage('Cliente creado correctamente.') }} />
    <ClientDetailModal client={selected} onClose={() => setSelected(null)} />
  </div>
}
