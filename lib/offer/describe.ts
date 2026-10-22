import type { ChipProps } from '@mui/material'

import type { OfferDTO, OfferStatus } from '@/types/offer'

/**
 * What the UI shows for an offer. `EXPIRED` is not a backend status: an offer
 * past its deadline stays `ACTIVE` in the database until someone touches it
 * (the consumer side refuses to order it), so the panel has to tell the two
 * apart by itself.
 */
export type OfferDisplayStatus = OfferStatus | 'EXPIRED'

export const OFFER_STATUS_LABELS: Record<OfferDisplayStatus, string> = {
  ACTIVE: 'Ativa',
  EXPIRED: 'Prazo vencido',
  CLOSED: 'Encerrada',
}

export const OFFER_STATUS_COLORS: Record<
  OfferDisplayStatus,
  ChipProps['color']
> = {
  ACTIVE: 'success',
  EXPIRED: 'warning',
  CLOSED: 'default',
}

export function isExpired(offer: OfferDTO, now: Date = new Date()): boolean {
  return new Date(offer.expiresAt).getTime() <= now.getTime()
}

export function getOfferDisplayStatus(
  offer: OfferDTO,
  now: Date = new Date()
): OfferDisplayStatus {
  if (offer.status === 'CLOSED') return 'CLOSED'
  return isExpired(offer, now) ? 'EXPIRED' : 'ACTIVE'
}

/**
 * Whether a consumer could still order this offer — the same three conditions
 * the backend checks before taking units out of it.
 */
export function isOrderable(offer: OfferDTO, now: Date = new Date()): boolean {
  return (
    offer.status === 'ACTIVE' &&
    offer.availableQuantity > 0 &&
    !isExpired(offer, now)
  )
}

/**
 * UC11: whether highlighting the offer is worth offering. The backend only
 * refuses an offer that is not `ACTIVE`, but highlighting one that nobody can
 * order — already highlighted, past its deadline or sold out — changes
 * nothing a consumer would see, so the action is not offered for those.
 */
export function canBeHighlighted(
  offer: OfferDTO,
  now: Date = new Date()
): boolean {
  return !offer.priority && isOrderable(offer, now)
}

/**
 * Discount of the offer over the product's original price, as a percentage
 * (0–100, the scale `formatPercent` expects). `0` when there is no discount
 * to show.
 */
export function discountPercentage(offer: OfferDTO): number {
  if (offer.originalPrice <= 0) return 0
  const discount =
    ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
  return discount > 0 ? discount : 0
}

/**
 * Reads the offer id out of the backend's 422 ("product 10 already has an
 * active offer (id 55); close it before publishing another"). `null` when the
 * wording changes, so callers need a fallback.
 */
export function parseActiveOfferExists(message: string): number | null {
  const match = /already has an active offer \(id (\d+)\)/.exec(message)
  return match ? Number(match[1]) : null
}

/** True for the 422 raised when the product has no stock to offer. */
export function hasNoStockToOffer(message: string): boolean {
  return /has no stock to offer/.test(message)
}

/**
 * Reads the numbers out of the backend's 422 ("availableQuantity 20 exceeds
 * the product stock of 12"). `null` when the wording changes.
 */
export function parseQuantityAboveStock(
  message: string
): { quantity: number; stock: number } | null {
  const match =
    /availableQuantity (\d+) exceeds the product stock of (\d+)/.exec(message)
  if (!match) return null
  return { quantity: Number(match[1]), stock: Number(match[2]) }
}

/** True for the 422 raised when the offer being closed is no longer active. */
export function isNotActive(message: string): boolean {
  return /is not active: current status is/.test(message)
}
