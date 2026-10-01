import { describe, expect, it } from 'vitest'

import {
  calculateAcceptanceRate,
  calculateVariation,
  formatVariationText,
} from './format'

describe('calculateVariation', () => {
  it('calculates positive growth', () => {
    expect(calculateVariation(150, 100)).toEqual({
      diff: 50,
      percentage: 50,
    })
  })

  it('calculates negative decrease', () => {
    expect(calculateVariation(75, 100)).toEqual({
      diff: -25,
      percentage: -25,
    })
  })

  it('handles zero previous base', () => {
    expect(calculateVariation(50, 0)).toEqual({
      diff: 50,
      percentage: null,
    })
  })

  it('handles both zero', () => {
    expect(calculateVariation(0, 0)).toEqual({
      diff: 0,
      percentage: null,
    })
  })
})

describe('formatVariationText', () => {
  it('formats positive currency variation', () => {
    const text = formatVariationText({ diff: 50, percentage: 50 }, 'currency')
    expect(text).toContain('+50')
    expect(text).toContain('vs. período anterior')
  })

  it('formats negative units variation', () => {
    const text = formatVariationText({ diff: -10, percentage: -20 }, 'units')
    expect(text).toContain('-20')
    expect(text).toContain('10 unidades')
    expect(text).toContain('vs. período anterior')
  })

  it('formats zero diff', () => {
    expect(formatVariationText({ diff: 0, percentage: 0 }, 'units')).toBe(
      'Sem alteração em relação ao período anterior'
    )
  })
})

describe('calculateAcceptanceRate', () => {
  it('calculates rate with accepted and refused', () => {
    expect(calculateAcceptanceRate(8, 2)).toBe(80)
  })

  it('returns 0 when no recommendations were responded', () => {
    expect(calculateAcceptanceRate(0, 0)).toBe(0)
  })
})
