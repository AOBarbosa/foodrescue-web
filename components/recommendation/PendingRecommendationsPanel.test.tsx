import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/discountRecommendations'
import { apiError, discountRecommendation } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { PendingRecommendationsPanel } from './PendingRecommendationsPanel'

vi.mock('@/lib/api/discountRecommendations')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('PendingRecommendationsPanel', () => {
  it('lists the pending recommendations with product, price and expiry', async () => {
    vi.mocked(api.listPendingRecommendations).mockResolvedValue([
      discountRecommendation,
      {
        ...discountRecommendation,
        id: 31,
        productId: 11,
        productName: 'Coxinha',
        suggestedPercentage: 20,
        originalPrice: 5,
        currentPrice: 5,
        priceWithDiscount: 4,
      },
    ])

    renderWithProviders(<PendingRecommendationsPanel />)

    expect(
      await screen.findByRole('link', { name: 'Pão de forma integral' })
    ).toHaveAttribute('href', '/dashboard/products/10')
    expect(screen.getByRole('link', { name: 'Coxinha' })).toHaveAttribute(
      'href',
      '/dashboard/products/11'
    )
    expect(screen.getByText('R$ 6,93')).toBeInTheDocument()
    expect(screen.getByText('R$ 4,00')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^aceitar$/i })).toHaveLength(
      2
    )
  })

  it('answers a recommendation straight from the panel', async () => {
    vi.mocked(api.listPendingRecommendations).mockResolvedValue([
      discountRecommendation,
    ])
    vi.mocked(api.respondToRecommendation).mockResolvedValue({
      ...discountRecommendation,
      status: 'ACCEPTED',
    })
    const user = userEvent.setup()
    renderWithProviders(<PendingRecommendationsPanel />)

    await user.click(await screen.findByRole('button', { name: /^aceitar$/i }))

    await waitFor(() =>
      expect(api.respondToRecommendation).toHaveBeenCalledWith(
        discountRecommendation.id,
        { decision: 'ACCEPT' }
      )
    )
  })

  it('warns when the recommendation was already answered elsewhere', async () => {
    vi.mocked(api.listPendingRecommendations).mockResolvedValue([
      discountRecommendation,
    ])
    vi.mocked(api.respondToRecommendation).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'recommendation 30 is not pending: current status is EXPIRED'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<PendingRecommendationsPanel />)

    await user.click(await screen.findByRole('button', { name: /^aceitar$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /já foi respondida ou expirou/i
    )
  })

  it('shows an empty state when nothing is waiting', async () => {
    vi.mocked(api.listPendingRecommendations).mockResolvedValue([])

    renderWithProviders(<PendingRecommendationsPanel />)

    expect(
      await screen.findByText('Nenhuma recomendação aguardando resposta')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /ver produtos em risco/i })
    ).toHaveAttribute('href', '/dashboard/waste-risks')
  })

  it('shows an error with a retry when the query fails', async () => {
    vi.mocked(api.listPendingRecommendations).mockRejectedValue(
      apiError(500, 'INTERNAL_ERROR')
    )

    renderWithProviders(<PendingRecommendationsPanel />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /erro no servidor/i
    )
    expect(
      screen.getByRole('button', { name: /tentar novamente/i })
    ).toBeInTheDocument()
  })
})
