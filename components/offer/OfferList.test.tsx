import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/offers'
import { apiError, isoDateTimeIn, offer } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { OfferList } from './OfferList'

vi.mock('@/lib/api/offers')

const closedOffer = {
  ...offer,
  id: 56,
  productId: 99,
  productName: 'Bolo de cenoura',
  status: 'CLOSED' as const,
  availableQuantity: 0,
}

const activeOnlySwitch = () =>
  screen.getByRole('switch', { name: /mostrar só as ofertas ativas/i })

beforeEach(() => {
  vi.resetAllMocks()
})

describe('OfferList', () => {
  it('lists the active offers with price, availability and deadline', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer, closedOffer])

    renderWithProviders(<OfferList />)

    expect(await screen.findByText(offer.productName)).toBeInTheDocument()
    expect(screen.getByText('R$ 6,93')).toBeInTheDocument()
    expect(screen.getByText('−30%')).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    // Closed offers are hidden until the switch is turned off.
    expect(screen.queryByText('Bolo de cenoura')).not.toBeInTheDocument()
  })

  it('links each offer to its product', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer])

    renderWithProviders(<OfferList />)

    expect(
      await screen.findByRole('link', { name: offer.productName })
    ).toHaveAttribute('href', `/dashboard/products/${offer.productId}`)
  })

  it('shows the closed offers once the filter is turned off', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer, closedOffer])
    const user = userEvent.setup()
    renderWithProviders(<OfferList />)

    await user.click(await screen.findByRole('switch'))

    expect(screen.getByText('Bolo de cenoura')).toBeInTheDocument()
    expect(screen.getByText('Encerrada')).toBeInTheDocument()
  })

  it('offers the close action only on the active rows', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer, closedOffer])
    const user = userEvent.setup()
    renderWithProviders(<OfferList />)

    await user.click(await screen.findByRole('switch'))

    expect(
      screen.getAllByRole('button', { name: /encerrar oferta/i })
    ).toHaveLength(1)
  })

  it('closes an offer from the panel', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer])
    vi.mocked(api.closeOffer).mockResolvedValue({ ...offer, status: 'CLOSED' })
    const user = userEvent.setup()
    renderWithProviders(<OfferList />)

    await user.click(
      await screen.findByRole('button', { name: /encerrar oferta/i })
    )

    await waitFor(() => expect(api.closeOffer).toHaveBeenCalledWith(offer.id))
  })

  it('highlights an offer from the panel (UC11)', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer])
    vi.mocked(api.markOfferAsPriority).mockResolvedValue({
      ...offer,
      priority: true,
    })
    const user = userEvent.setup()
    renderWithProviders(<OfferList />)

    await user.click(
      await screen.findByRole('button', { name: /destacar para os clientes/i })
    )
    await user.click(screen.getByRole('button', { name: /^destacar oferta$/i }))

    await waitFor(() =>
      expect(api.markOfferAsPriority).toHaveBeenCalledWith(offer.id)
    )
  })

  it('marks the already highlighted rows and drops their action', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([
      { ...offer, priority: true },
      { ...offer, id: 57, productName: 'Sonho de creme' },
    ])

    renderWithProviders(<OfferList />)

    expect(await screen.findByText('Em destaque')).toBeInTheDocument()
    // Only the offer that is not highlighted yet can be highlighted.
    expect(
      screen.getAllByRole('button', { name: /destacar para os clientes/i })
    ).toHaveLength(1)
    expect(
      screen.getAllByRole('button', { name: /encerrar oferta/i })
    ).toHaveLength(2)
  })

  it('flags an offer that is still active but past its deadline', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([
      { ...offer, expiresAt: isoDateTimeIn(-1) },
    ])

    renderWithProviders(<OfferList />)

    expect(await screen.findByText('Prazo vencido')).toBeInTheDocument()
  })

  it('invites publishing when no offer is active', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([closedOffer])

    renderWithProviders(<OfferList />)

    expect(await screen.findByText('Nenhuma oferta ativa')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver produtos/i })).toHaveAttribute(
      'href',
      '/dashboard/products'
    )
  })

  it('says nothing was ever published when the establishment has no offer', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    const user = userEvent.setup()
    renderWithProviders(<OfferList />)

    await user.click(await screen.findByRole('switch'))

    expect(
      screen.getByText('Nenhuma oferta publicada ainda')
    ).toBeInTheDocument()
  })

  it('reports a failed load and retries', async () => {
    vi.mocked(api.listOffers).mockRejectedValueOnce(
      apiError(500, 'INTERNAL_ERROR')
    )
    const user = userEvent.setup()
    renderWithProviders(<OfferList />)

    expect(
      await screen.findByText(/ocorreu um erro no servidor/i)
    ).toBeInTheDocument()

    vi.mocked(api.listOffers).mockResolvedValue([offer])
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }))

    expect(await screen.findByText(offer.productName)).toBeInTheDocument()
    expect(activeOnlySwitch()).toBeChecked()
  })
})
