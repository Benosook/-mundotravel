import { ArrowLeft, Compass, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DocumentServices } from '../components/quotes/document/DocumentServices'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { mapPayment, mapQuoteDetail } from '../services/mappers'
import { paymentsApi } from '../services/paymentsApi'
import { quotesApi } from '../services/quotesApi'
import type { Payment, QuoteDetail } from '../types/quote'
import type { PaymentStatus, PaymentType } from '../types/quote'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'

const typeLabels: Record<PaymentType, string> = { cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro' }
const statusLabels: Record<PaymentStatus, string> = { confirmed: 'Aprobado', pending: 'Pendiente', cancelled: 'Cancelado' }

export function PaymentReceiptPage() {
  const { quoteId, paymentId } = useParams()
  const [quote,setQuote]=useState<QuoteDetail|null>(null),[payment,setPayment]=useState<Payment|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
  useEffect(()=>{const load=async()=>{if(!quoteId||!paymentId){setError('Comprobante no disponible.');setLoading(false);return}try{const [quoteValue,paymentValue]=await Promise.all([quotesApi.get(quoteId),paymentsApi.get(quoteId,paymentId)]);setQuote(mapQuoteDetail(quoteValue));setPayment(mapPayment(paymentValue))}catch(reason){setError(reason instanceof Error?reason.message:'No fue posible cargar el comprobante.')}finally{setLoading(false)}};void load()},[paymentId,quoteId])
  if(loading)return <LoadingState label="Cargando comprobante…"/>
  if(error)return <ErrorState message={error}/>
  if (!payment || !quote) return <section className="rounded-xl border border-slate-200 bg-white px-8 py-20 text-center"><h1 className="m-0 text-2xl font-bold">Comprobante no disponible</h1><p className="mb-0 mt-2 text-sm text-slate-500">No encontramos información real para generar este comprobante.</p><Link to="/pagos" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><ArrowLeft size={16} /> Volver a pagos</Link></section>

  const previousPaid = (quote.payments??[]).filter((item) => item.status === 'confirmed' && (item.date < payment.date || (item.date === payment.date && item.id < payment.id))).reduce((sum, item) => sum + item.amount, 0)
  const appliedAmount = payment.status === 'confirmed' ? payment.amount : 0
  const previousBalance = Math.max(quote.publicPrice - previousPaid, 0)
  const newBalance = Math.max(previousBalance - appliedAmount, 0)

  return <div className="payment-receipt-screen -mx-8 -my-8 bg-slate-200 px-8 py-6"><div className="document-actions mx-auto mb-4 flex max-w-[210mm] justify-between"><Link to="/pagos" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16} /> Volver a pagos</Link><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><Printer size={16} /> Imprimir / Guardar PDF</button></div>
    <article className="document-page document-contract payment-receipt print-document">
      <header className="contract-header"><div className="document-brand"><div className="document-brand-mark"><Compass size={24} /></div><div><p><span>+</span>MundoTravel</p><small>Comprobante de pago</small></div></div><div className="contract-agency"><strong>+MundoTravel</strong><span>Agencia de viajes</span><span>{quote.branch}</span></div><div className="contract-meta"><strong>Abono {payment.id}</strong><span>{formatDate(payment.date)}</span><span>{quote.holderName}</span></div></header>
      <section className="contract-route"><span>Usuario: <strong>{payment.userName}</strong></span><span>Paquete: <strong>{quote.folio}</strong></span><span>Destino: <strong>{quote.destination}</strong></span></section>
      <DocumentServices services={quote.services} />
      <section className="document-section"><table className="document-services-table"><thead><tr><th>Forma de pago</th><th>Fecha</th><th>Usuario</th><th>Estado</th><th>Comentario / Monto</th></tr></thead><tbody><tr><td>{typeLabels[payment.paymentType]}</td><td>{formatDate(payment.date)}</td><td>{payment.userName}</td><td>{statusLabels[payment.status]}</td><td>{payment.comment || 'Abono registrado'} · <strong>{formatCurrency(payment.amount)} MXN</strong></td></tr></tbody></table></section>
      <section className="contract-summary"><span>Saldo anterior: <strong>{formatCurrency(previousBalance)}</strong></span><span>Pago aplicado: <strong>- {formatCurrency(appliedAmount)}</strong></span><span>Nuevo saldo: <strong>{formatCurrency(newBalance)} MXN</strong></span></section>
      <h2 className="contract-terms-title">Términos y condiciones</h2><section className="contract-terms"><div><h3>Paquete · Nota importante</h3><ul>
        <li><strong>Cambios y cancelaciones:</strong> aplican las políticas de cambios y cancelaciones.</li>
        <li><strong>Paquete Volaris, Viva:</strong> aplican las políticas de vuelos Volaris y Viva.</li>
        <li><strong>Cancelaciones:</strong> penalidad del 100% en anticipos y abonos. Los servicios no utilizados no son reembolsables; aplica pérdida del paquete en caso de no show.</li>
        <li><strong>Cambios o modificaciones:</strong> con más de 15 días antes del viaje, aplican cambios de tarifa, cargos de aerolínea —incluido $1,300 por cambio de nombre— y cargos del hotel por cambio de fecha o titular, ya sea por solicitud de la agencia, cliente, emergencias, afectaciones o causas de fuerza mayor.</li>
        <li><strong>Cambios dentro de los 15 días:</strong> no están permitidos y quedan sujetos a las políticas del hotel y la aerolínea, incluso ante causas de fuerza mayor.</li>
        <li><strong>No recibir liquidaciones o anticipos:</strong> no recibirlos en las fechas estipuladas será causa de cancelación de la reserva.</li>
        <li><strong>Cargos extra en destino:</strong> no se incluyen resort fee, impuesto de sanidad, retención de garantía, otros impuestos ni servicios no especificados en la cotización.</li>
        <li><strong>Paquetes con otras aerolíneas:</strong> revisar los términos y condiciones aplicables.</li>
        <li><strong>Horario check-in y check-out:</strong> entrada estimada 15:00 y salida 11:00, sujeto a políticas del hotel. Áreas, restaurantes, spa, gimnasio, wifi, room service, bebidas y otros servicios pueden generar costos adicionales. Horarios, habitaciones, camas, piso, ubicación y accesorios están sujetos a disponibilidad.</li>
      </ul></div><div><h3>Aéreo · Información para el pasajero</h3><ul>
        <li><strong>Pasajeros:</strong> deberán presentarse 2 horas antes en vuelos nacionales y 3 horas antes en vuelos internacionales.</li>
        <li><strong>Equipaje:</strong> varía de acuerdo con el servicio contratado.</li>
        <li><strong>Asientos:</strong> asignación aleatoria por el sistema de la aerolínea; el cambio tiene costo.</li>
        <li><strong>Afectaciones:</strong> horarios, escalas, cancelaciones o demoras pueden cambiar sin previo aviso por causas ajenas a la agencia.</li>
        <li><strong>Responsabilidad en pérdida:</strong> la agencia se exime de responsabilidad por pérdida de equipaje, pérdida de vuelo o irregularidades no previstas por la aerolínea.</li>
        <li><strong>Documentos para vuelos nacionales:</strong> INE, pasaporte o licencia vigentes; para menores, CURP y acta de nacimiento.</li>
        <li><strong>Documentos para vuelos internacionales:</strong> pasaporte con más de seis meses de vigencia y visas requeridas por el destino. La agencia no se responsabiliza por rechazo de visa o negación de entrada al país.</li>
      </ul></div></section>
      <section className="contract-important"><h3>Puntos importantes</h3><ul><li><strong>Confirmar información:</strong> ruta, aerolínea, horarios, régimen de hotel, tipo de habitación y demás información del paquete.</li><li><strong>Datos personales:</strong> proporcionar datos verídicos y cotejar nombres y fechas de nacimiento con la identificación presentada.</li><li><strong>Información errónea:</strong> puede generar modificaciones, incrementos de tarifa, penalidades o pérdida del servicio.</li><li><strong>Eventualidades:</strong> deben reportarse de inmediato mediante los números de emergencia; la agencia se exime de eventualidades no reportadas en tiempo y forma.</li></ul></section>
      <section className="contract-signature"><div><strong>{quote.holderName}</strong><span>Recibí y acepto este comprobante</span></div></section><footer className="document-footer"><span>+MundoTravel · Comprobante de pago</span><span>{payment.id}</span><span>1 / 1</span></footer>
    </article>
  </div>
}
