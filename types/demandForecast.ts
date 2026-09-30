export const FORECAST_CONFIDENCES = ['LOW', 'MEDIUM', 'HIGH'] as const

export type ForecastConfidence = (typeof FORECAST_CONFIDENCES)[number]

/** Mirrors `DemandForecastResponse` (UC05). */
export type DemandForecastDTO = {
  id: number
  productId: number
  /** Units expected to be sold from the calculation until closing time. */
  predictedQuantity: number
  /** Stock at the moment of the calculation (not necessarily the current one). */
  stockQuantity: number
  confidence: ForecastConfidence
  /** Past sales considered in the calculation. */
  sampleSize: number
  /** `weekday-hourly-average` (statistics) or `gemini:<model>` (AI). */
  source: string
  /** AI explanation, in Portuguese; `null` for the statistical strategy. */
  rationale: string | null
  /** ISO local datetime */
  calculatedAt: string
  /** ISO local datetime: closing time of the day the forecast refers to. */
  forecastUntil: string
}
