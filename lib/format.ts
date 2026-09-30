const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const date = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatCurrency(value: number): string {
  return currency.format(value)
}

/**
 * Parses a backend `yyyy-MM-dd` as a local calendar date. `new Date("2026-10-01")`
 * would be UTC midnight, i.e. the previous day in Brazil.
 */
export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Local `yyyy-MM-dd`, the format the backend expects for dates. */
export function toIsoDate(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

/**
 * Local `yyyy-MM-ddTHH:mm:ss`, the format the backend expects for a
 * `LocalDateTime` — no timezone, so it is never shifted.
 */
export function toIsoDateTime(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  return `${toIsoDate(value)}T${time}`
}

export function formatDate(iso: string): string {
  return date.format(parseIsoDate(iso))
}

/** Backend `LocalDateTime` (no offset), read as local time. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso))
}

const time = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' })

/** Time part (HH:mm) of a backend `LocalDateTime`, read as local time. */
export function formatTime(iso: string): string {
  return time.format(new Date(iso))
}

const percent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
})

/** A backend percentage (0–100, not 0–1), e.g. `66.67` → `66,7%`. */
export function formatPercent(value: number): string {
  return percent.format(value / 100)
}
