import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiError, demandForecast } from '@/test/fixtures'

import { apiClient } from './client'
import { getLatestDemandForecast, predictDemand } from './demandForecasts'

vi.mock('./client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./client')>()),
  apiClient: { get: vi.fn(), post: vi.fn() },
}))

const envelope = (data: unknown) => ({
  data: { data, message: 'ok', success: true, code: null },
})

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getLatestDemandForecast', () => {
  it('returns the latest forecast', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(envelope(demandForecast))

    await expect(getLatestDemandForecast(10)).resolves.toEqual(demandForecast)
    expect(apiClient.get).toHaveBeenCalledWith(
      '/products/10/demand-forecast/latest'
    )
  })

  it('returns null when the product was never forecast (404)', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      apiError(404, 'ENTITY_NOT_FOUND')
    )

    await expect(getLatestDemandForecast(10)).resolves.toBeNull()
  })

  it('rethrows any other error', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(apiError(500, 'INTERNAL_ERROR'))

    await expect(getLatestDemandForecast(10)).rejects.toMatchObject({
      status: 500,
    })
  })
})

describe('predictDemand', () => {
  it('posts to the product forecast route', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(envelope(demandForecast))

    await expect(predictDemand(10)).resolves.toEqual(demandForecast)
    expect(apiClient.post).toHaveBeenCalledWith('/products/10/demand-forecast')
  })
})
