import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { productKeys } from '@/hooks/useProducts'
import * as api from '@/lib/api/discountRecommendations'
import { apiError, discountRecommendation, product } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { DiscountRecommendationCard } from './DiscountRecommendationCard'

vi.mock('@/lib/api/discountRecommendations')

const suggest = () => screen.getByRole('button', { name: /sugerir desconto/i })
const accept = () => screen.getByRole('button', { name: /^aceitar$/i })
const adjust = () => screen.getByRole('button', { name: /^ajustar$/i })
const refuse = () => screen.getByRole('button', { name: /^recusar$/i })

beforeEach(() => {
  vi.resetAllMocks()
})

describe('DiscountRecommendationCard', () => {
  it('shows the pending recommendation with the discounted price', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([
      discountRecommendation,
    ])

    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    expect(await screen.findByText('R$ 6,93')).toBeInTheDocument()
    expect(screen.getByText('R$ 9,90')).toBeInTheDocument()
    expect(screen.getByText('−30%')).toBeInTheDocument()
    expect(screen.getByText('Aguardando resposta')).toBeInTheDocument()
    // Asking for another one is not offered while one is pending.
    expect(
      screen.queryByRole('button', { name: /sugerir desconto/i })
    ).not.toBeInTheDocument()
  })

  it('accepts the suggested discount and refreshes the product price', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([
      discountRecommendation,
    ])
    vi.mocked(api.respondToRecommendation).mockResolvedValue({
      ...discountRecommendation,
      status: 'ACCEPTED',
      respondedAt: '2026-09-26T16:00:00',
    })
    const user = userEvent.setup()
    const { queryClient } = renderWithProviders(
      <DiscountRecommendationCard productId={product.id} />
    )
    queryClient.setQueryData(productKeys.detail(product.id), product)

    await user.click(await screen.findByRole('button', { name: /^aceitar$/i }))

    await waitFor(() =>
      expect(api.respondToRecommendation).toHaveBeenCalledWith(
        discountRecommendation.id,
        { decision: 'ACCEPT' }
      )
    )
    expect(
      queryClient.getQueryState(productKeys.detail(product.id))?.isInvalidated
    ).toBe(true)
  })

  it('refuses without sending any percentage', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([
      discountRecommendation,
    ])
    vi.mocked(api.respondToRecommendation).mockResolvedValue({
      ...discountRecommendation,
      status: 'REFUSED',
    })
    const user = userEvent.setup()
    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    await user.click(await screen.findByRole('button', { name: /^recusar$/i }))

    await waitFor(() =>
      expect(api.respondToRecommendation).toHaveBeenCalledWith(
        discountRecommendation.id,
        { decision: 'REFUSE' }
      )
    )
  })

  it('adjusts the percentage, previewing the resulting price', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([
      discountRecommendation,
    ])
    vi.mocked(api.respondToRecommendation).mockResolvedValue({
      ...discountRecommendation,
      status: 'ADJUSTED',
      suggestedPercentage: 50,
    })
    const user = userEvent.setup()
    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    await user.click(await screen.findByRole('button', { name: /^ajustar$/i }))
    const field = screen.getByLabelText(/desconto/i)
    await user.clear(field)
    await user.type(field, '50')

    expect(screen.getByText(/preço ficaria em r\$ 4,95/i)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /aplicar desconto ajustado/i })
    )

    await waitFor(() =>
      expect(api.respondToRecommendation).toHaveBeenCalledWith(
        discountRecommendation.id,
        { decision: 'ADJUST', adjustedPercentage: 50 }
      )
    )
  })

  it('blocks a percentage above 100 before calling the API', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([
      discountRecommendation,
    ])
    const user = userEvent.setup()
    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    await user.click(await screen.findByRole('button', { name: /^ajustar$/i }))
    const field = screen.getByLabelText(/desconto/i)
    await user.clear(field)
    await user.type(field, '120')
    await user.click(
      screen.getByRole('button', { name: /aplicar desconto ajustado/i })
    )

    expect(
      await screen.findByText('O desconto não pode passar de 100%.')
    ).toBeInTheDocument()
    expect(api.respondToRecommendation).not.toHaveBeenCalled()
  })

  it('explains the 422 raised for a product that is not at risk', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([])
    vi.mocked(api.recommendDiscount).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'product 10 is not at risk of waste: risk is 12.50%, threshold is 70%'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    await user.click(
      await screen.findByRole('button', { name: /sugerir desconto/i })
    )

    expect(
      await screen.findByText(/não está em risco de desperdício/i)
    ).toHaveTextContent('o risco é de 12,5% e o limite é 70%')
  })

  it('explains the 422 raised when another recommendation is pending', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([])
    vi.mocked(api.recommendDiscount).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'product 10 already has a pending discount recommendation (id 30)'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    await user.click(
      await screen.findByRole('button', { name: /sugerir desconto/i })
    )

    expect(
      await screen.findByText(/já tem uma recomendação aguardando resposta/i)
    ).toBeInTheDocument()
  })

  it('lists answered recommendations as history', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([
      {
        ...discountRecommendation,
        id: 31,
        status: 'REFUSED',
        respondedAt: '2026-09-25T10:00:00',
      },
      {
        ...discountRecommendation,
        id: 32,
        status: 'ACCEPTED',
        suggestedPercentage: 20,
        priceWithDiscount: 7.92,
        respondedAt: '2026-09-24T10:00:00',
      },
    ])

    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    expect(
      await screen.findByText('Recomendações anteriores')
    ).toBeInTheDocument()
    expect(screen.getByText('Recusada')).toBeInTheDocument()
    expect(screen.getByText('preço mantido')).toBeInTheDocument()
    expect(screen.getByText('Aceita')).toBeInTheDocument()
    expect(screen.getByText('preço para R$ 7,92')).toBeInTheDocument()
    // With nothing pending, asking for a new suggestion is offered again.
    expect(suggest()).toBeInTheDocument()
  })

  it('invites a suggestion when the product has no recommendation yet', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([])

    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    expect(
      await screen.findByText(/nenhuma recomendação aguardando resposta/i)
    ).toBeInTheDocument()
    expect(suggest()).toBeInTheDocument()
    expect(() => accept()).toThrow()
    expect(() => adjust()).toThrow()
    expect(() => refuse()).toThrow()
  })
})
