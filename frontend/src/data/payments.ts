import type { Payment } from '../types/quote'

export const payments: Payment[] = [
  { id: 'payment-001', quoteId: 'quote-001', date: '2026-10-10', userName: 'Frida', paymentType: 'transfer', currency: 'MXN', amount: 10000, status: 'confirmed', comment: 'Primer anticipo' },
  { id: 'payment-002', quoteId: 'quote-001', date: '2026-10-12', userName: 'Frida', paymentType: 'card', currency: 'MXN', amount: 5000, status: 'confirmed', comment: 'Segundo abono' },
  { id: 'payment-003', quoteId: 'quote-001', date: '2026-10-13', userName: 'Frida', paymentType: 'transfer', currency: 'MXN', amount: 2500, status: 'pending', comment: 'Transferencia por confirmar' },
  { id: 'payment-004', quoteId: 'quote-001', date: '2026-10-09', userName: 'Daniel', paymentType: 'cash', currency: 'MXN', amount: 1000, status: 'cancelled', comment: 'Registro cancelado' },
  { id: 'payment-005', quoteId: 'quote-002', date: '2026-10-11', userName: 'Frida', paymentType: 'transfer', currency: 'MXN', amount: 50000, status: 'confirmed', comment: 'Anticipo principal' },
  { id: 'payment-006', quoteId: 'quote-002', date: '2026-10-14', userName: 'Frida', paymentType: 'card', currency: 'MXN', amount: 28400, status: 'confirmed', comment: 'Liquidación' },
  { id: 'payment-007', quoteId: 'quote-004', date: '2026-10-10', userName: 'Sofía', paymentType: 'transfer', currency: 'MXN', amount: 20000, status: 'confirmed', comment: 'Primer anticipo' },
  { id: 'payment-008', quoteId: 'quote-004', date: '2026-10-12', userName: 'Sofía', paymentType: 'card', currency: 'MXN', amount: 5000, status: 'pending', comment: 'Validando operación' },
  { id: 'payment-009', quoteId: 'quote-005', date: '2026-10-12', userName: 'Frida', paymentType: 'transfer', currency: 'MXN', amount: 20000, status: 'pending', comment: 'Pendiente de confirmación' },
  { id: 'payment-010', quoteId: 'quote-005', date: '2026-10-13', userName: 'Frida', paymentType: 'other', currency: 'MXN', amount: 1500, status: 'cancelled', comment: 'Captura incorrecta' },
]
