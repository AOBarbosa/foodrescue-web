import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  registerSaleSchema,
  type SaleFormValues,
  toRegisterSaleRequest,
} from './sale'

const STOCK = 12
const schema = registerSaleSchema(STOCK)

const valid: SaleFormValues = { quantity: '3', unitPrice: '', soldAt: '' }

function messages(values: SaleFormValues) {
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

describe('registerSaleSchema', () => {
  it('accepts only the quantity: price and date are optional', () => {
    expect(messages(valid)).toEqual({})
  })

  it('accepts an informed price and a past sale date', () => {
    expect(
      messages({
        quantity: '1',
        unitPrice: '12,50',
        soldAt: '2026-09-24T09:00',
      })
    ).toEqual({})
  })

  it('requires the quantity', () => {
    expect(messages({ ...valid, quantity: ' ' })).toEqual({
      quantity: 'Informe a quantidade vendida.',
    })
  })

  it.each(['0', '-2'])('rejects quantity %s (must be > 0)', (quantity) => {
    expect(messages({ ...valid, quantity })).toEqual({
      quantity: 'A quantidade deve ser maior que zero.',
    })
  })

  it('rejects a fractional quantity', () => {
    expect(messages({ ...valid, quantity: '1,5' })).toEqual({
      quantity: 'Informe um número inteiro.',
    })
  })

  it('rejects a quantity above the available stock (UC04 alternative flow)', () => {
    expect(messages({ ...valid, quantity: String(STOCK + 1) })).toEqual({
      quantity: 'Estoque insuficiente: há 12 unidades disponíveis.',
    })
    expect(messages({ ...valid, quantity: String(STOCK) })).toEqual({})
  })

  it('rejects a non-positive or non-numeric price', () => {
    expect(messages({ ...valid, unitPrice: '0' })).toEqual({
      unitPrice: 'O preço deve ser maior que zero.',
    })
    expect(messages({ ...valid, unitPrice: 'dez reais' })).toEqual({
      unitPrice: 'Informe um valor como 9,90.',
    })
  })

  it('rejects a sale in the future', () => {
    expect(messages({ ...valid, soldAt: '2026-09-24T12:01' })).toEqual({
      soldAt: 'A venda não pode estar no futuro.',
    })
  })
})

describe('toRegisterSaleRequest', () => {
  it('omits the optional fields when they are empty', () => {
    expect(toRegisterSaleRequest(10, valid)).toEqual({
      productId: 10,
      quantity: 3,
    })
  })

  it('sends the price as a number and the date with seconds', () => {
    expect(
      toRegisterSaleRequest(10, {
        quantity: '2',
        unitPrice: '12,50',
        soldAt: '2026-09-24T09:00',
      })
    ).toEqual({
      productId: 10,
      quantity: 2,
      unitPrice: 12.5,
      soldAt: '2026-09-24T09:00:00',
    })
  })
})
