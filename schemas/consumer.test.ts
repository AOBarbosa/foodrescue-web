import { describe, expect, it } from 'vitest'

import {
  type RegisterConsumerFormValues,
  registerConsumerSchema,
  toRegisterConsumerRequest,
} from './consumer'

const valid: RegisterConsumerFormValues = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  password: 'secret',
}

function messages(values: RegisterConsumerFormValues) {
  const result = registerConsumerSchema.safeParse(values)
  return Object.fromEntries(
    (result.error?.issues ?? []).map((i) => [i.path.join('.'), i.message])
  )
}

describe('registerConsumerSchema', () => {
  it('accepts valid consumer registration values', () => {
    expect(messages(valid)).toEqual({})
  })

  it('requires name, email and password', () => {
    expect(
      messages({
        name: '   ',
        email: '',
        password: '',
      })
    ).toEqual({
      name: 'Informe seu nome.',
      email: 'Informe o e-mail.',
      password: 'Informe a senha.',
    })
  })

  it('rejects an invalid email format', () => {
    expect(messages({ ...valid, email: 'nao-e-um-email' })).toEqual({
      email: 'E-mail inválido.',
    })
  })
})

describe('toRegisterConsumerRequest', () => {
  it('returns the registration payload', () => {
    expect(toRegisterConsumerRequest(valid)).toEqual(valid)
  })
})
