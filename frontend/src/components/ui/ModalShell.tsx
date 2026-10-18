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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-2 sm:p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl ${maxWidthClass}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">{eyebrow}</p>
            <h2 id={titleId} className="m-0 break-words text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label={`Cerrar ${title}`}
            className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:size-10"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
