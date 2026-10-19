type PassengerIdentity = {
  id: string
  name: string
}

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-MX')

/**
 * A quote always has one holder. Passenger records represent companions, but
 * older quotes may also contain the holder as a passenger. Passenger IDs are
 * the source of truth for de-duplicating records; the normalized name check
 * only prevents counting the holder twice because Passenger has no client_id.
 */
export function getQuotePeopleCount(holderName: string, passengers: PassengerIdentity[]) {
  const uniquePassengers = [...new Map(passengers.map((passenger) => [passenger.id, passenger])).values()]
  const normalizedHolder = normalizeName(holderName)
  const companions = normalizedHolder
    ? uniquePassengers.filter((passenger) => normalizeName(passenger.name) !== normalizedHolder)
    : uniquePassengers

  return 1 + companions.length
}
