import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Client } from '../../types/client'
import { ModalShell } from '../ui/ModalShell'

const schema = z.object({
  firstName: z.string().trim().min(1, 'Ingresa el nombre.'),
  lastName: z.string().trim().min(1, 'Ingresa el apellido.'),
  phone: z.string().trim().min(7, 'Ingresa un teléfono válido.').regex(/^[0-9+()\-\s]+$/, 'Usa solamente números y símbolos telefónicos.'),
  email: z.string().trim().refine((value) => !value || z.email().safeParse(value).success, 'Ingresa un correo válido.'),
  notes: z.string().trim(),
})

type FormData = z.infer<typeof schema>
type Props = { open: boolean; onClose: () => void; onSave: (client: Client) => void }
const defaults: FormData = { firstName: '', lastName: '', phone: '', email: '', notes: '' }
const fieldClass = 'mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100'

export function ClientModal({ open, onClose, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults })
  const close = () => { if (!isSubmitting) { reset(defaults); onClose() } }
  const submit = (data: FormData) => {
    onSave({ id: crypto.randomUUID(), ...data, fullName: `${data.firstName} ${data.lastName}`, createdAt: new Date().toISOString().slice(0, 10), status: 'active' })
    reset(defaults); onClose()
  }
  const error = (message?: string) => message && <span className="mt-1 block text-xs text-red-600">{message}</span>
  return <ModalShell open={open} onClose={close} closeDisabled={isSubmitting} title="Nuevo cliente" titleId="client-modal-title" eyebrow="Clientes" maxWidthClass="max-w-2xl">
    <form onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col"><div className="grid grid-cols-1 gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">Nombre <span className="text-red-500">*</span><input {...register('firstName')} className={fieldClass} />{error(errors.firstName?.message)}</label>
      <label className="text-sm font-medium text-slate-700">Apellido <span className="text-red-500">*</span><input {...register('lastName')} className={fieldClass} />{error(errors.lastName?.message)}</label>
      <label className="text-sm font-medium text-slate-700">Teléfono <span className="text-red-500">*</span><input type="tel" {...register('phone')} className={fieldClass} placeholder="55 1234 5678" />{error(errors.phone?.message)}</label>
      <label className="text-sm font-medium text-slate-700">Email<input type="email" {...register('email')} className={fieldClass} placeholder="cliente@ejemplo.com" />{error(errors.email?.message)}</label>
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">Notas<textarea {...register('notes')} rows={4} className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" /></label>
    </div><div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" onClick={close} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button><button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Guardar cliente</button></div></form>
  </ModalShell>
}
