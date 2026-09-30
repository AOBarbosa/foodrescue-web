import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { productKeys } from '@/hooks/useProducts'
import * as api from '@/lib/api/sales'
import { apiError, product, sale } from '@/test/fixtures'
import { renderHookWithProviders } from '@/test/render'

import { saleKeys, useRegisterSale, useSaleHistory } from './useSales'

vi.mock('@/lib/api/sales')

const period = {
  startDate: '2026-09-01T00:00:00',
  endDate: '2026-09-25T00:00:00',
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useSaleHistory', () => {
  it('lists the sales of a product within the period', async () => {
    vi.mocked(api.listSales).mockResolvedValue([sale])

    const { result } = renderHookWithProviders(() =>
      useSaleHistory(product.id, period)
    )

    await waitFor(() => expect(result.current.data).toEqual([sale]))
    expect(api.listSales).toHaveBeenCalledWith({
      productId: product.id,
      ...period,
    })
  })
})

describe('useRegisterSale', () => {
  it('refreshes the product (its stock changed) and the history', async () => {
    vi.mocked(api.registerSale).mockResolvedValue(sale)

    const { result, queryClient } = renderHookWithProviders(() =>
      useRegisterSale(product.id)
    )
    queryClient.setQueryData(productKeys.detail(product.id), product)
    queryClient.setQueryData(productKeys.list(), [product])
    queryClient.setQueryData(saleKeys.history(product.id, period), [])
    await act(() =>
      result.current.mutateAsync({ productId: product.id, quantity: 3 })
    )

    expect(
      queryClient.getQueryState(productKeys.detail(product.id))?.isInvalidated
    ).toBe(true)
    expect(queryClient.getQueryState(productKeys.list())?.isInvalidated).toBe(
      true
    )
    expect(
      queryClient.getQueryState(saleKeys.history(product.id, period))
        ?.isInvalidated
    ).toBe(true)
  })

  it('surfaces the 422 raised when the quantity exceeds the stock', async () => {
    vi.mocked(api.registerSale).mockRejectedValue(
      apiError(422, 'BUSINESS_RULE_VIOLATION')
    )

    const { result } = renderHookWithProviders(() =>
      useRegisterSale(product.id)
    )
    await act(async () => {
      await expect(
        result.current.mutateAsync({ productId: product.id, quantity: 99 })
      ).rejects.toMatchObject({ status: 422, code: 'BUSINESS_RULE_VIOLATION' })
    })
  })
})
