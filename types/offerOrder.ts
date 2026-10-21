/** Mirrors `OfferOrderDTO`, `ReserveOfferRequest` and `OfferOrderStatus` in foodrescue-api (UC09). */

export const OFFER_ORDER_STATUSES = ['RESERVED', 'CANCELLED'] as const
export type OfferOrderStatus = (typeof OFFER_ORDER_STATUSES)[number]

export type ReserveOfferRequest = {
  offerId: number
  quantity: number
}

export type OfferOrderDTO = {
  id: number
  offerId: number
  productId: number
  productName: string
  consumerId: number
  quantity: number
  unitPrice: number
  /** `unitPrice * quantity`, calculated by the backend. */
  totalPrice: number
  status: OfferOrderStatus
  /** ISO local datetime */
  createdAt: string | null
}
