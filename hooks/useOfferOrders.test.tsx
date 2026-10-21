import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/offerOrders'
import { apiError, availableOffer, offerOrder } from '@/test/fixtures'
import { renderHookWithProviders } from '@/test/render'

import {
  offerOrderKeys,
  useAvailableOffers,
  useOfferOrder,
  useOfferOrders,
  useReserveOffer,
} from './useOfferOrders'

vi.mock('@/lib/api/offerOrders')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useAvailableOffers', () => {
  it('lists the active offers available to order', async () => {
    vi.mocked(api.listAvailableOffers).mockResolvedValue([availableOffer])

    const { result } = renderHookWithProviders(() => useAvailableOffers())

    await waitFor(() => expect(result.current.data).toEqual([availableOffer]))
    expect(api.listAvailableOffers).toHaveBeenCalledOnce()
  })
})

describe('useOfferOrders & useOfferOrder', () => {
  it('lists the reservations of the authenticated consumer', async () => {
    vi.mocked(api.listOfferOrders).mockResolvedValue([offerOrder])

    const { result } = renderHookWithProviders(() => useOfferOrders())

    await waitFor(() => expect(result.current.data).toEqual([offerOrder]))
    expect(api.listOfferOrders).toHaveBeenCalledOnce()
  })

  it('fetches a specific reservation when id is provided', async () => {
    vi.mocked(api.getOfferOrder).mockResolvedValue(offerOrder)

    const { result } = renderHookWithProviders(() =>
      useOfferOrder(offerOrder.id)
    )

    await waitFor(() => expect(result.current.data).toEqual(offerOrder))
    expect(api.getOfferOrder).toHaveBeenCalledWith(offerOrder.id)
  })
})

describe('useReserveOffer', () => {
  it('invalidates available offers and the consumer order list on success', async () => {
    vi.mocked(api.reserveOffer).mockResolvedValue(offerOrder)

    const { result, queryClient } = renderHookWithProviders(() =>
      useReserveOffer()
    )
    queryClient.setQueryData(offerOrderKeys.availableOffers(), [availableOffer])
    queryClient.setQueryData(offerOrderKeys.list(), [])

    await act(() =>
      result.current.mutateAsync({
        offerId: availableOffer.id,
        quantity: 2,
      })
    )

    expect(
      queryClient.getQueryState(offerOrderKeys.availableOffers())?.isInvalidated
    ).toBe(true)
    expect(
      queryClient.getQueryState(offerOrderKeys.list())?.isInvalidated
    ).toBe(true)
  })

  it('invalidates available offers when a 409 optimistic lock conflict occurs', async () => {
    vi.mocked(api.reserveOffer).mockRejectedValue(
      apiError(409, 'OPTIMISTIC_LOCK_CONFLICT')
    )

    const { result, queryClient } = renderHookWithProviders(() =>
      useReserveOffer()
    )
    queryClient.setQueryData(offerOrderKeys.availableOffers(), [availableOffer])

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          offerId: availableOffer.id,
          quantity: 2,
        })
      ).rejects.toMatchObject({ status: 409, code: 'OPTIMISTIC_LOCK_CONFLICT' })
    })

    expect(
      queryClient.getQueryState(offerOrderKeys.availableOffers())?.isInvalidated
    ).toBe(true)
  })
})
