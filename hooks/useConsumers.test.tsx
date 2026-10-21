import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/consumers'
import { getSession, getToken } from '@/lib/auth/session'
import { apiError, consumer } from '@/test/fixtures'
import { renderHookWithProviders } from '@/test/render'

import { useLoginConsumer, useRegisterConsumer } from './useConsumers'

vi.mock('@/lib/api/consumers')

const registerRequest = {
  name: consumer.name,
  email: consumer.email,
  password: 'secret',
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useRegisterConsumer', () => {
  it('starts a CONSUMER session with the token and profile returned by the API', async () => {
    vi.mocked(api.registerConsumer).mockResolvedValue({
      consumer,
      token: 'consumer-jwt',
    })

    const { result } = renderHookWithProviders(() => useRegisterConsumer())
    await act(() => result.current.mutateAsync(registerRequest))

    expect(getToken()).toBe('consumer-jwt')
    expect(getSession()).toEqual({
      role: 'CONSUMER',
      id: consumer.id,
      name: consumer.name,
    })
  })

  it('does not start a session when the e-mail is already registered', async () => {
    vi.mocked(api.registerConsumer).mockRejectedValue(
      apiError(422, 'VALIDATION_ERROR', [
        {
          field: 'email',
          message: 'email already registered',
          code: 'EMAIL_ALREADY_EXISTS',
        },
      ])
    )

    const { result } = renderHookWithProviders(() => useRegisterConsumer())
    await act(() =>
      result.current.mutateAsync(registerRequest).catch(() => undefined)
    )

    await waitFor(() =>
      expect(result.current.error).toMatchObject({ status: 422 })
    )
    expect(getToken()).toBeUndefined()
  })
})

describe('useLoginConsumer', () => {
  it('drops data cached for a previous account and sets a CONSUMER session', async () => {
    vi.mocked(api.loginConsumer).mockResolvedValue({
      consumer,
      token: 'consumer-jwt',
    })

    const { result, queryClient } = renderHookWithProviders(() =>
      useLoginConsumer()
    )
    queryClient.setQueryData(['offer-orders', 'list'], [{ id: 1 }])
    await act(() =>
      result.current.mutateAsync({
        email: consumer.email,
        password: 'secret',
      })
    )

    expect(queryClient.getQueryData(['offer-orders', 'list'])).toBeUndefined()
    expect(getToken()).toBe('consumer-jwt')
    expect(getSession()).toEqual({
      role: 'CONSUMER',
      id: consumer.id,
      name: consumer.name,
    })
  })
})
