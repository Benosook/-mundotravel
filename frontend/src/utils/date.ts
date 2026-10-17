export function formatLocalDateTime(value: string) {
  return value.replace('T', ' ')
}

export function formatDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}
