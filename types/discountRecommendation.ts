/** Mirrors `DiscountRecommendationDTO` and the recommendation enums (UC07). */

export const RECOMMENDATION_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'ADJUSTED',
  'REFUSED',
  'EXPIRED',
] as const

export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number]

/** `SURPLUS_DESTINATION` belongs to UC10; UC07 only produces `DISCOUNT`. */
export type RecommendationType = 'DISCOUNT' | 'SURPLUS_DESTINATION'

export type RecommendationDecision = 'ACCEPT' | 'ADJUST' | 'REFUSE'

export type DiscountRecommendationDTO = {
  id: number
  productId: number
  productName: string
  type: RecommendationType
  /** 0–100, not 0–1. */
  suggestedPercentage: number
  status: RecommendationStatus
  originalPrice: number
  currentPrice: number
  /**
   * `originalPrice` with the suggested discount applied. The backend always
   * discounts the original price, so answering twice never compounds.
   */
  priceWithDiscount: number
  /** ISO local datetime */
  createdAt: string
  /** ISO local datetime; `null` while the record has no creation date yet. */
  expiresAt: string | null
  /** ISO local datetime; `null` while the recommendation is pending. */
  respondedAt: string | null
}

export type RespondToRecommendationRequest = {
  decision: RecommendationDecision
  /** Required when `decision` is `ADJUST`; between 0 and 100. */
  adjustedPercentage?: number
}
