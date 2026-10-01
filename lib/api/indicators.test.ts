import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiError, indicators } from '@/test/fixtures'

import { apiClient } from './client'
import { getIndicators } from './indicators'

vi.mock('./client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./client')>()),
  apiClient: { get: vi.fn() },
}))

const envelope = (data: unknown) => ({
  data: { data, message: 'ok', success: true, code: null },
})

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getIndicators', () => {
  it('retrieves indicators with default params', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(envelope(indicators))

    await expect(getIndicators()).resolves.toEqual(indicators)
    expect(apiClient.get).toHaveBeenCalledWith('/indicators', {
      params: undefined,
    })
  })

  it('passes period, custom dates and compare flag to the API', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(envelope(indicators))

    const params = {
      period: 'CUSTOM' as const,
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      compare: true,
    }

    await expect(getIndicators(params)).resolves.toEqual(indicators)
    expect(apiClient.get).toHaveBeenCalledWith('/indicators', {
      params,
    })
  })

  it('propagates errors when the backend fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      apiError(422, 'BUSINESS_RULE_VIOLATION', [], 'startDate after endDate')
    )

    await expect(
      getIndicators({ startDate: '2026-09-20', endDate: '2026-09-10' })
    ).rejects.toMatchObject({
      status: 422,
      code: 'BUSINESS_RULE_VIOLATION',
    })
  })
})
