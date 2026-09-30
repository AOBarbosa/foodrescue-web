import type { ForecastConfidence } from '@/types/demandForecast'

export const CONFIDENCE_LABELS: Record<ForecastConfidence, string> = {
  LOW: 'Confiança baixa',
  MEDIUM: 'Confiança média',
  HIGH: 'Confiança alta',
}

const STATISTICAL_SOURCE = 'weekday-hourly-average'

/** The backend records `gemini:<model>` when the AI produced the forecast. */
export function isAiSource(source: string): boolean {
  return source.startsWith('gemini')
}

export function describeSource(source: string): string {
  if (isAiSource(source)) return 'Calculada por IA (Gemini)'
  if (source === STATISTICAL_SOURCE) {
    return 'Calculada pela média de vendas do mesmo dia da semana'
  }
  return `Calculada por ${source}`
}

export type InsufficientHistory = {
  found: number
  weeks: number
  required: number
}

/**
 * Reads the numbers out of the backend's 422 message ("insufficient sales
 * history to forecast demand: 2 sales found in the last 4 weeks, at least 5
 * required"). `null` when the wording changes, so callers need a fallback.
 */
export function parseInsufficientHistory(
  message: string
): InsufficientHistory | null {
  const match =
    /(\d+) sales found in the last (\d+) weeks, at least (\d+) required/.exec(
      message
    )
  if (!match) return null
  const [, found, weeks, required] = match.map(Number)
  return { found, weeks, required }
}
