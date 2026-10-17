import type { QuoteListItem } from '../types/quote'

export const quoteBranches = [
  '+MundoTravel Centro',
  '+MundoTravel Norte',
  '+MundoTravel Online',
]

export const hotelPurchaseMethods = ['Gestión interna', 'Operadora externa']

export const hotelPlans = ['Solo hospedaje', 'Desayuno incluido', 'Todo incluido']

export const hotelOperators = ['+MundoTravel', 'Operadora Demo', 'Otra']

export const transportTypes = [
  'Aeropuerto - Hotel',
  'Hotel - Aeropuerto',
  'Hotel - Hotel',
  'Otro',
]

export const quoteHistory: QuoteListItem[] = [
  {
    id: 'quote-001', folio: 'MT-2026-001', clientName: 'Mariana Sánchez', sellerName: 'Frida',
    destination: 'Cancún', services: ['Hotel', 'Vuelo', 'Transporte'], departureDate: '2026-11-10',
    returnDate: '2026-11-15', publicPrice: 32500, netPrice: 26800, totalPaid: 15000,
    remainingBalance: 17500, status: 'active', branch: '+MundoTravel Centro', createdAt: '2026-10-12',
  },
  {
    id: 'quote-002', folio: 'MT-2026-002', clientName: 'Carlos Mendoza', sellerName: 'Frida',
    destination: 'Madrid y París', services: ['Vuelo', 'Hotel', 'Tour', 'Transporte'], departureDate: '2027-01-18',
    returnDate: '2027-01-29', publicPrice: 78400, netPrice: 64900, totalPaid: 78400,
    remainingBalance: 0, status: 'paid', branch: '+MundoTravel Centro', createdAt: '2026-10-10',
  },
  {
    id: 'quote-003', folio: 'MT-2026-003', clientName: 'Laura Hernández', sellerName: 'Daniel',
    destination: 'Puerto Vallarta', services: ['Hotel', 'Vuelo'], departureDate: '2026-12-03',
    returnDate: '2026-12-08', publicPrice: 28900, netPrice: 23100, totalPaid: 8000,
    remainingBalance: 20900, status: 'pending', branch: '+MundoTravel Norte', createdAt: '2026-10-08',
  },
  {
    id: 'quote-004', folio: 'MT-2026-004', clientName: 'Roberto Aguilar', sellerName: 'Sofía',
    destination: 'Riviera Maya', services: ['Hotel', 'Vuelo', 'Tour', 'Transporte'], departureDate: '2026-12-20',
    returnDate: '2026-12-27', publicPrice: 54600, netPrice: 44200, totalPaid: 20000,
    remainingBalance: 34600, status: 'active', branch: '+MundoTravel Online', createdAt: '2026-10-06',
  },
  {
    id: 'quote-005', folio: 'MT-2026-005', clientName: 'Andrea Valdés', sellerName: 'Frida',
    destination: 'Nueva York', services: ['Vuelo', 'Hotel', 'Tour'], departureDate: '2027-02-05',
    returnDate: '2027-02-12', publicPrice: 61200, netPrice: 51800, totalPaid: 0,
    remainingBalance: 61200, status: 'pending', branch: '+MundoTravel Centro', createdAt: '2026-10-04',
  },
  {
    id: 'quote-006', folio: 'MT-2026-006', clientName: 'José Luis Castro', sellerName: 'Daniel',
    destination: 'Los Cabos', services: ['Hotel', 'Vuelo', 'Transporte'], departureDate: '2026-11-22',
    returnDate: '2026-11-27', publicPrice: 36750, netPrice: 30200, totalPaid: 12000,
    remainingBalance: 24750, status: 'active', branch: '+MundoTravel Norte', createdAt: '2026-09-29',
  },
  {
    id: 'quote-007', folio: 'MT-2026-007', clientName: 'Fernanda Ruiz', sellerName: 'Sofía',
    destination: 'Oaxaca', services: ['Hotel', 'Tour'], departureDate: '2026-11-01',
    returnDate: '2026-11-05', publicPrice: 18400, netPrice: 13900, totalPaid: 18400,
    remainingBalance: 0, status: 'paid', branch: '+MundoTravel Online', createdAt: '2026-09-25',
  },
  {
    id: 'quote-008', folio: 'MT-2026-008', clientName: 'Miguel Torres', sellerName: 'Frida',
    destination: 'Orlando', services: ['Vuelo', 'Hotel', 'Transporte'], departureDate: '2027-03-14',
    returnDate: '2027-03-21', publicPrice: 69500, netPrice: 58100, totalPaid: 25000,
    remainingBalance: 44500, status: 'active', branch: '+MundoTravel Centro', createdAt: '2026-09-21',
  },
  {
    id: 'quote-009', folio: 'MT-2026-009', clientName: 'Paola Jiménez', sellerName: 'Daniel',
    destination: 'Mérida', services: ['Hotel', 'Vuelo'], departureDate: '2026-10-28',
    returnDate: '2026-11-02', publicPrice: 24100, netPrice: 19600, totalPaid: 6000,
    remainingBalance: 18100, status: 'cancelled', branch: '+MundoTravel Norte', createdAt: '2026-09-18',
  },
  {
    id: 'quote-010', folio: 'MT-2026-010', clientName: 'Ricardo Luna', sellerName: 'Sofía',
    destination: 'Monterrey', services: ['Vuelo', 'Transporte'], departureDate: '2026-11-08',
    returnDate: '2026-11-10', publicPrice: 15800, netPrice: 12700, totalPaid: 15800,
    remainingBalance: 0, status: 'paid', branch: '+MundoTravel Online', createdAt: '2026-09-14',
  },
  {
    id: 'quote-011', folio: 'MT-2026-011', clientName: 'Elena Navarro', sellerName: 'Frida',
    destination: 'Punta Cana', services: ['Hotel', 'Vuelo', 'Tour', 'Transporte'], departureDate: '2027-04-02',
    returnDate: '2027-04-09', publicPrice: 57200, netPrice: 46800, totalPaid: 10000,
    remainingBalance: 47200, status: 'pending', branch: '+MundoTravel Centro', createdAt: '2026-09-10',
  },
  {
    id: 'quote-012', folio: 'MT-2026-012', clientName: 'Gabriel Rojas', sellerName: 'Daniel',
    destination: 'Guadalajara', services: ['Hotel', 'Vuelo'], departureDate: '2026-10-22',
    returnDate: '2026-10-25', publicPrice: 21300, netPrice: 17100, totalPaid: 0,
    remainingBalance: 21300, status: 'cancelled', branch: '+MundoTravel Norte', createdAt: '2026-09-05',
  },
]

