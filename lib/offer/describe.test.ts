import { describe, expect, it } from 'vitest'

import { offer } from '@/test/fixtures'

import {
  discountPercentage,
  getOfferDisplayStatus,
  hasNoStockToOffer,
  isExpired,
  isNotActive,
  isOrderable,
  parseActiveOfferExists,
  parseQuantityAboveStock,
} from './describe'

const NOW = new Date('2026-09-26T12:00:00')
const future = { ...offer, expiresAt: '2026-09-26T22:00:00' }
const past = { ...offer, expiresAt: '2026-09-26T11:00:00' }

describe('isExpired', () => {
  it('compares the deadline with the clock', () => {
    expect(isExpired(future, NOW)).toBe(false)
    expect(isExpired(past, NOW)).toBe(true)
  })

  it('treats the deadline itself as expired, like the backend', () => {
    expect(isExpired({ ...offer, expiresAt: '2026-09-26T12:00:00' }, NOW)).toBe(
      true
    )
  })
})

describe('getOfferDisplayStatus', () => {
  it('is ACTIVE while the deadline has not passed', () => {
    expect(getOfferDisplayStatus(future, NOW)).toBe('ACTIVE')
  })

  it('is EXPIRED for an offer the backend still has as ACTIVE', () => {
    expect(getOfferDisplayStatus(past, NOW)).toBe('EXPIRED')
  })

  it('is CLOSED regardless of the deadline', () => {
    expect(getOfferDisplayStatus({ ...past, status: 'CLOSED' }, NOW)).toBe(
      'CLOSED'
    )
    expect(getOfferDisplayStatus({ ...future, status: 'CLOSED' }, NOW)).toBe(
      'CLOSED'
    )
  })
})

describe('isOrderable', () => {
  it('requires an active, unexpired offer with units left', () => {
    expect(isOrderable(future, NOW)).toBe(true)
    expect(isOrderable(past, NOW)).toBe(false)
    expect(isOrderable({ ...future, status: 'CLOSED' }, NOW)).toBe(false)
    expect(isOrderable({ ...future, availableQuantity: 0 }, NOW)).toBe(false)
  })
})

describe('discountPercentage', () => {
  it('measures the discount against the original price', () => {
    expect(
      discountPercentage({ ...offer, originalPrice: 10, discountedPrice: 7 })
    ).toBe(30)
  })

  it('is zero when the offer carries no discount', () => {
    expect(
      discountPercentage({ ...offer, originalPrice: 10, discountedPrice: 10 })
    ).toBe(0)
  })

  it('never goes negative, nor divides by a zero price', () => {
    expect(
      discountPercentage({ ...offer, originalPrice: 10, discountedPrice: 12 })
    ).toBe(0)
    expect(
      discountPercentage({ ...offer, originalPrice: 0, discountedPrice: 5 })
    ).toBe(0)
  })
})

describe('parseActiveOfferExists', () => {
  it('reads the id of the offer blocking a new one', () => {
    expect(
      parseActiveOfferExists(
        'product 10 already has an active offer (id 55); close it before publishing another'
      )
    ).toBe(55)
  })

  it('is null for another message', () => {
    expect(
      parseActiveOfferExists('product 10 has no stock to offer')
    ).toBeNull()
  })
})

describe('hasNoStockToOffer', () => {
  it('recognizes the 422 raised for a product without stock', () => {
    expect(hasNoStockToOffer('product 10 has no stock to offer')).toBe(true)
    expect(
      hasNoStockToOffer('offer 55 is not active: current status is CLOSED')
    ).toBe(false)
  })
})

describe('parseQuantityAboveStock', () => {
  it('reads the requested quantity and the stock', () => {
    expect(
      parseQuantityAboveStock(
        'availableQuantity 20 exceeds the product stock of 12'
      )
    ).toEqual({ quantity: 20, stock: 12 })
  })

  it('is null for another message', () => {
    expect(
      parseQuantityAboveStock('product 10 has no stock to offer')
    ).toBeNull()
  })
})

describe('isNotActive', () => {
  it('recognizes the 422 raised when closing an offer that is not active', () => {
    expect(
      isNotActive('offer 55 is not active: current status is CLOSED')
    ).toBe(true)
    expect(isNotActive('offer 55 has expired at 2026-09-26T11:00')).toBe(false)
  })
})
