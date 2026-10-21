/** Mirrors `OfferDTO` and `CreateOfferRequest` in foodrescue-api (UC08). */

export type OfferStatus = 'ACTIVE' | 'CLOSED'

export type OfferDTO = {
  id: number
  productId: number
  productName: string
  /** The product's list price, shown as the "from" price. */
  originalPrice: number
  /** What the consumer pays. */
  discountedPrice: number
  /** Units still available in this offer. */
  availableQuantity: number
  /** ISO local datetime; the moment the offer stops accepting orders. */
  expiresAt: string
  status: OfferStatus
  /** Highlighted offer; only set from UC11 on. */
  priority: boolean
  /** ISO local datetime */
  createdAt: string | null
}

/**
 * Only the product is required: the backend falls back to the product's
 * current price, to its whole stock and to today's closing time, the same way
 * `RegisterSaleRequest` falls back to the current price in UC04.
 */
export type CreateOfferRequest = {
  productId: number
  discountedPrice?: number
  availableQuantity?: number
  /** ISO local datetime */
  expiresAt?: string
}
