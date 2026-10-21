import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/offerOrders'
import { apiError, availableOffer, offerOrder } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { AvailableOfferList } from './AvailableOfferList'

vi.mock('@/lib/api/offerOrders')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('AvailableOfferList', () => {
  it('renders the empty state when there are no active offers', async () => {
    vi.mocked(api.listAvailableOffers).mockResolvedValue([])
    renderWithProviders(<AvailableOfferList />)

    expect(
      await screen.findByText('Nenhuma oferta disponível no momento')
    ).toBeInTheDocument()
  })

  it('shows active offers, previews the total and reserves the requested quantity', async () => {
    vi.mocked(api.listAvailableOffers).mockResolvedValue([
      { ...availableOffer, priority: true },
    ])
    vi.mocked(api.reserveOffer).mockResolvedValue({
      ...offerOrder,
      quantity: 3,
      totalPrice: 15.6,
    })
    const user = userEvent.setup()
    renderWithProviders(<AvailableOfferList />)

    expect(
      await screen.findByRole('heading', { name: availableOffer.productName })
    ).toBeInTheDocument()
    expect(screen.getByText('Em destaque')).toBeInTheDocument()
    expect(screen.getByText(/6 unidades disponíveis/i)).toBeInTheDocument()

    const quantityInput = screen.getByLabelText(/quantidade/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '3')

    expect(screen.getByText(/total: r\$\s*15,60/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reservar/i }))

    await waitFor(() =>
      expect(api.reserveOffer).toHaveBeenCalledWith({
        offerId: availableOffer.id,
        quantity: 3,
      })
    )
    expect(await screen.findByText(/pedido #900 reservado/i)).toHaveTextContent(
      '3 unidades'
    )
  })

  it('blocks a quantity greater than availableQuantity client-side before calling the API', async () => {
    vi.mocked(api.listAvailableOffers).mockResolvedValue([availableOffer])
    const user = userEvent.setup()
    renderWithProviders(<AvailableOfferList />)

    const quantityInput = await screen.findByLabelText(/quantidade/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '7')
    await user.click(screen.getByRole('button', { name: /reservar/i }))

    expect(
      await screen.findByText(
        'Quantidade indisponível: há 6 unidades disponíveis na oferta.'
      )
    ).toBeInTheDocument()
    expect(api.reserveOffer).not.toHaveBeenCalled()
  })

  it("handles the backend's 422 when remaining units decreased meanwhile", async () => {
    vi.mocked(api.listAvailableOffers).mockResolvedValue([availableOffer])
    vi.mocked(api.reserveOffer).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'offer 700 has only 2 units left'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<AvailableOfferList />)

    const quantityInput = await screen.findByLabelText(/quantidade/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '4')
    await user.click(screen.getByRole('button', { name: /reservar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Quantidade indisponível para esta reserva: restam 2 unidades na oferta.'
    )
    expect(screen.getByText('Quantidade indisponível.')).toBeInTheDocument()
  })

  it("handles the backend's 422 when the offer expired before confirmation", async () => {
    vi.mocked(api.listAvailableOffers).mockResolvedValue([availableOffer])
    vi.mocked(api.reserveOffer).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'offer 700 has expired at 2026-09-26T22:00'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<AvailableOfferList />)

    await screen.findByLabelText(/quantidade/i)
    await user.click(screen.getByRole('button', { name: /reservar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esta oferta expirou antes da confirmação da reserva.'
    )
  })

  it('handles 409 optimistic lock conflict when two reservations compete simultaneously', async () => {
    vi.mocked(api.listAvailableOffers).mockResolvedValue([availableOffer])
    vi.mocked(api.reserveOffer).mockRejectedValue(
      apiError(409, 'OPTIMISTIC_LOCK_CONFLICT')
    )
    const user = userEvent.setup()
    renderWithProviders(<AvailableOfferList />)

    await screen.findByLabelText(/quantidade/i)
    await user.click(screen.getByRole('button', { name: /reservar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Outro consumidor reservou esta oferta ao mesmo tempo.'
    )
  })
})
