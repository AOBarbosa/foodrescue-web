import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/offers'
import { apiError, offer, product } from '@/test/fixtures'
import { renderHookWithProviders } from '@/test/render'

import {
  offerKeys,
  useCloseOffer,
  useCreateOffer,
  useOffers,
  useProductOffers,
} from './useOffers'

vi.mock('@/lib/api/offers')

const otherOffer = { ...offer, id: 56, productId: 99, productName: 'Bolo' }

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useOffers', () => {
  it('lists every offer of the establishment', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer, otherOffer])

    const { result } = renderHookWithProviders(() => useOffers())

    await waitFor(() =>
      expect(result.current.data).toEqual([offer, otherOffer])
    )
  })
})

describe('useProductOffers', () => {
  it('narrows the establishment list to one product, without fetching again', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer, otherOffer])

    const { result } = renderHookWithProviders(() =>
      useProductOffers(product.id)
    )

    await waitFor(() => expect(result.current.data).toEqual([offer]))
    expect(api.listOffers).toHaveBeenCalledTimes(1)
  })
})

describe('useCreateOffer', () => {
  it('caches the published offer and refreshes the list', async () => {
    vi.mocked(api.createOffer).mockResolvedValue(offer)

    const { result, queryClient } = renderHookWithProviders(() =>
      useCreateOffer()
    )
    queryClient.setQueryData(offerKeys.list(), [])
    await act(() => result.current.mutateAsync({ productId: product.id }))

    expect(queryClient.getQueryData(offerKeys.detail(offer.id))).toEqual(offer)
    expect(queryClient.getQueryState(offerKeys.list())?.isInvalidated).toBe(
      true
    )
    expect(api.createOffer).toHaveBeenCalledWith({ productId: product.id })
  })

  it('surfaces the 422 raised when the product already has an active offer', async () => {
    vi.mocked(api.createOffer).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'product 10 already has an active offer (id 55); close it before publishing another'
      )
    )

    const { result } = renderHookWithProviders(() => useCreateOffer())
    await act(async () => {
      await expect(
        result.current.mutateAsync({ productId: product.id })
      ).rejects.toMatchObject({ status: 422, code: 'BUSINESS_RULE_VIOLATION' })
    })
  })
})

describe('useCloseOffer', () => {
  it('caches the closed offer and refreshes the list', async () => {
    const closed = { ...offer, status: 'CLOSED' as const }
    vi.mocked(api.closeOffer).mockResolvedValue(closed)

    const { result, queryClient } = renderHookWithProviders(() =>
      useCloseOffer()
    )
    queryClient.setQueryData(offerKeys.list(), [offer])
    await act(() => result.current.mutateAsync(offer.id))

    expect(queryClient.getQueryData(offerKeys.detail(offer.id))).toEqual(closed)
    expect(queryClient.getQueryState(offerKeys.list())?.isInvalidated).toBe(
      true
    )
    expect(api.closeOffer).toHaveBeenCalledWith(offer.id)
  })
})
