import { describe, expect, it } from 'vitest'

import {
  type ReserveOfferFormValues,
  reserveOfferSchema,
  toReserveOfferRequest,
} from './offerOrder'

const AVAILABLE = 6
const schema = reserveOfferSchema(AVAILABLE)

const valid: ReserveOfferFormValues = { quantity: '2' }

function messages(values: ReserveOfferFormValues) {
  const result = schema.safeParse(values)
  return Object.fromEntries(
    (result.error?.issues ?? []).map((i) => [i.path.join('.'), i.message])
  )
}

describe('reserveOfferSchema', () => {
  it('accepts a positive integer up to the available quantity', () => {
    expect(messages(valid)).toEqual({})
    expect(messages({ quantity: String(AVAILABLE) })).toEqual({})
  })

  it('requires the quantity', () => {
    expect(messages({ quantity: ' ' })).toEqual({
      quantity: 'Informe a quantidade desejada.',
    })
  })

  it('rejects a fractional or non-numeric quantity', () => {
    expect(messages({ quantity: '1,5' })).toEqual({
      quantity: 'Informe um número inteiro.',
    })
    expect(messages({ quantity: 'duas' })).toEqual({
      quantity: 'Informe um número inteiro.',
    })
  })

  it.each(['0', '-1'])('rejects quantity %s (must be > 0)', (quantity) => {
    expect(messages({ quantity })).toEqual({
      quantity: 'A quantidade deve ser maior que zero.',
    })
  })

  it('rejects a quantity above the available units (UC09 alternative flow)', () => {
    expect(messages({ quantity: String(AVAILABLE + 1) })).toEqual({
      quantity: 'Quantidade indisponível: há 6 unidades disponíveis na oferta.',
    })

    const singleUnitSchema = reserveOfferSchema(1)
    const singleResult = singleUnitSchema.safeParse({ quantity: '2' })
    expect(singleResult.error?.issues[0]?.message).toBe(
      'Quantidade indisponível: há 1 unidade disponível na oferta.'
    )
  })
})

describe('toReserveOfferRequest', () => {
  it('converts the quantity to a number and attaches the offerId', () => {
    expect(toReserveOfferRequest(700, { quantity: '3' })).toEqual({
      offerId: 700,
      quantity: 3,
    })
  })
})
