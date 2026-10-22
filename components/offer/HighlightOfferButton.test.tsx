import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/offers'
import { apiError, offer } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { HighlightOfferButton } from './HighlightOfferButton'

vi.mock('@/lib/api/offers')

const open = () => screen.getByRole('button', { name: /destacar para os/i })
const confirm = () => screen.getByRole('button', { name: /^destacar oferta$/i })

beforeEach(() => {
  vi.resetAllMocks()
})

describe('HighlightOfferButton', () => {
  it('asks for confirmation before highlighting, warning it cannot be undone', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HighlightOfferButton offer={offer} />)

    await user.click(open())

    expect(
      screen.getByRole('dialog', { name: /destacar esta oferta/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/o destaque não pode ser desfeito/i)
    ).toBeInTheDocument()
    expect(api.markOfferAsPriority).not.toHaveBeenCalled()
  })

  it('highlights the offer once confirmed', async () => {
    vi.mocked(api.markOfferAsPriority).mockResolvedValue({
      ...offer,
      priority: true,
    })
    const user = userEvent.setup()
    renderWithProviders(<HighlightOfferButton offer={offer} />)

    await user.click(open())
    await user.click(confirm())

    await waitFor(() =>
      expect(api.markOfferAsPriority).toHaveBeenCalledWith(offer.id)
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })

  it('does nothing when the confirmation is dismissed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HighlightOfferButton offer={offer} />)

    await user.click(open())
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(api.markOfferAsPriority).not.toHaveBeenCalled()
  })

  it('explains the 422 raised when the offer was closed in the meantime', async () => {
    vi.mocked(api.markOfferAsPriority).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'offer 55 is not active: current status is CLOSED'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<HighlightOfferButton offer={offer} />)

    await user.click(open())
    await user.click(confirm())

    expect(
      await screen.findByText(/não está mais ativa e não pode ser destacada/i)
    ).toBeInTheDocument()
    // The dialog stays open so the message is read before anything closes.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('reports a failure that is not a business rule', async () => {
    vi.mocked(api.markOfferAsPriority).mockRejectedValue(
      apiError(500, 'INTERNAL_ERROR')
    )
    const user = userEvent.setup()
    renderWithProviders(<HighlightOfferButton offer={offer} />)

    await user.click(open())
    await user.click(confirm())

    expect(
      await screen.findByText(/ocorreu um erro no servidor/i)
    ).toBeInTheDocument()
  })
})
