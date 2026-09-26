import { describe, expect, it } from 'vitest'

import {
  describeSource,
  isAiSource,
  parseInsufficientHistory,
} from './describe'

describe('parseInsufficientHistory', () => {
  it('reads the numbers from the backend 422 message', () => {
    expect(
      parseInsufficientHistory(
        'insufficient sales history to forecast demand: 2 sales found in the last 4 weeks, at least 5 required'
      )
    ).toEqual({ found: 2, weeks: 4, required: 5 })
  })

  it('returns null for any other wording', () => {
    expect(parseInsufficientHistory('something else')).toBeNull()
  })
})

describe('describeSource', () => {
  it('names the AI and the statistical strategy', () => {
    expect(isAiSource('gemini:gemini-3.8-flash')).toBe(true)
    expect(describeSource('gemini:gemini-3.8-flash')).toBe(
      'Calculada por IA (Gemini)'
    )
    expect(isAiSource('weekday-hourly-average')).toBe(false)
    expect(describeSource('weekday-hourly-average')).toBe(
      'Calculada pela média de vendas do mesmo dia da semana'
    )
  })

  it('falls back to the raw source for unknown strategies', () => {
    expect(describeSource('prophet')).toBe('Calculada por prophet')
  })
})
