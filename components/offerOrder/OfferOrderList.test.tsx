import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/offerOrders'
import { apiError, offerOrder } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { OfferOrderList } from './OfferOrderList'

vi.mock('@/lib/api/offerOrders')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('OfferOrderList', () => {
  it('renders the empty state when the consumer has no reservations yet', async () => {
    vi.mocked(api.listOfferOrders).mockResolvedValue([])
    renderWithProviders(<OfferOrderList />)

    expect(
      await screen.findByText('Você ainda não fez nenhuma reserva')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /ver ofertas disponíveis/i })
    ).toHaveAttribute('href', '/offers')
  })

  it('lists the reservations of the authenticated consumer', async () => {
    vi.mocked(api.listOfferOrders).mockResolvedValue([offerOrder])
    renderWithProviders(<OfferOrderList />)

    expect(await screen.findByText('#900')).toBeInTheDocument()
    expect(screen.getByText(offerOrder.productName)).toBeInTheDocument()
    expect(screen.getByText('Reservado')).toBeInTheDocument()
    expect(screen.getByText(/r\$\s*10,40/i)).toBeInTheDocument()
  })

  it('shows an error alert when the request fails', async () => {
    vi.mocked(api.listOfferOrders).mockRejectedValue(
      apiError(500, 'INTERNAL_ERROR')
    )
    renderWithProviders(<OfferOrderList />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
