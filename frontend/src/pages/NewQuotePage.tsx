import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FlightServiceModal } from '../components/quotes/FlightServiceModal'
import { HotelServiceModal } from '../components/quotes/HotelServiceModal'
import { QuoteGeneralInfo } from '../components/quotes/QuoteGeneralInfo'
import { QuoteSummary } from '../components/quotes/QuoteSummary'
import { PassengersEditor } from '../components/quotes/PassengersEditor'
import { ServiceSelector } from '../components/quotes/ServiceSelector'
import { TourServiceModal } from '../components/quotes/TourServiceModal'
import { TransportServiceModal } from '../components/quotes/TransportServiceModal'
import { clientsApi } from '../services/clientsApi'
import { flightsApi } from '../services/flightsApi'
import { hotelsApi } from '../services/hotelsApi'
import { mapClient } from '../services/mappers'
import { quotesApi } from '../services/quotesApi'
import { passengersApi } from '../services/passengersApi'
import { toursApi } from '../services/toursApi'
import { transportsApi } from '../services/transportsApi'
import type { Client } from '../types/client'
import type { Passenger, QuoteGeneralInfoErrors, QuoteGeneralInfoValue, QuoteService, ServiceType } from '../types/quote'

const initial:QuoteGeneralInfoValue={branch:import.meta.env.VITE_DEFAULT_BRANCH_ID||'',paymentLimitDate:'',internalComment:'',holder:'',departureDate:'',returnDate:''}
const nullable=(v:string)=>v.trim()||null
async function saveService(quoteId:string,s:QuoteService){
  if(s.type==='hotel') return hotelsApi.create(quoteId,{purchase_method:s.purchaseMethod,hotel_name:s.hotelName,check_in:s.checkIn,check_out:s.checkOut,plan:s.plan,rooms:s.rooms,operator:nullable(s.operator),reservation_code:nullable(s.reservationCode),cancellation_date:nullable(s.cancellationDate),comments:nullable(s.comments),net_price:s.netPrice,public_price:s.publicPrice})
  if(s.type==='tour') return toursApi.create(quoteId,{purchase_method:s.purchaseMethod,name:s.name,start_datetime:s.startDateTime,cancellation_date:nullable(s.cancellationDate),operator:nullable(s.operator),operator_code:nullable(s.operatorCode),comments:nullable(s.comments),net_price:s.netPrice,public_price:s.publicPrice})
  if(s.type==='transport') return transportsApi.create(quoteId,{purchase_method:s.purchaseMethod,transport_type:s.transportType,trip_type:s.tripType,origin:s.origin,destination:s.destination,departure_datetime:s.departureDateTime,return_datetime:s.returnDateTime??null,operator:nullable(s.operator),operator_code:nullable(s.operatorCode),cancellation_date:nullable(s.cancellationDate),comments:nullable(s.comments),net_price:s.netPrice,public_price:s.publicPrice})
  return flightsApi.create(quoteId,{purchase_method:s.purchaseMethod,trip_type:s.tripType,origin:s.origin,destination:s.destination,departure_datetime:s.departureDateTime,return_datetime:s.returnDateTime??null,airline:s.airline,outbound_flight_number:s.outboundFlightNumber,return_flight_number:s.returnFlightNumber??null,operator:nullable(s.operator),operator_code:nullable(s.operatorCode),comments:nullable(s.comments),net_price:s.netPrice,public_price:s.publicPrice})
}
export function NewQuotePage(){
 const navigate=useNavigate(), location=useLocation(); const selected=(location.state as {selectedClient?:string}|null)?.selectedClient??''
 const [info,setInfo]=useState({...initial,holder:selected}),[errors,setErrors]=useState<QuoteGeneralInfoErrors>({}),[clients,setClients]=useState<Client[]>([]),[services,setServices]=useState<QuoteService[]>([]),[passengers,setPassengers]=useState<Passenger[]>([]),[selectedType,setSelectedType]=useState<ServiceType|null>(null),[saving,setSaving]=useState(false),[saveError,setSaveError]=useState('')
 const [hotel,setHotel]=useState(false),[tour,setTour]=useState(false),[transport,setTransport]=useState(false),[flight,setFlight]=useState(false)
 useEffect(()=>{clientsApi.list({status:'active'}).then(v=>setClients(v.map(mapClient))).catch(e=>setSaveError(e instanceof Error?e.message:'No fue posible cargar clientes.'))},[])
 const totals=useMemo(()=>services.reduce((a,s)=>({net:a.net+s.netPrice,pub:a.pub+s.publicPrice}),{net:0,pub:0}),[services])
 const save=async()=>{const next:QuoteGeneralInfoErrors={};if(!info.branch)next.branch='Configura VITE_DEFAULT_BRANCH_ID.';if(!info.holder)next.holder='Selecciona un cliente.';if(!info.departureDate)next.departureDate='Selecciona la salida.';if(!info.returnDate||info.returnDate<info.departureDate)next.returnDate='Selecciona un regreso válido.';setErrors(next);if(Object.keys(next).length)return;setSaving(true);setSaveError('');let quoteId='';try{const quote=await quotesApi.create({client_id:info.holder,branch_id:info.branch,status:'pending',sale_date:new Date().toISOString(),payment_limit_date:info.paymentLimitDate||null,departure_date:info.departureDate,return_date:info.returnDate,internal_comment:nullable(info.internalComment),currency:'MXN'});quoteId=quote.id;for(const service of services)await saveService(quote.id,service);for(const passenger of passengers)await passengersApi.create(quote.id,{name:passenger.name,age:passenger.age,passenger_type:passenger.type});navigate(`/cotizaciones/${quote.id}`)}catch(e){setSaveError(`${quoteId?'La cotización fue creada parcialmente. ':''}${e instanceof Error?e.message:'No fue posible guardar.'}`)}finally{setSaving(false)}}
 const add=(s:QuoteService)=>setServices(c=>[...c,s]); const change=(f:keyof QuoteGeneralInfoValue,v:string)=>{setInfo(c=>({...c,[f]:v}));setErrors(c=>({...c,[f]:undefined}))}
 return <div><header className="mb-7"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Cotizaciones</p><h1 className="m-0 text-2xl font-bold text-slate-900">Nueva cotización</h1><p className="mb-0 mt-2 text-sm text-slate-500">Crea y arma una cotización para tu cliente.</p></header><div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_23rem]"><div className="space-y-6"><QuoteGeneralInfo value={info} errors={errors} clients={clients} onChange={change}/><PassengersEditor passengers={passengers} onChange={setPassengers}/><ServiceSelector selectedType={selectedType} onSelect={setSelectedType} onOpenHotel={()=>setHotel(true)} onOpenTour={()=>setTour(true)} onOpenTransport={()=>setTransport(true)} onOpenFlight={()=>setFlight(true)}/></div><QuoteSummary services={services} holderName={clients.find(client=>client.id===info.holder)?.fullName} passengers={passengers} netTotal={totals.net} publicTotal={totals.pub} margin={totals.pub-totals.net} isSaved={false} isSaving={saving} saveError={saveError} onRemoveService={id=>setServices(c=>c.filter(s=>s.id!==id))} onCancel={()=>navigate('/cotizaciones')} onSave={()=>void save()}/></div><HotelServiceModal open={hotel} onClose={()=>setHotel(false)} onSave={add}/><TourServiceModal open={tour} onClose={()=>setTour(false)} onSave={add}/><TransportServiceModal open={transport} onClose={()=>setTransport(false)} onSave={add}/><FlightServiceModal open={flight} onClose={()=>setFlight(false)} onSave={add}/></div>
}
