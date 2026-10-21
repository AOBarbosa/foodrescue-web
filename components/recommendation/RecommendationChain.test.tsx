import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/discountRecommendations'
import { discountRecommendation, product } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import type { DiscountRecommendationDTO } from '@/types/discountRecommendation'

import { DiscountRecommendationCard } from './DiscountRecommendationCard'
import { RecommendationChainCard } from './RecommendationChainCard'

vi.mock('@/lib/api/discountRecommendations')

const initial: DiscountRecommendationDTO = {
  ...discountRecommendation,
  id: 30,
  status: 'ACCEPTED',
  respondedAt: '2026-09-26T16:00:00',
}
const additionalDiscount: DiscountRecommendationDTO = {
  ...discountRecommendation,
  id: 31,
  suggestedPercentage: 40,
  priceWithDiscount: 5.94,
  status: 'REFUSED',
  createdAt: '2026-09-26T18:00:00',
  respondedAt: '2026-09-26T18:10:00',
  previousRecommendationId: 30,
}
const priority: DiscountRecommendationDTO = {
  ...discountRecommendation,
  id: 32,
  type: 'SURPLUS_DESTINATION',
  suggestedPercentage: null,
  currentPrice: 6.93,
  priceWithDiscount: 9.9,
  createdAt: '2026-09-26T20:00:00',
  previousRecommendationId: 31,
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('RecommendationChainCard', () => {
  it('lists the initial recommendation and its follow-ups in order', async () => {
    vi.mocked(api.listRecommendationChain).mockResolvedValue([
      initial,
      additionalDiscount,
      priority,
    ])

    renderWithProviders(<RecommendationChainCard productId={product.id} />)

    const items = await screen.findAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Desconto sugerido')
    expect(items[1]).toHaveTextContent('Desconto adicional')
    expect(items[1]).toHaveTextContent('Recusada')
    expect(items[2]).toHaveTextContent('Destacar a oferta para os clientes')
    expect(items[2]).toHaveTextContent('Aguardando resposta')
    expect(api.listRecommendationChain).toHaveBeenCalledWith(product.id)
  })

  it('says so when nothing was recommended today', async () => {
    vi.mocked(api.listRecommendationChain).mockResolvedValue([])

    renderWithProviders(<RecommendationChainCard productId={product.id} />)

    expect(
      await screen.findByText(/nenhuma recomendação foi feita/i)
    ).toBeInTheDocument()
  })
})

describe('priority recommendation (UC10)', () => {
  it('offers accept and refuse only, with no price change', async () => {
    vi.mocked(api.listProductRecommendations).mockResolvedValue([priority])
    vi.mocked(api.respondToRecommendation).mockResolvedValue({
      ...priority,
      status: 'ACCEPTED',
    })
    const user = userEvent.setup()

    renderWithProviders(<DiscountRecommendationCard productId={product.id} />)

    expect(
      await screen.findByText('Destacar a oferta para os clientes')
    ).toBeInTheDocument()
    expect(screen.getByText('Prioridade')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^ajustar$/i })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^aceitar$/i }))

    expect(api.respondToRecommendation).toHaveBeenCalledWith(priority.id, {
      decision: 'ACCEPT',
    })
  })
})
