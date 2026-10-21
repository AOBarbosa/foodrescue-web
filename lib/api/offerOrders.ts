import type { ApiResponse } from '@/types/api'
import type { OfferDTO } from '@/types/offer'
import type { OfferOrderDTO, ReserveOfferRequest } from '@/types/offerOrder'

import { apiClient, unwrap } from './client'

/*
 * Every route here requires the CONSUMER role. `GET /offers/available` returns
 * active, non-expired offers with units left, sorted by OfferRankingPolicy
 * (priority first, then earliest expiration, then highest discount).
 */

export async function listAvailableOffers(): Promise<OfferDTO[]> {
  return unwrap(
    await apiClient.get<ApiResponse<OfferDTO[]>>('/offers/available')
  )
}

/**
 * Reserves units of an active offer for the authenticated consumer.
 *
 * - `422 BUSINESS_RULE_VIOLATION` when the requested quantity exceeds what is
 *   left, the offer has expired, or the offer is already closed.
 * - `409 OPTIMISTIC_LOCK_CONFLICT` when two simultaneous reservations compete
 *   for the same offer (`@Version`).
 */
export async function reserveOffer(
  request: ReserveOfferRequest
): Promise<OfferOrderDTO> {
  return unwrap(
    await apiClient.post<ApiResponse<OfferOrderDTO>>('/offer-orders', request)
  )
}

/** Reservations of the authenticated consumer, newest first. */
export async function listOfferOrders(): Promise<OfferOrderDTO[]> {
  return unwrap(
    await apiClient.get<ApiResponse<OfferOrderDTO[]>>('/offer-orders')
  )
}

export async function getOfferOrder(id: number): Promise<OfferOrderDTO> {
  return unwrap(
    await apiClient.get<ApiResponse<OfferOrderDTO>>(`/offer-orders/${id}`)
  )
}
