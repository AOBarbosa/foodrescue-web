import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/offers'
import { apiError, isoDateTimeIn, offer, product } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { ProductOfferCard } from './ProductOfferCard'

vi.mock('@/lib/api/offers')

const publish = () => screen.getByRole('button', { name: /publicar oferta/i })
const quantity = () => screen.getByLabelText(/quantidade ofertada/i)
const deadline = () => screen.getByLabelText(/aceita pedidos até/i)

beforeEach(() => {
  vi.resetAllMocks()
})

describe('ProductOfferCard', () => {
  it('publishes the surplus with the backend defaults when nothing is informed', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    vi.mocked(api.createOffer).mockResolvedValue(offer)
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.click(
      await screen.findByRole('button', { name: /publicar oferta/i })
    )

    await waitFor(() =>
      expect(api.createOffer).toHaveBeenCalledWith({ productId: product.id })
    )
    expect(
      await screen.findByText(/oferta publicada: 12 unidades a r\$ 6,93/i)
    ).toBeInTheDocument()
  })

  it('shows which defaults the empty fields will use', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    renderWithProviders(<ProductOfferCard product={product} />)

    expect(
      await screen.findByText('Em branco: R$ 9,90 (preço atual)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Em branco: todo o estoque (12)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Em branco: fechamento de hoje (22:00)')
    ).toBeInTheDocument()
  })

  it('publishes with the informed price, quantity and deadline', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    vi.mocked(api.createOffer).mockResolvedValue({
      ...offer,
      discountedPrice: 4.95,
      availableQuantity: 5,
    })
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.type(await screen.findByLabelText(/preço da oferta/i), '4,95')
    await user.type(quantity(), '5')
    const futureDeadline = isoDateTimeIn(5).slice(0, 16)
    await user.type(deadline(), futureDeadline)
    await user.click(publish())

    await waitFor(() =>
      expect(api.createOffer).toHaveBeenCalledWith({
        productId: product.id,
        discountedPrice: 4.95,
        availableQuantity: 5,
        expiresAt: `${futureDeadline}:00`,
      })
    )
  })

  it('blocks a quantity above the stock before calling the API', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.type(await screen.findByLabelText(/quantidade ofertada/i), '20')
    await user.click(publish())

    expect(
      await screen.findByText(
        'Estoque insuficiente: há 12 unidades disponíveis.'
      )
    ).toBeInTheDocument()
    expect(api.createOffer).not.toHaveBeenCalled()
  })

  it('blocks a price above the product original price before calling the API', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.type(await screen.findByLabelText(/preço da oferta/i), '12,00')
    await user.click(publish())

    expect(
      await screen.findByText(
        'O preço da oferta não pode passar de R$ 9,90 (preço original).'
      )
    ).toBeInTheDocument()
    expect(api.createOffer).not.toHaveBeenCalled()
  })

  it('shows the active offer instead of the form, with the option to close it', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer])
    renderWithProviders(<ProductOfferCard product={product} />)

    expect(await screen.findByText('R$ 6,93')).toBeInTheDocument()
    expect(screen.getByText('R$ 9,90')).toBeInTheDocument()
    expect(screen.getByText('−30%')).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(screen.getByText(/12 unidades disponíveis/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /encerrar oferta/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /publicar oferta/i })
    ).not.toBeInTheDocument()
  })

  it('closes the active offer', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer])
    vi.mocked(api.closeOffer).mockResolvedValue({ ...offer, status: 'CLOSED' })
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.click(
      await screen.findByRole('button', { name: /encerrar oferta/i })
    )

    await waitFor(() => expect(api.closeOffer).toHaveBeenCalledWith(offer.id))
  })

  it('warns that an offer already closed elsewhere cannot be closed again', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer])
    vi.mocked(api.closeOffer).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'offer 55 is not active: current status is CLOSED'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.click(
      await screen.findByRole('button', { name: /encerrar oferta/i })
    )

    expect(
      await screen.findByText(/esta oferta já estava encerrada/i)
    ).toBeInTheDocument()
  })

  it('flags an active offer whose deadline has already passed', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([
      { ...offer, expiresAt: isoDateTimeIn(-2) },
    ])
    renderWithProviders(<ProductOfferCard product={product} />)

    expect(await screen.findByText('Prazo vencido')).toBeInTheDocument()
    expect(
      screen.getByText(/os consumidores não conseguem mais pedir/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /encerrar oferta/i })
    ).toBeInTheDocument()
  })

  it('does not offer the form for a product without stock', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    renderWithProviders(
      <ProductOfferCard product={{ ...product, stockQuantity: 0 }} />
    )

    expect(
      await screen.findByText(/este produto está sem estoque/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /publicar oferta/i })
    ).not.toBeInTheDocument()
  })

  it('explains the 422 raised when another offer of the product is still active', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    vi.mocked(api.createOffer).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'product 10 already has an active offer (id 55); close it before publishing another'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.click(
      await screen.findByRole('button', { name: /publicar oferta/i })
    )

    expect(
      await screen.findByText(
        'Este produto já tem uma oferta ativa (nº 55). Encerre-a antes de publicar outra.'
      )
    ).toBeInTheDocument()
  })

  it('explains the 422 raised when the stock ran out since the page loaded', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    vi.mocked(api.createOffer).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'product 10 has no stock to offer'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.click(
      await screen.findByRole('button', { name: /publicar oferta/i })
    )

    expect(
      await screen.findByText(
        /atualize o estoque antes de publicar uma oferta/i
      )
    ).toBeInTheDocument()
  })

  it('puts the 422 about the stock back on the quantity field', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    vi.mocked(api.createOffer).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'availableQuantity 12 exceeds the product stock of 4'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.click(
      await screen.findByRole('button', { name: /publicar oferta/i })
    )

    expect(
      await screen.findByText(
        'Estoque insuficiente: há 4 unidades disponíveis.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(/o estoque mudou desde o carregamento/i)
    ).toBeInTheDocument()
  })

  it('puts a validation sub-error on its own field', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([])
    vi.mocked(api.createOffer).mockRejectedValue(
      apiError(422, 'VALIDATION_ERROR', [
        {
          field: 'expiresAt',
          message: 'expiresAt must be in the future',
          code: 'OFFER_DEADLINE_IN_THE_PAST',
        },
      ])
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.click(
      await screen.findByRole('button', { name: /publicar oferta/i })
    )

    expect(
      await screen.findByText('O prazo da oferta precisa estar no futuro.')
    ).toBeInTheDocument()
  })

  it('offers the highlight action on an active offer and applies it (UC11)', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([offer])
    vi.mocked(api.markOfferAsPriority).mockResolvedValue({
      ...offer,
      priority: true,
    })
    const user = userEvent.setup()
    renderWithProviders(<ProductOfferCard product={product} />)

    await user.click(
      await screen.findByRole('button', { name: /destacar para os clientes/i })
    )
    await user.click(screen.getByRole('button', { name: /^destacar oferta$/i }))

    await waitFor(() =>
      expect(api.markOfferAsPriority).toHaveBeenCalledWith(offer.id)
    )
  })

  it('shows an already highlighted offer without offering the action again', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([{ ...offer, priority: true }])
    renderWithProviders(<ProductOfferCard product={product} />)

    expect(await screen.findByText('Em destaque')).toBeInTheDocument()
    expect(
      screen.getByText(/aparece antes das outras para os consumidores/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /destacar para os clientes/i })
    ).not.toBeInTheDocument()
  })

  it('does not offer the highlight for an offer nobody can order', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([
      { ...offer, expiresAt: isoDateTimeIn(-2) },
    ])
    renderWithProviders(<ProductOfferCard product={product} />)

    expect(await screen.findByText('Prazo vencido')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /destacar para os clientes/i })
    ).not.toBeInTheDocument()
  })

  it('lists the closed offers of the product as history', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([
      { ...offer, id: 56, status: 'CLOSED', availableQuantity: 0 },
      { ...offer, id: 57, status: 'CLOSED', availableQuantity: 3 },
    ])
    renderWithProviders(<ProductOfferCard product={product} />)

    expect(await screen.findByText('Ofertas anteriores')).toBeInTheDocument()
    expect(screen.getByText('todas as unidades pedidas')).toBeInTheDocument()
    expect(screen.getByText('3 unidades sem pedido')).toBeInTheDocument()
    // With nothing active, publishing a new offer is offered again.
    expect(publish()).toBeInTheDocument()
  })

  it('ignores the offers of other products', async () => {
    vi.mocked(api.listOffers).mockResolvedValue([
      { ...offer, id: 58, productId: 99, productName: 'Bolo de cenoura' },
    ])
    renderWithProviders(<ProductOfferCard product={product} />)

    expect(
      await screen.findByRole('button', { name: /publicar oferta/i })
    ).toBeInTheDocument()
    expect(screen.queryByText('Ofertas anteriores')).not.toBeInTheDocument()
  })
})
