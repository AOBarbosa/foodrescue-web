import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/sales'
import { apiError, product, sale } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { SaleHistory } from './SaleHistory'

vi.mock('@/lib/api/sales')

const fromField = () => screen.getByLabelText('De')
const toField = () => screen.getByLabelText('Até')

function setDate(field: HTMLElement, value: string) {
  fireEvent.change(field, { target: { value } })
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 8, 24, 12))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SaleHistory', () => {
  it('opens on the last 30 days and lists the sales with their totals', async () => {
    vi.mocked(api.listSales).mockResolvedValue([
      sale,
      {
        ...sale,
        id: 101,
        quantity: 1,
        totalPrice: 9.9,
        soldAt: '2026-09-24T08:05:00',
      },
    ])

    renderWithProviders(<SaleHistory productId={product.id} />)

    expect(fromField()).toHaveValue('2026-08-26')
    expect(toField()).toHaveValue('2026-09-24')
    expect(await screen.findByText('23/09/2026, 10:30')).toBeInTheDocument()
    expect(api.listSales).toHaveBeenCalledWith({
      productId: product.id,
      startDate: '2026-08-26T00:00:00',
      endDate: '2026-09-25T00:00:00',
    })
    expect(
      screen.getByText(/2 vendas · 4 unidades · R\$\s?39,60/)
    ).toBeInTheDocument()
  })

  it('queries again when the period changes', async () => {
    vi.mocked(api.listSales).mockResolvedValue([])

    renderWithProviders(<SaleHistory productId={product.id} />)
    await screen.findByText('Nenhuma venda neste período')

    setDate(fromField(), '2026-09-20')
    setDate(toField(), '2026-09-22')

    await waitFor(() =>
      expect(api.listSales).toHaveBeenLastCalledWith({
        productId: product.id,
        startDate: '2026-09-20T00:00:00',
        endDate: '2026-09-23T00:00:00',
      })
    )
  })

  it('rejects an inverted period without querying it (mirrors the backend 422)', async () => {
    vi.mocked(api.listSales).mockResolvedValue([sale])

    renderWithProviders(<SaleHistory productId={product.id} />)
    await screen.findByText('23/09/2026, 10:30')
    const calls = vi.mocked(api.listSales).mock.calls.length

    setDate(fromField(), '2026-09-30')

    expect(
      screen.getByText('A data inicial não pode ser depois da data final.')
    ).toBeInTheDocument()
    expect(vi.mocked(api.listSales).mock.calls).toHaveLength(calls)
    // The results already on screen stay there.
    expect(screen.getByText('23/09/2026, 10:30')).toBeInTheDocument()
  })

  it('shows an error with a retry when the query fails', async () => {
    vi.mocked(api.listSales).mockRejectedValue(apiError(500, 'INTERNAL_ERROR'))

    renderWithProviders(<SaleHistory productId={product.id} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /erro no servidor/i
    )
    expect(
      screen.getByRole('button', { name: /tentar novamente/i })
    ).toBeInTheDocument()
  })
})
