import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { productKeys } from '@/hooks/useProducts'
import * as api from '@/lib/api/discountRecommendations'
import { apiError, discountRecommendation, product } from '@/test/fixtures'
import { renderHookWithProviders } from '@/test/render'

import {
  discountRecommendationKeys,
  usePendingRecommendations,
  useProductRecommendations,
  useRecommendDiscount,
  useRespondToRecommendation,
} from './useDiscountRecommendations'

vi.mock('@/lib/api/discountRecommendations')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useProductRecommendations', () => {
  it("lists the product's recommendation history", async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([
      discountRecommendation,
    ])

    const { result } = renderHookWithProviders(() =>
      useProductRecommendations(product.id)
    )

    await waitFor(() =>
      expect(result.current.data).toEqual([discountRecommendation])
    )
    expect(api.listProductRecommendations).toHaveBeenCalledWith(product.id)
  })
})

describe('usePendingRecommendations', () => {
  it("lists the establishment's pending recommendations", async () => {
    vi.mocked(api.listPendingRecommendations).mockResolvedValue([
      discountRecommendation,
    ])

    const { result } = renderHookWithProviders(() =>
      usePendingRecommendations()
    )

    await waitFor(() =>
      expect(result.current.data).toEqual([discountRecommendation])
    )
  })
})

describe('useRecommendDiscount', () => {
  it('refreshes the recommendations after asking for a discount', async () => {
    vi.mocked(api.recommendDiscount).mockResolvedValue(discountRecommendation)

    const { result, queryClient } = renderHookWithProviders(() =>
      useRecommendDiscount(product.id)
    )
    queryClient.setQueryData(discountRecommendationKeys.pending(), [])
    await act(() => result.current.mutateAsync())

    expect(api.recommendDiscount).toHaveBeenCalledWith(product.id)
    expect(
      queryClient.getQueryState(discountRecommendationKeys.pending())
        ?.isInvalidated
    ).toBe(true)
  })

  it('surfaces the 422 raised for a product that is not at risk', async () => {
    vi.mocked(api.recommendDiscount).mockRejectedValue(
      apiError(422, 'BUSINESS_RULE_VIOLATION')
    )

    const { result } = renderHookWithProviders(() =>
      useRecommendDiscount(product.id)
    )
    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toMatchObject({
        status: 422,
      })
    })
  })
})

describe('useRespondToRecommendation', () => {
  it('refreshes the product (its price changed) and the recommendations', async () => {
    vi.mocked(api.respondToRecommendation).mockResolvedValue({
      ...discountRecommendation,
      status: 'ACCEPTED',
      currentPrice: 6.93,
      respondedAt: '2026-09-26T16:00:00',
    })

    const { result, queryClient } = renderHookWithProviders(() =>
      useRespondToRecommendation()
    )
    queryClient.setQueryData(productKeys.detail(product.id), product)
    queryClient.setQueryData(productKeys.list(), [product])
    queryClient.setQueryData(discountRecommendationKeys.pending(), [
      discountRecommendation,
    ])

    await act(() =>
      result.current.mutateAsync({
        id: discountRecommendation.id,
        request: { decision: 'ACCEPT' },
      })
    )

    expect(api.respondToRecommendation).toHaveBeenCalledWith(
      discountRecommendation.id,
      { decision: 'ACCEPT' }
    )
    expect(
      queryClient.getQueryState(productKeys.detail(product.id))?.isInvalidated
    ).toBe(true)
    expect(queryClient.getQueryState(productKeys.list())?.isInvalidated).toBe(
      true
    )
    expect(
      queryClient.getQueryState(discountRecommendationKeys.pending())
        ?.isInvalidated
    ).toBe(true)
  })

  it('sends the adjusted percentage when the establishment changes it', async () => {
    vi.mocked(api.respondToRecommendation).mockResolvedValue({
      ...discountRecommendation,
      status: 'ADJUSTED',
      suggestedPercentage: 15,
    })

    const { result } = renderHookWithProviders(() =>
      useRespondToRecommendation()
    )
    await act(() =>
      result.current.mutateAsync({
        id: discountRecommendation.id,
        request: { decision: 'ADJUST', adjustedPercentage: 15 },
      })
    )

    expect(api.respondToRecommendation).toHaveBeenCalledWith(
      discountRecommendation.id,
      { decision: 'ADJUST', adjustedPercentage: 15 }
    )
  })
})
