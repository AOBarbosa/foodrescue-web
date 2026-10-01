import { formatCurrency, formatPercent } from '@/lib/format'

export type MetricVariation = {
  diff: number
  percentage: number | null
}

export function calculateVariation(
  current: number,
  previous: number
): MetricVariation {
  const diff = current - previous
  if (previous === 0) {
    return {
      diff,
      percentage: null,
    }
  }
  const percentage = ((current - previous) / Math.abs(previous)) * 100
  return { diff, percentage }
}

export function formatVariationText(
  variation: MetricVariation,
  type: 'currency' | 'units'
): string {
  const { diff, percentage } = variation

  const diffFormatted =
    type === 'currency'
      ? formatCurrency(Math.abs(diff))
      : `${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'unidade' : 'unidades'}`

  const sign = diff > 0 ? '+' : diff < 0 ? '-' : ''

  if (diff === 0) {
    return 'Sem alteração em relação ao período anterior'
  }

  if (percentage === null) {
    return `${sign}${diffFormatted} em relação ao período anterior (sem base anterior)`
  }

  return `${sign}${formatPercent(Math.abs(percentage))} (${sign}${diffFormatted}) vs. período anterior`
}

export function calculateAcceptanceRate(
  accepted: number,
  refused: number
): number {
  const total = accepted + refused
  if (total === 0) return 0
  return (accepted / total) * 100
}
