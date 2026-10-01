import { describe, expect, it } from 'vitest'

import {
  changedThePrice,
  isAlreadyPending,
  isNotPending,
  parseNotAtRisk,
  STATUS_LABELS,
} from './describe'

describe('STATUS_LABELS', () => {
  it('names every status the backend can return', () => {
    expect(Object.keys(STATUS_LABELS)).toEqual([
      'PENDING',
      'ACCEPTED',
      'ADJUSTED',
      'REFUSED',
      'EXPIRED',
    ])
  })
})

describe('changedThePrice', () => {
  it.each([
    ['ACCEPTED', true],
    ['ADJUSTED', true],
    ['REFUSED', false],
    ['EXPIRED', false],
    ['PENDING', false],
  ] as const)('%s → %s', (status, expected) => {
    expect(changedThePrice(status)).toBe(expected)
  })
})

describe('parseNotAtRisk', () => {
  it('reads the risk and the threshold out of the backend message', () => {
    expect(
      parseNotAtRisk(
        'product 7 is not at risk of waste: risk is 12.50%, threshold is 70%'
      )
    ).toEqual({ risk: 12.5, threshold: 70 })
  })

  it('returns null when the wording changes, so callers fall back', () => {
    expect(parseNotAtRisk('product 7 is fine')).toBeNull()
  })
})

describe('isAlreadyPending', () => {
  it('recognizes the 422 raised when one is still waiting for an answer', () => {
    expect(
      isAlreadyPending(
        'product 7 already has a pending discount recommendation (id 30)'
      )
    ).toBe(true)
    expect(isAlreadyPending('product 7 is not at risk of waste')).toBe(false)
  })
})

describe('isNotPending', () => {
  it('recognizes the 422 raised when it was already answered', () => {
    expect(
      isNotPending(
        'recommendation 30 is not pending: current status is REFUSED'
      )
    ).toBe(true)
    expect(isNotPending('decision must be informed')).toBe(false)
  })
})
