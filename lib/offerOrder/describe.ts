import type { ChipProps } from '@mui/material'

import { AppError } from '@/lib/api/errors'
import type { OfferDTO } from '@/types/offer'
import type { OfferOrderStatus } from '@/types/offerOrder'

export const ORDER_STATUS_LABELS: Record<OfferOrderStatus, string> = {
  RESERVED: 'Reservado',
  CANCELLED: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OfferOrderStatus, ChipProps['color']> =
  {
    RESERVED: 'success',
    CANCELLED: 'default',
  }

/**
 * Discount percentage (0–100) of an offer relative to the product's original
 * price. `0` when the offer carries no price reduction or `originalPrice <= 0`.
 */
export function offerDiscountPercent(
  offer: Pick<OfferDTO, 'originalPrice' | 'discountedPrice'>
): number {
  if (
    offer.originalPrice <= 0 ||
    offer.discountedPrice >= offer.originalPrice
  ) {
    return 0
  }
  return (
    ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
  )
}

/**
 * Reads the remaining units out of the backend's 422 ("offer 700 has only 2
 * units left"). `null` when the message is about something else.
 */
export function parseOnlyUnitsLeft(message: string): number | null {
  const match = /has only (\d+) units left/.exec(message)
  return match ? Number(match[1]) : null
}

/** True for the 422 raised when `expiresAt` passed before the reservation. */
export function isOfferExpired(message: string): boolean {
  return /has expired/.test(message)
}

/** True for the 422 raised when the offer was already `CLOSED`. */
export function isOfferNotActive(message: string): boolean {
  return /is not active: current status is/.test(message)
}

export type ReserveErrorDescription = {
  fieldError?: string
  formError: string
  shouldRefetchOffers: boolean
}

/**
 * Translates the domain failures of `POST /offer-orders` (422 business rules
 * and 409 optimistic locking conflict) into pt-BR copy. Returns `null` when
 * the error should be handled by the generic `applyServerErrors` path.
 */
export function describeReserveOfferError(
  error: unknown
): ReserveErrorDescription | null {
  if (!(error instanceof AppError)) return null

  if (error.code === 'OPTIMISTIC_LOCK_CONFLICT') {
    return {
      formError:
        'Outro consumidor reservou esta oferta ao mesmo tempo. A disponibilidade foi atualizada — confira a quantidade restante e tente novamente.',
      shouldRefetchOffers: true,
    }
  }

  if (error.code === 'ENTITY_NOT_FOUND') {
    return {
      formError: 'Esta oferta não está mais disponível.',
      shouldRefetchOffers: true,
    }
  }

  if (error.code !== 'BUSINESS_RULE_VIOLATION') return null

  const unitsLeft = parseOnlyUnitsLeft(error.message)
  if (unitsLeft !== null) {
    const label =
      unitsLeft === 1 ? 'resta 1 unidade' : `restam ${unitsLeft} unidades`
    return {
      fieldError: 'Quantidade indisponível.',
      formError: `Quantidade indisponível para esta reserva: ${label} na oferta.`,
      shouldRefetchOffers: true,
    }
  }

  if (isOfferExpired(error.message)) {
    return {
      formError:
        'Esta oferta expirou antes da confirmação da reserva. A lista de ofertas foi atualizada.',
      shouldRefetchOffers: true,
    }
  }

  if (isOfferNotActive(error.message)) {
    return {
      formError:
        'Esta oferta já foi encerrada e não aceita novas reservas. A lista de ofertas foi atualizada.',
      shouldRefetchOffers: true,
    }
  }

  return {
    formError:
      'Não foi possível concluir a reserva. A lista de ofertas foi atualizada — confira a disponibilidade.',
    shouldRefetchOffers: true,
  }
}
