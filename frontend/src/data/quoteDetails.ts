import type { QuoteDetail } from '../types/quote'

const sharedFlight = {
  type: 'flight' as const,
  purchaseMethod: 'Operadora externa',
  tripType: 'round' as const,
  origin: 'Ciudad de México',
  destination: 'Cancún',
  departureDateTime: '2026-11-10T08:30',
  returnDateTime: '2026-11-15T18:45',
  airline: 'Aerolínea Demo',
  outboundFlightNumber: 'AD 421',
  returnFlightNumber: 'AD 422',
  operator: 'Operadora Demo',
  operatorCode: 'OP-9821',
  comments: 'Incluye equipaje documentado.',
  netPrice: 10800,
  publicPrice: 12900,
}

const sharedHotel = {
  type: 'hotel' as const,
  purchaseMethod: 'Operadora externa',
  hotelName: 'Hotel Costa Azul',
  checkIn: '2026-11-10',
  checkOut: '2026-11-15',
  plan: 'Todo incluido',
  rooms: 2,
  operator: 'Operadora Demo',
  reservationCode: 'HCA-2048',
  cancellationDate: '2026-11-01',
  comments: 'Habitaciones cercanas solicitadas.',
  netPrice: 13500,
  publicPrice: 16500,
}

export const quoteDetails: QuoteDetail[] = [
  {
    id: 'quote-001', folio: 'MT-2026-001', status: 'active', holderName: 'Mariana Sánchez',
    sellerName: 'Frida', branch: '+MundoTravel Centro', destination: 'Cancún', saleDate: '2026-10-12',
    paymentLimitDate: '2026-11-03', departureDate: '2026-11-10', returnDate: '2026-11-15',
    internalComment: 'Familia con dos menores. Confirmar habitaciones comunicadas.',
    publicPrice: 32500, netPrice: 26800, totalPaid: 15000, remainingBalance: 17500,
    passengers: [
      { id: 'p-001', name: 'Mariana Sánchez', age: 38, type: 'adult' },
      { id: 'p-002', name: 'Luis Ortega', age: 40, type: 'adult' },
      { id: 'p-003', name: 'Sofía Ortega', age: 11, type: 'minor' },
      { id: 'p-004', name: 'Diego Ortega', age: 7, type: 'minor' },
    ],
    paymentSchedule: [
      { id: 'ps-001', installmentNumber: 1, dueDate: '2026-10-15', amount: 15000, status: 'paid' },
      { id: 'ps-002', installmentNumber: 2, dueDate: '2026-10-28', amount: 10000, status: 'pending' },
      { id: 'ps-003', installmentNumber: 3, dueDate: '2026-11-03', amount: 7500, status: 'pending' },
    ],
    services: [
      { id: 'fl-001', ...sharedFlight },
      { id: 'ht-001', ...sharedHotel },
      { id: 'tr-001', type: 'transport', purchaseMethod: 'Gestión interna', transportType: 'Aeropuerto - Hotel', tripType: 'round', origin: 'Aeropuerto de Cancún', destination: 'Hotel Costa Azul', departureDateTime: '2026-11-10T11:30', returnDateTime: '2026-11-15T15:30', operator: '+MundoTravel', operatorCode: 'TRA-082', cancellationDate: '2026-11-08', comments: 'Unidad para cuatro pasajeros.', netPrice: 1500, publicPrice: 2100 },
      { id: 'to-001', type: 'tour', purchaseMethod: 'Operadora externa', name: 'Tour Isla Mujeres', startDateTime: '2026-11-12T08:00', cancellationDate: '2026-11-08', operator: 'Operadora Demo', operatorCode: 'TOUR-119', comments: 'Incluye alimentos.', netPrice: 1000, publicPrice: 1000 },
    ],
  },
  {
    id: 'quote-002', folio: 'MT-2026-002', status: 'paid', holderName: 'Carlos Mendoza', sellerName: 'Frida',
    branch: '+MundoTravel Centro', destination: 'Madrid y París', saleDate: '2026-10-10', paymentLimitDate: '2026-12-20',
    departureDate: '2027-01-18', returnDate: '2027-01-29', settlementDate: '2026-10-14',
    internalComment: 'Viaje de aniversario. Solicitar cama matrimonial.', publicPrice: 78400, netPrice: 64900,
    totalPaid: 78400, remainingBalance: 0,
    passengers: [{ id: 'p-005', name: 'Carlos Mendoza', age: 45, type: 'adult' }, { id: 'p-006', name: 'Patricia Vega', age: 43, type: 'adult' }],
    paymentSchedule: [{ id: 'ps-004', installmentNumber: 1, dueDate: '2026-10-14', amount: 78400, status: 'paid' }],
    services: [
      { id: 'fl-002', ...sharedFlight, origin: 'Ciudad de México', destination: 'Madrid', departureDateTime: '2027-01-18T21:00', returnDateTime: '2027-01-29T13:20', outboundFlightNumber: 'AD 801', returnFlightNumber: 'AD 802', netPrice: 37000, publicPrice: 44500 },
      { id: 'ht-002', ...sharedHotel, hotelName: 'Hotel Central Madrid', checkIn: '2027-01-19', checkOut: '2027-01-24', plan: 'Desayuno incluido', rooms: 1, reservationCode: 'MAD-771', comments: '', netPrice: 27900, publicPrice: 33900 },
    ],
  },
  {
    id: 'quote-004', folio: 'MT-2026-004', status: 'active', holderName: 'Roberto Aguilar', sellerName: 'Sofía',
    branch: '+MundoTravel Online', destination: 'Riviera Maya', saleDate: '2026-10-06', paymentLimitDate: '2026-12-05',
    departureDate: '2026-12-20', returnDate: '2026-12-27', internalComment: 'Grupo familiar; dos hoteles por cambio de zona.',
    publicPrice: 54600, netPrice: 44200, totalPaid: 20000, remainingBalance: 34600,
    passengers: [{ id: 'p-007', name: 'Roberto Aguilar', age: 51, type: 'adult' }, { id: 'p-008', name: 'Claudia Ríos', age: 49, type: 'adult' }, { id: 'p-009', name: 'Mateo Aguilar', age: 15, type: 'minor' }],
    paymentSchedule: [{ id: 'ps-005', installmentNumber: 1, dueDate: '2026-10-10', amount: 20000, status: 'paid' }, { id: 'ps-006', installmentNumber: 2, dueDate: '2026-11-15', amount: 17300, status: 'pending' }, { id: 'ps-007', installmentNumber: 3, dueDate: '2026-12-05', amount: 17300, status: 'pending' }],
    services: [
      { id: 'fl-004', ...sharedFlight, departureDateTime: '2026-12-20T07:00', returnDateTime: '2026-12-27T20:00', netPrice: 15500, publicPrice: 18900 },
      { id: 'ht-004a', ...sharedHotel, hotelName: 'Playa Resort', checkIn: '2026-12-20', checkOut: '2026-12-24', rooms: 2, netPrice: 12800, publicPrice: 15500 },
      { id: 'ht-004b', ...sharedHotel, hotelName: 'Tulum Eco Hotel', checkIn: '2026-12-24', checkOut: '2026-12-27', rooms: 2, plan: 'Desayuno incluido', netPrice: 8500, publicPrice: 10400 },
      { id: 'tr-004', type: 'transport', purchaseMethod: 'Operadora externa', transportType: 'Hotel - Hotel', tripType: 'round', origin: 'Playa del Carmen', destination: 'Tulum', departureDateTime: '2026-12-24T12:00', returnDateTime: '2026-12-27T14:00', operator: 'Operadora Demo', operatorCode: 'TRA-404', cancellationDate: '2026-12-18', comments: '', netPrice: 3900, publicPrice: 4800 },
      { id: 'to-004', type: 'tour', purchaseMethod: 'Operadora externa', name: 'Ruinas de Tulum', startDateTime: '2026-12-25T09:00', cancellationDate: '2026-12-20', operator: 'Operadora Demo', operatorCode: 'TOUR-404', comments: '', netPrice: 3500, publicPrice: 5000 },
    ],
  },
  {
    id: 'quote-005', folio: 'MT-2026-005', status: 'pending', holderName: 'Andrea Valdés', sellerName: 'Frida',
    branch: '+MundoTravel Centro', destination: 'Nueva York', saleDate: '2026-10-04', paymentLimitDate: '2027-01-10',
    departureDate: '2027-02-05', returnDate: '2027-02-12', internalComment: 'Cotización pendiente de anticipo.',
    publicPrice: 61200, netPrice: 51800, totalPaid: 0, remainingBalance: 61200,
    passengers: [{ id: 'p-010', name: 'Andrea Valdés', age: 32, type: 'adult' }, { id: 'p-011', name: 'Mónica Pérez', age: 31, type: 'adult' }],
    paymentSchedule: [{ id: 'ps-008', installmentNumber: 1, dueDate: '2026-10-12', amount: 20000, status: 'overdue' }, { id: 'ps-009', installmentNumber: 2, dueDate: '2026-12-15', amount: 20600, status: 'pending' }, { id: 'ps-010', installmentNumber: 3, dueDate: '2027-01-10', amount: 20600, status: 'pending' }],
    services: [
      { id: 'fl-005', ...sharedFlight, destination: 'Nueva York', departureDateTime: '2027-02-05T09:00', returnDateTime: '2027-02-12T16:00', netPrice: 28000, publicPrice: 33500 },
      { id: 'ht-005', ...sharedHotel, hotelName: 'Manhattan City Hotel', checkIn: '2027-02-05', checkOut: '2027-02-12', plan: 'Solo hospedaje', rooms: 1, netPrice: 21000, publicPrice: 24900 },
      { id: 'to-005', type: 'tour', purchaseMethod: 'Operadora externa', name: 'Contrastes de Nueva York', startDateTime: '2027-02-08T08:00', cancellationDate: '2027-02-03', operator: 'Operadora Demo', operatorCode: 'NY-228', comments: '', netPrice: 2800, publicPrice: 2800 },
    ],
  },
]
