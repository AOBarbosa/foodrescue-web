import { parseIsoDate, toIsoDate, toIsoDateTime } from '@/lib/format'
import type { SalePeriod } from '@/types/sale'

/** Days covered by the period the history opens with. */
export const DEFAULT_PERIOD_DAYS = 30

/** The two `yyyy-MM-dd` bounds the user picks, both inclusive. */
export type PeriodRange = { from: string; to: string }

/** Last `DEFAULT_PERIOD_DAYS` days, ending today. */
export function defaultPeriodRange(today: Date = new Date()): PeriodRange {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  from.setDate(from.getDate() - (DEFAULT_PERIOD_DAYS - 1))
  return { from: toIsoDate(from), to: toIsoDate(today) }
}

/**
 * Turns the two inclusive calendar dates into the query the backend expects:
 * start at midnight of `from`, end at midnight of the day after `to`, since
 * the backend compares `soldAt < end`. Without the extra day, sales made
 * during the last day of the period would fall outside it.
 */
export function toSalePeriod({ from, to }: PeriodRange): SalePeriod {
  const end = parseIsoDate(to)
  end.setDate(end.getDate() + 1)
  return {
    startDate: toIsoDateTime(parseIsoDate(from)),
    endDate: toIsoDateTime(end),
  }
}
