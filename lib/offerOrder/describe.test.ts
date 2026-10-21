import { describe, expect, it } from 'vitest'

import { apiError } from '@/test/fixtures'

import {
  describeReserveOfferError,
  isOfferExpired,
  isOfferNotActive,
  offerDiscountPercent,
  ORDER_STATUS_LABELS,
  parseOnlyUnitsLeft,
} from './describe'

describe('ORDER_STATUS_LABELS', () => {
  it('names every status the backend can return', () => {
    expect(Object.keys(ORDER_STATUS_LABELS)).toEqual(['RESERVED', 'CANCELLED'])
  })
})

describe('offerDiscountPercent', () => {
  it('computes the discount relative to the original price', () => {
    expect(
      offerDiscountPercent({ originalPrice: 20, discountedPrice: 15 })
    ).toBe(25)
  })

  it('returns 0 when there is no price reduction', () => {
    expect(
      offerDiscountPercent({ originalPrice: 10, discountedPrice: 10 })
    ).toBe(0)
    expect(offerDiscountPercent({ originalPrice: 0, discountedPrice: 5 })).toBe(
      0
    )
  })
})

describe('parseOnlyUnitsLeft', () => {
  it('extracts the remaining units from the backend 422 message', () => {
    expect(parseOnlyUnitsLeft('offer 700 has only 2 units left')).toBe(2)
    expect(parseOnlyUnitsLeft('offer 700 has expired')).toBeNull()
  })
})

describe('isOfferExpired & isOfferNotActive', () => {
  it('recognizes expired and closed offer 422 messages', () => {
    expect(isOfferExpired('offer 700 has expired at 2026-09-26T22:00')).toBe(
      true
    )
    expect(isOfferExpired('offer 700 has only 1 units left')).toBe(false)

    expect(
      isOfferNotActive('offer 700 is not active: current status is CLOSED')
    ).toBe(true)
    expect(isOfferNotActive('offer 700 has expired')).toBe(false)
  })
})

describe('describeReserveOfferError', () => {
  it('describes 409 optimistic lock conflict (two simultaneous reservations)', () => {
    const result = describeReserveOfferError(
      apiError(409, 'OPTIMISTIC_LOCK_CONFLICT')
    )
    expect(result).toEqual({
      formError:
        'Outro consumidor reservou esta oferta ao mesmo tempo. A disponibilidade foi atualizada — confira a quantidade restante e tente novamente.',
      shouldRefetchOffers: true,
    })
  })

  it('describes 422 when requested quantity exceeds remaining units', () => {
    const result = describeReserveOfferError(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'offer 700 has only 2 units left'
      )
    )
    expect(result).toEqual({
      fieldError: 'Quantidade indisponível.',
      formError:
        'Quantidade indisponível para esta reserva: restam 2 unidades na oferta.',
      shouldRefetchOffers: true,
    })
  })

  it('describes 422 when the offer expired before confirmation', () => {
    const result = describeReserveOfferError(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'offer 700 has expired at 2026-09-26T22:00'
      )
    )
    expect(result).toEqual({
      formError:
        'Esta oferta expirou antes da confirmação da reserva. A lista de ofertas foi atualizada.',
      shouldRefetchOffers: true,
    })
  })

  it('describes 422 when the offer is already closed', () => {
    const result = describeReserveOfferError(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'offer 700 is not active: current status is CLOSED'
      )
    )
    expect(result).toEqual({
      formError:
        'Esta oferta já foi encerrada e não aceita novas reservas. A lista de ofertas foi atualizada.',
      shouldRefetchOffers: true,
    })
  })

  it('returns null for validation errors so applyServerErrors can map sub-errors', () => {
    expect(
      describeReserveOfferError(apiError(422, 'VALIDATION_ERROR'))
    ).toBeNull()
  })
})
