import type { ApiResponse } from '@/types/api'
import type {
  DiscountRecommendationDTO,
  RespondToRecommendationRequest,
} from '@/types/discountRecommendation'

import { apiClient, unwrap } from './client'

/*
 * UC07. Every route requires the ESTABLISHMENT role and only reaches the
 * authenticated establishment's own products and recommendations (someone
 * else's → 404).
 */

/**
 * Asks for a discount on a product flagged at risk of waste (UC06). A product
 * that is not at risk, or that already has a pending recommendation, is a
 * `422 BUSINESS_RULE_VIOLATION`.
 */
export async function recommendDiscount(
  productId: number
): Promise<DiscountRecommendationDTO> {
  return unwrap(
    await apiClient.post<ApiResponse<DiscountRecommendationDTO>>(
      `/products/${productId}/discount-recommendations`
    )
  )
}

/** Every recommendation ever made for a product, newest first. */
export async function listProductRecommendations(
  productId: number
): Promise<DiscountRecommendationDTO[]> {
  return unwrap(
    await apiClient.get<ApiResponse<DiscountRecommendationDTO[]>>(
      `/products/${productId}/discount-recommendations`
    )
  )
}

/**
 * The establishment's recommendations still waiting for an answer, oldest
 * first. Reading this is what expires the stale ones on the backend.
 */
export async function listPendingRecommendations(): Promise<
  DiscountRecommendationDTO[]
> {
  return unwrap(
    await apiClient.get<ApiResponse<DiscountRecommendationDTO[]>>(
      '/discount-recommendations'
    )
  )
}

/**
 * Accepts, adjusts or refuses a pending recommendation. Accepting and
 * adjusting change the product's current price, so the cached product is
 * stale after this call.
 */
export async function respondToRecommendation(
  id: number,
  request: RespondToRecommendationRequest
): Promise<DiscountRecommendationDTO> {
  return unwrap(
    await apiClient.patch<ApiResponse<DiscountRecommendationDTO>>(
      `/discount-recommendations/${id}`,
      request
    )
  )
}
