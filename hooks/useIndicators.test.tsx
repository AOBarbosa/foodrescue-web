import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/indicators'
import { apiError, indicators } from '@/test/fixtures'
import { renderHookWithProviders } from '@/test/render'

import { useIndicators } from './useIndicators'

vi.mock('@/lib/api/indicators')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useIndicators', () => {
  it('retrieves indicators for the establishment', async () => {
    vi.mocked(api.getIndicators).mockResolvedValue(indicators)

    const { result } = renderHookWithProviders(() => useIndicators())

    await waitFor(() => expect(result.current.data).toEqual(indicators))
    expect(api.getIndicators).toHaveBeenCalledWith(undefined)
  })

  it('passes period parameters to the API', async () => {
    vi.mocked(api.getIndicators).mockResolvedValue(indicators)

    const params = { period: 'WEEK' as const, compare: true }
    const { result } = renderHookWithProviders(() => useIndicators(params))

    await waitFor(() => expect(result.current.data).toEqual(indicators))
    expect(api.getIndicators).toHaveBeenCalledWith(params)
  })

  it('surfaces an error when the query fails', async () => {
    vi.mocked(api.getIndicators).mockRejectedValue(
      apiError(500, 'INTERNAL_ERROR')
    )

    const { result } = renderHookWithProviders(() => useIndicators())

    await waitFor(() =>
      expect(result.current.error).toMatchObject({ status: 500 })
    )
  })
})
