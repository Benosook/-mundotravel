import type { LucideIcon } from 'lucide-react'

type PagePlaceholderProps = {
  title: string
  description: string
  icon: LucideIcon
}

export function PagePlaceholder({ title, description, icon: Icon }: PagePlaceholderProps) {
  return (
    <section aria-labelledby="page-title">
      <div className="mb-7">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
          +MundoTravel
        </p>
        <h1 id="page-title" className="m-0 text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/3">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={23} aria-hidden="true" />
          </div>
          <h2 className="m-0 text-base font-semibold text-slate-800">Módulo preparado</h2>
          <p className="mb-0 mt-2 text-sm leading-6 text-slate-500">
            La funcionalidad de esta sección se incorporará en una fase posterior del proyecto.
          </p>
        </div>
      </div>
    </section>
  )
}
