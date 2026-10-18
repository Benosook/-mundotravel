import { ArrowLeft, Compass, Printer } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { DocumentServices } from '../components/quotes/document/DocumentServices'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { mapQuoteDetail } from '../services/mappers'
import { quotesApi } from '../services/quotesApi'
import type { PaymentScheduleStatus, QuoteDetail } from '../types/quote'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'

const paymentStatuses: Record<PaymentScheduleStatus, string> = { pending: 'Pendiente', paid: 'Pagado', overdue: 'Vencido' }
const installmentNames = ['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO']

function DocumentBrand() {
  return <div className="document-brand"><div className="document-brand-mark"><Compass size={25} strokeWidth={1.7} aria-hidden="true" /></div><div><p><span>+</span>MundoTravel</p><small>Tu viaje comienza aquí</small></div></div>
}

export function QuoteDocumentPage() {
  const { id } = useParams()
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { if (!id) return; setLoading(true); quotesApi.get(id).then((data) => setQuote(mapQuoteDetail(data))).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar el documento.')).finally(() => setLoading(false)) }, [id])
  if (loading) return <LoadingState label="Preparando documento…" />
  if (error) return <ErrorState message={error} />
  if (!quote) return <section className="rounded-xl border border-slate-200 bg-white px-8 py-20 text-center shadow-sm shadow-slate-900/3"><h1 className="m-0 text-2xl font-bold text-slate-900">Documento no disponible</h1><p className="mb-0 mt-2 text-sm text-slate-500">No encontramos información para generar este documento.</p><Link to="/cotizaciones" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><ArrowLeft size={16} aria-hidden="true" /> Volver a cotizaciones</Link></section>

  const generatedAt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())

  return <div className="quote-document-screen -mx-4 -my-5 overflow-x-auto bg-slate-200 px-4 py-5 sm:-mx-6 sm:-my-6 sm:px-6 lg:-mx-8 lg:-my-8 lg:px-8 lg:py-6">
    <div className="document-actions mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-4"><Link to={`/cotizaciones/${quote.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" /> Volver al detalle</Link><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Printer size={16} aria-hidden="true" /> Imprimir / Guardar PDF</button></div>

    <article className="document-page document-contract print-document">
      <header className="contract-header print-block">
        <DocumentBrand />
        <div className="contract-agency"><strong>+MundoTravel</strong><span>Agencia de viajes</span><span>{quote.branch}</span><span>Atención personalizada</span></div>
        <div className="contract-meta"><strong>Paquete {quote.folio}</strong><span>{generatedAt}</span><span>{quote.holderName}</span></div>
      </header>

      <div className="contract-route print-block"><span>Asesor: <strong>{quote.sellerName}</strong></span><span>De: <strong>Origen registrado</strong></span><span>A: <strong>{quote.destination}</strong></span></div>

      <DocumentServices services={quote.services} />

      <section className="contract-summary print-block"><span>No. personas <strong>{quote.passengers.length}</strong></span><span>Fecha límite de pago: <strong>{formatDate(quote.paymentLimitDate)}</strong></span><span>Precio: <strong>{formatCurrency(quote.publicPrice)} MXN</strong></span></section>

      <h2 className="contract-terms-title">Términos y condiciones</h2>
      <section className="contract-terms print-block">
        <div><h3>Paquete · Nota importante</h3><ul>
          <li><strong>Cambios y cancelaciones:</strong> aplican las políticas de cambios y cancelaciones.</li>
          <li><strong>Paquetes Volaris y Viva:</strong> aplican las políticas de vuelos de Volaris y Viva.</li>
          <li><strong>Cancelaciones:</strong> penalidad del 100% sobre anticipos y abonos. Los servicios no utilizados no son reembolsables; aplica pérdida del paquete en caso de no show.</li>
          <li><strong>Cambios o modificaciones:</strong> con más de 15 días antes del viaje aplican cambios de tarifa, cargos de la aerolínea —incluido cambio de nombre— y cargos del hotel por cambio de fecha o titular, ya sea por solicitud de la agencia, del cliente, emergencias, afectaciones o causas de fuerza mayor.</li>
          <li><strong>Cambios dentro de los 15 días:</strong> no están permitidos y quedan sujetos a las políticas del hotel y la aerolínea, incluso ante causas de fuerza mayor.</li>
          <li><strong>Falta de liquidaciones o anticipos:</strong> no recibirlos en las fechas estipuladas será causa de cancelación de la reserva.</li>
          <li><strong>Cargos extra en destino:</strong> no se incluyen resort fee, impuesto de sanidad, retención de garantía, otros impuestos ni servicios no especificados en la cotización.</li>
          <li><strong>Otras aerolíneas:</strong> deben revisarse los términos y condiciones aplicables.</li>
          <li><strong>Check-in y check-out:</strong> horario estimado de entrada 15:00 y salida 11:00, sujeto a políticas del hotel. Áreas, restaurantes, spa, gimnasio, wifi, room service, bebidas y otros servicios pueden tener costo adicional. Horarios, habitaciones, camas, piso, ubicación y accesorios están sujetos a disponibilidad.</li>
        </ul></div>
        <div><h3>Aéreo · Información para el pasajero</h3><ul>
          <li><strong>Presentación:</strong> 2 horas antes para vuelo nacional y 3 horas antes para vuelo internacional.</li>
          <li><strong>Equipaje:</strong> varía de acuerdo con el servicio contratado.</li>
          <li><strong>Asientos:</strong> asignación aleatoria por el sistema de la aerolínea; el cambio puede generar costo.</li>
          <li><strong>Afectaciones:</strong> horarios, escalas, cancelaciones o demoras pueden cambiar sin previo aviso por causas ajenas a la agencia.</li>
          <li><strong>Pérdidas:</strong> la agencia se exime de responsabilidad por pérdida de equipaje, pérdida de vuelo o irregularidades no previstas por la aerolínea.</li>
          <li><strong>Vuelos nacionales:</strong> identificación vigente; para menores, CURP y acta de nacimiento.</li>
          <li><strong>Vuelos internacionales:</strong> pasaporte con más de seis meses de vigencia y visas requeridas por el destino. La agencia no se responsabiliza por rechazo de visa o negación de entrada al país.</li>
        </ul></div>
      </section>

      <section className="contract-important print-block"><h3>Puntos importantes</h3><ul><li><strong>Confirmar información:</strong> ruta, aerolínea, horarios, régimen de hotel, tipo de habitación y demás información del paquete.</li><li><strong>Datos personales:</strong> proporcionar datos verídicos y cotejar nombres y fechas de nacimiento con la identificación presentada.</li><li><strong>Información errónea:</strong> puede generar modificaciones, incrementos de tarifa, penalidades o pérdida del servicio.</li><li><strong>Eventualidades:</strong> deben reportarse de inmediato mediante los números de emergencia; la agencia se exime de eventualidades no reportadas en tiempo y forma.</li></ul></section>

      <section className="contract-payments print-block"><h3>Plan de pagos</h3><div className="contract-payment-grid">{quote.paymentSchedule.map((item) => <div key={item.id}><span>■ &nbsp;{installmentNames[item.installmentNumber - 1] ?? `PAGO ${item.installmentNumber}`}: {formatDate(item.dueDate)}</span><strong>{formatCurrency(item.amount)}</strong><small>{paymentStatuses[item.status]}</small></div>)}</div></section>

      <section className="contract-signature print-block"><div><strong>{quote.holderName}</strong><span>Acepto los términos y condiciones</span></div></section>
      <footer className="document-footer"><span>+MundoTravel · Documento de viaje</span><span>{quote.folio}</span><span>1 / 1</span></footer>
    </article>
  </div>
}
