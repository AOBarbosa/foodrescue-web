import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatCurrency } from '@/lib/format'

import {
  createOfferSchema,
  type OfferFormValues,
  toCreateOfferRequest,
} from './offer'

const PRODUCT = { originalPrice: 9.9, stockQuantity: 12 }
const schema = createOfferSchema(PRODUCT)

const empty: OfferFormValues = {
  discountedPrice: '',
  availableQuantity: '',
  expiresAt: '',
}

function messages(values: OfferFormValues) {
  const result = schema.safeParse(values)
  return Object.fromEntries(
    (result.error?.issues ?? []).map((i) => [i.path.join('.'), i.message])
  )
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 8, 24, 12))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createOfferSchema', () => {
  it('accepts an empty form: every field falls back to a backend default', () => {
    expect(messages(empty)).toEqual({})
  })

  it('accepts a price, a quantity within the stock and a future deadline', () => {
    expect(
      messages({
        discountedPrice: '6,93',
        availableQuantity: '5',
        expiresAt: '2026-09-24T22:00',
      })
    ).toEqual({})
  })

  it('rejects a price that is not a number', () => {
    expect(messages({ ...empty, discountedPrice: 'grátis' })).toEqual({
      discountedPrice: 'Informe um valor como 9,90.',
    })
  })

  it.each(['0', '-1'])('rejects price %s (must be > 0)', (discountedPrice) => {
    expect(messages({ ...empty, discountedPrice })).toEqual({
      discountedPrice: 'O preço deve ser maior que zero.',
    })
  })

  it('rejects a price above the product original price', () => {
    expect(messages({ ...empty, discountedPrice: '10,00' })).toEqual({
      // `formatCurrency` separates with a non-breaking space.
      discountedPrice: `O preço da oferta não pode passar de ${formatCurrency(9.9)} (preço original).`,
    })
  })

  it('accepts a price equal to the original price (an offer without discount)', () => {
    expect(messages({ ...empty, discountedPrice: '9,90' })).toEqual({})
  })

  it('rejects a fractional quantity', () => {
    expect(messages({ ...empty, availableQuantity: '1,5' })).toEqual({
      availableQuantity: 'Informe um número inteiro.',
    })
  })

  it.each(['0', '-3'])(
    'rejects quantity %s (must be > 0)',
    (availableQuantity) => {
      expect(messages({ ...empty, availableQuantity })).toEqual({
        availableQuantity: 'A quantidade deve ser maior que zero.',
      })
    }
  )

  it('rejects a quantity above the stock', () => {
    expect(messages({ ...empty, availableQuantity: '13' })).toEqual({
      availableQuantity: 'Estoque insuficiente: há 12 unidades disponíveis.',
    })
  })

  it('accepts a quantity equal to the whole stock', () => {
    expect(messages({ ...empty, availableQuantity: '12' })).toEqual({})
  })

  it('rejects an invalid deadline', () => {
    expect(messages({ ...empty, expiresAt: '24/09/2026' })).toEqual({
      expiresAt: 'Data e hora inválidas.',
    })
  })

  it('rejects a deadline in the past', () => {
    expect(messages({ ...empty, expiresAt: '2026-09-24T09:00' })).toEqual({
      expiresAt: 'O prazo da oferta precisa estar no futuro.',
    })
  })

  it('reports one message per field at once', () => {
    expect(
      messages({
        discountedPrice: '0',
        availableQuantity: '99',
        expiresAt: '2026-09-01T10:00',
      })
    ).toEqual({
      discountedPrice: 'O preço deve ser maior que zero.',
      availableQuantity: 'Estoque insuficiente: há 12 unidades disponíveis.',
      expiresAt: 'O prazo da oferta precisa estar no futuro.',
    })
  })

  it('agrees the message with a single unit left in stock', () => {
    expect(
      createOfferSchema({ originalPrice: 9.9, stockQuantity: 1 }).safeParse({
        ...empty,
        availableQuantity: '2',
      }).error?.issues[0].message
    ).toBe('Estoque insuficiente: há 1 unidade disponível.')
  })
})

describe('toCreateOfferRequest', () => {
  it('sends only the product when nothing was informed', () => {
    expect(toCreateOfferRequest(10, empty)).toEqual({ productId: 10 })
  })

  it('normalizes the price and the quantity, and adds the seconds the backend wants', () => {
    expect(
      toCreateOfferRequest(10, {
        discountedPrice: '6,93',
        availableQuantity: '5',
        expiresAt: '2026-09-24T22:00',
      })
    ).toEqual({
      productId: 10,
      discountedPrice: 6.93,
      availableQuantity: 5,
      expiresAt: '2026-09-24T22:00:00',
    })
  })

  it('keeps a deadline that already carries the seconds', () => {
    expect(
      toCreateOfferRequest(10, { ...empty, expiresAt: '2026-09-24T22:00:30' })
    ).toEqual({ productId: 10, expiresAt: '2026-09-24T22:00:30' })
  })
})
