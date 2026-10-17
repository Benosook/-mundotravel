import {
  CalendarClock,
  CircleDollarSign,
  FileCheck2,
  Files,
  type LucideIcon,
} from 'lucide-react'
import { pendingDocuments } from '../../data/dashboard'
import type { PendingDocumentTone } from '../../types/dashboard'

const icons: Record<(typeof pendingDocuments)[number]['icon'], LucideIcon> = {
  documents: Files,
  payments: CircleDollarSign,
  policies: FileCheck2,
  itineraries: CalendarClock,
}

const toneStyles: Record<PendingDocumentTone, { icon: string; dot: string; status: string }> = {
  danger: { icon: 'bg-red-50 text-red-600', dot: 'bg-red-500', status: 'Requiere atención' },
  warning: { icon: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500', status: 'Por revisar' },
  info: { icon: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500', status: 'En seguimiento' },
  success: { icon: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500', status: 'Programados' },
}

export function PendingDocuments() {
  return (
    <section aria-labelledby="pending-documents-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="pending-documents-title" className="m-0 text-base font-semibold text-slate-900">
          Documentos pendientes
        </h2>
        <span className="text-xs font-medium text-slate-400">Actualizado hoy</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pendingDocuments.map((item) => {
          const Icon = icons[item.icon]
          const tone = toneStyles[item.tone]

          return (
            <article
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/3"
            >
              <div className={`grid size-11 shrink-0 place-items-center rounded-lg ${tone.icon}`}>
                <Icon size={21} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold leading-none text-slate-900">{item.count}</span>
                  <span className="truncate text-sm font-medium text-slate-700">
                    {item.label.replace(' pendientes', '')}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`size-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
                  {tone.status}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
