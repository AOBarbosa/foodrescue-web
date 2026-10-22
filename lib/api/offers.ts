import type { ApiResponse } from '@/types/api'
import type { CreateOfferRequest, OfferDTO } from '@/types/offer'

import { apiClient, unwrap } from './client'

/*
 * UC08 and UC11. Every route here requires the ESTABLISHMENT role and only
 * reaches the authenticated establishment's own offers (someone else's → 404).
 * The consumer-facing `GET /offers/available` belongs to UC09 and is not here.
 */

/**
 * Publishes an offer manually. Omitted fields take the product's current
 * price, its whole stock and today's closing time.
 *
 * A product with no stock, a quantity above the stock, or a product that
 * already has an active offer is a `422 BUSINESS_RULE_VIOLATION`; a price
 * above the product's original price is a `422 VALIDATION_ERROR` carrying the
 * offending field.
 */
export async function createOffer(
  request: CreateOfferRequest
): Promise<OfferDTO> {
  return unwrap(await apiClient.post<ApiResponse<OfferDTO>>('/offers', request))
}

/** Every offer of the establishment, newest first. */
export async function listOffers(): Promise<OfferDTO[]> {
  return unwrap(await apiClient.get<ApiResponse<OfferDTO[]>>('/offers'))
}

export async function getOffer(id: number): Promise<OfferDTO> {
  return unwrap(await apiClient.get<ApiResponse<OfferDTO>>(`/offers/${id}`))
}

/**
 * UC11: highlights an active offer, which puts it ahead of the others in the
 * consumer listing (`OfferRankingPolicy`: priority first, then the closest
 * deadline). Marking is one-way — the backend has no route to undo it — and
 * marking an offer that is already highlighted succeeds without changing it.
 * An offer that is not active is a `422 BUSINESS_RULE_VIOLATION`.
 */
export async function markOfferAsPriority(id: number): Promise<OfferDTO> {
  return unwrap(
    await apiClient.patch<ApiResponse<OfferDTO>>(`/offers/${id}/priority`)
  )
}

/**
 * Closes an active offer before its deadline. An offer that is already closed
 * is a `422 BUSINESS_RULE_VIOLATION`.
 */
export async function closeOffer(id: number): Promise<OfferDTO> {
  return unwrap(
    await apiClient.patch<ApiResponse<OfferDTO>>(`/offers/${id}/close`)
  )
}
