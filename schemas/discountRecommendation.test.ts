import { describe, expect, it } from 'vitest'

import {
  type AdjustRecommendationFormValues,
  adjustRecommendationSchema,
  parsePercentage,
  toAdjustRequest,
} from './discountRecommendation'

function messages(values: AdjustRecommendationFormValues) {
  const result = adjustRecommendationSchema.safeParse(values)
  return Object.fromEntries(
    (result.error?.issues ?? []).map((i) => [i.path.join('.'), i.message])
  )
}

describe('parsePercentage', () => {
  it.each([
    ['15', 15],
    ['12,5', 12.5],
    ['12.5', 12.5],
    ['0', 0],
    ['100', 100],
  ])('parses %s', (input, expected) => {
    expect(parsePercentage(input)).toBe(expected)
  })

  it.each(['', 'quinze', '12,555', '1,2,3'])('rejects %s', (input) => {
    expect(parsePercentage(input)).toBeNull()
  })
})

describe('adjustRecommendationSchema', () => {
  it('accepts a percentage inside the range the backend allows', () => {
    expect(messages({ adjustedPercentage: '15' })).toEqual({})
    expect(messages({ adjustedPercentage: '0' })).toEqual({})
    expect(messages({ adjustedPercentage: '100' })).toEqual({})
  })

  it('requires the percentage', () => {
    expect(messages({ adjustedPercentage: ' ' })).toEqual({
      adjustedPercentage: 'Informe o percentual de desconto.',
    })
  })

  it('rejects a non-numeric percentage', () => {
    expect(messages({ adjustedPercentage: 'quinze' })).toEqual({
      adjustedPercentage: 'Informe um valor como 15.',
    })
  })

  it('mirrors the backend bounds (0 to 100)', () => {
    expect(messages({ adjustedPercentage: '-1' })).toEqual({
      adjustedPercentage: 'O desconto não pode ser negativo.',
    })
    expect(messages({ adjustedPercentage: '101' })).toEqual({
      adjustedPercentage: 'O desconto não pode passar de 100%.',
    })
  })
})

describe('toAdjustRequest', () => {
  it('sends the ADJUST decision with the percentage as a number', () => {
    expect(toAdjustRequest({ adjustedPercentage: '12,5' })).toEqual({
      decision: 'ADJUST',
      adjustedPercentage: 12.5,
    })
  })
})
