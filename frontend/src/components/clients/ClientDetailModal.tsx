import type { Client } from '../../types/client'
import { formatDate } from '../../utils/date'
import { ModalShell } from '../ui/ModalShell'

export function ClientDetailModal({ client, onClose }: { client: Client | null; onClose: () => void }) {
  if (!client) return null
  const fields = [['Teléfono', client.phone], ['Email', client.email || 'No registrado'], ['Fecha de alta', formatDate(client.createdAt)], ['Estado', client.status === 'active' ? 'Activo' : 'Inactivo']]
  return <ModalShell open title="Detalle del cliente" titleId="client-detail-title" onClose={onClose} eyebrow="Clientes" maxWidthClass="max-w-xl">
    <div className="overflow-y-auto p-6"><h3 className="m-0 text-xl font-bold text-slate-900">{client.fullName}</h3><dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="m-0 mt-1 text-sm font-medium text-slate-800">{value}</dd></div>)}</dl>{client.notes && <div className="mt-5"><p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Notas</p><p className="mb-0 mt-2 text-sm leading-6 text-slate-600">{client.notes}</p></div>}</div>
    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" onClick={onClose} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Cerrar</button></div>
  </ModalShell>
}
