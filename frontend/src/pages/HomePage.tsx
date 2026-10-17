import { PendingDocuments } from '../components/dashboard/PendingDocuments'
import { QuickActions } from '../components/dashboard/QuickActions'
import { UpcomingPaymentsTable } from '../components/dashboard/UpcomingPaymentsTable'

export function HomePage() {
  return (
    <div className="space-y-7">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
          Panel de operación
        </p>
        <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">Buen día, Frida</h1>
        <p className="mb-0 mt-2 text-sm text-slate-500">
          Aquí tienes un resumen de la operación de hoy.
        </p>
      </header>

      <PendingDocuments />
      <UpcomingPaymentsTable />
      <QuickActions />
    </div>
  )
}
