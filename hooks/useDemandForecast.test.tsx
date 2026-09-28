import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/demandForecasts'
import { demandForecast } from '@/test/fixtures'
import { renderHookWithProviders } from '@/test/render'

import {
  demandForecastKeys,
  useLatestDemandForecast,
  usePredictDemand,
} from './useDemandForecast'

vi.mock('@/lib/api/demandForecasts')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useLatestDemandForecast', () => {
  it('exposes null when there is no forecast yet', async () => {
    vi.mocked(api.getLatestDemandForecast).mockResolvedValue(null)

    const { result } = renderHookWithProviders(() =>
      useLatestDemandForecast(10)
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })
})

describe('usePredictDemand', () => {
  it('stores the new forecast as the latest one', async () => {
    vi.mocked(api.predictDemand).mockResolvedValue(demandForecast)

    const { result, queryClient } = renderHookWithProviders(() =>
      usePredictDemand(10)
    )
    await act(() => result.current.mutateAsync())

    expect(api.predictDemand).toHaveBeenCalledWith(10)
    expect(queryClient.getQueryData(demandForecastKeys.latest(10))).toEqual(
      demandForecast
    )
  })
})
