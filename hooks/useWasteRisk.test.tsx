import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/wasteRisks'
import { wasteRisk } from '@/test/fixtures'
import { renderHookWithProviders } from '@/test/render'

import { useProductWasteRisk, useWasteRisks } from './useWasteRisk'

vi.mock('@/lib/api/wasteRisks')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useWasteRisks', () => {
  it('lists with the requested filter', async () => {
    vi.mocked(api.listWasteRisks).mockResolvedValue([wasteRisk])

    const { result } = renderHookWithProviders(() => useWasteRisks(true))

    await waitFor(() => expect(result.current.data).toEqual([wasteRisk]))
    expect(api.listWasteRisks).toHaveBeenCalledWith({ atRiskOnly: true })
  })
})

describe('useProductWasteRisk', () => {
  it('exposes null when the product was never forecast', async () => {
    vi.mocked(api.getProductWasteRisk).mockResolvedValue(null)

    const { result } = renderHookWithProviders(() => useProductWasteRisk(10))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })
})
