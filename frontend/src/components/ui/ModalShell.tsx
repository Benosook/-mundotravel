import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

type ModalShellProps = {
  open: boolean
  title: string
  titleId: string
  onClose: () => void
  children: ReactNode
  closeDisabled?: boolean
  maxWidthClass?: string
  eyebrow?: string
}

export function ModalShell({
  open,
  title,
  titleId,
  onClose,
  children,
  closeDisabled = false,
  maxWidthClass = 'max-w-3xl',
  eyebrow = 'Servicio',
}: ModalShellProps) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabled) onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeDisabled, onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ${maxWidthClass}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">{eyebrow}</p>
            <h2 id={titleId} className="m-0 text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label={`Cerrar ${title}`}
            className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
