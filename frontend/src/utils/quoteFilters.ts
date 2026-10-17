import type { QuoteFiltersValue, QuoteListItem } from '../types/quote'

export function filterQuotes(quotes: QuoteListItem[], filters: QuoteFiltersValue) {
  const search = filters.search.trim().toLocaleLowerCase('es-MX')

  return quotes.filter((quote) => {
    const matchesSearch = !search || [quote.folio, quote.clientName, quote.destination]
      .some((value) => value.toLocaleLowerCase('es-MX').includes(search))

    return matchesSearch
      && (!filters.branch || quote.branch === filters.branch)
      && (!filters.seller || quote.sellerName === filters.seller)
      && (!filters.status || quote.status === filters.status)
      && (!filters.dateFrom || quote.createdAt >= filters.dateFrom)
      && (!filters.dateTo || quote.createdAt <= filters.dateTo)
  })
}
