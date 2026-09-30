import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiError, wasteRisk } from '@/test/fixtures'

import { apiClient } from './client'
import { getProductWasteRisk, listWasteRisks } from './wasteRisks'

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

describe('listWasteRisks', () => {
  it('passes the at-risk-only filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(envelope([wasteRisk]))

    await expect(listWasteRisks({ atRiskOnly: false })).resolves.toEqual([
      wasteRisk,
    ])
    expect(apiClient.get).toHaveBeenCalledWith('/waste-risks', {
      params: { atRiskOnly: false },
    })
  })
})

describe('getProductWasteRisk', () => {
  it("returns the product's risk", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(envelope(wasteRisk))

    await expect(getProductWasteRisk(10)).resolves.toEqual(wasteRisk)
    expect(apiClient.get).toHaveBeenCalledWith('/products/10/waste-risk')
  })

  it('returns null when the product was never forecast (404)', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      apiError(404, 'ENTITY_NOT_FOUND')
    )

    await expect(getProductWasteRisk(10)).resolves.toBeNull()
  })

  it('rethrows any other error', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(apiError(500, 'INTERNAL_ERROR'))

    await expect(getProductWasteRisk(10)).rejects.toMatchObject({
      status: 500,
    })
  })
})
