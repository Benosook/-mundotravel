import { useEffect, useMemo, useState } from 'react'
import { DepartureFilters } from '../components/departures/DepartureFilters'
import { DeparturesList } from '../components/departures/DeparturesList'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { quotesApi } from '../services/quotesApi'
import type { DepartureFiltersValue, DepartureStatus, UpcomingDeparture } from '../types/departure'

const initialFilters:DepartureFiltersValue={search:'',branch:'',seller:'',status:'',dateFrom:'',dateTo:'',client:''}
const statusMap:Record<string,DepartureStatus>={active:'confirmed',paid:'confirmed',pending:'pending',cancelled:'cancelled'}
export function UpcomingDeparturesPage(){
 const [filters,setFilters]=useState(initialFilters),[items,setItems]=useState<UpcomingDeparture[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{const load=async()=>{try{const summaries=await quotesApi.list({departure_from:new Date().toISOString().slice(0,10),limit:100});const quotes=await Promise.all(summaries.map(q=>quotesApi.get(q.id)));setItems(quotes.filter(q=>q.departure_date&&q.return_date).map(q=>({id:q.id,quoteId:q.id,folio:q.folio,clientName:q.client.full_name,branch:q.branch.name,sellerName:q.seller?.name??'Sin vendedor',status:statusMap[q.status],departureDate:q.departure_date!,returnDate:q.return_date!,adults:q.passengers.filter(p=>p.passenger_type==='adult').length,minors:q.passengers.filter(p=>p.passenger_type==='minor').length,hotelName:q.hotels.map(h=>h.hotel_name).join(', '),flightSummary:q.flights.map(f=>`${f.origin} → ${f.destination}`).join(', '),publicPrice:Number(q.public_price)})))}catch(reason){setError(reason instanceof Error?reason.message:'No fue posible cargar las próximas salidas.')}finally{setLoading(false)}};void load()},[])
 const branches=useMemo(()=>[...new Set(items.map(i=>i.branch))],[items]),sellers=useMemo(()=>[...new Set(items.map(i=>i.sellerName))],[items]),clients=useMemo(()=>[...new Set(items.map(i=>i.clientName))],[items])
 const filtered=useMemo(()=>{const search=filters.search.trim().toLocaleLowerCase('es-MX');return items.filter(d=>(!search||[d.folio,d.clientName,d.hotelName,d.flightSummary].some(v=>v.toLocaleLowerCase('es-MX').includes(search)))&&(!filters.branch||d.branch===filters.branch)&&(!filters.seller||d.sellerName===filters.seller)&&(!filters.status||d.status===filters.status)&&(!filters.client||d.clientName===filters.client)&&(!filters.dateFrom||d.departureDate>=filters.dateFrom)&&(!filters.dateTo||d.departureDate<=filters.dateTo))},[filters,items])
 const clear=()=>setFilters(initialFilters)
 return <div className="space-y-6"><header><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Operación</p><h1 className="m-0 text-2xl font-bold">Próximas salidas</h1><p className="mb-0 mt-2 text-sm text-slate-500">Consulta viajes próximos registrados en las cotizaciones.</p></header><DepartureFilters value={filters} branches={branches} sellers={sellers} clients={clients} onChange={(field,value)=>setFilters(current=>({...current,[field]:value}))} onClear={clear}/>{loading?<LoadingState label="Cargando próximas salidas…"/>:error?<ErrorState message={error}/>:<DeparturesList departures={filtered} onClearFilters={clear}/>}</div>
}
