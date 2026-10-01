/**
 * Mirrors `IndicatorPeriod`, `PeriodDTO` and `WasteAndSavingsIndicatorsDTO`
 * in foodrescue-api (UC12).
 */

export type IndicatorPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'CUSTOM'

export type PeriodDTO = {
  /** ISO date string YYYY-MM-DD */
  startDate: string
  /** ISO date string YYYY-MM-DD */
  endDate: string
}

export type WasteAndSavingsIndicatorsDTO = {
  period: PeriodDTO
  wasteAvoidedUnits: number
  recoveredRevenue: number
  acceptedRecommendations: number
  refusedRecommendations: number
  adjustedRecommendations: number
  comparisonPeriod: WasteAndSavingsIndicatorsDTO | null
}

export type GetIndicatorsParams = {
  period?: IndicatorPeriod
  /** ISO date string YYYY-MM-DD */
  startDate?: string
  /** ISO date string YYYY-MM-DD */
  endDate?: string
  compare?: boolean
}
