/** Mirrors `WasteRiskDTO` (UC06). */
export type WasteRiskDTO = {
  productId: number
  productName: string
  /** Current stock (read now, not at the forecast's calculation). */
  stockQuantity: number
  /** Units the latest forecast expects to be sold until closing time. */
  predictedQuantity: number
  /** Units expected to be left over at closing time; never negative. */
  expectedSurplus: number
  /** Between 0 and 100. */
  riskPercentage: number
  /** Percentage above which the backend flags the product. */
  riskThreshold: number
  atRisk: boolean
  forecastId: number
  /** ISO local datetime */
  forecastCalculatedAt: string
}
