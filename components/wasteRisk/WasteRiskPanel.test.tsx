import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/wasteRisks'
import { wasteRisk } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { WasteRiskPanel } from './WasteRiskPanel'

vi.mock(
  'next/navigation',
  async () => (await import('@/test/navigation')).navigationMock
)
vi.mock('@/lib/api/wasteRisks')

const safe = {
  ...wasteRisk,
  productId: 11,
  productName: 'Bolo de milho',
  stockQuantity: 4,
  predictedQuantity: 6,
  expectedSurplus: 0,
  riskPercentage: 0,
  atRisk: false,
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('WasteRiskPanel', () => {
  it('lists only the flagged products by default', async () => {
    vi.mocked(api.listWasteRisks).mockResolvedValue([wasteRisk])
    renderWithProviders(<WasteRiskPanel />)

    const rows = (await screen.findAllByRole('row')).slice(1)
    expect(rows).toHaveLength(1)
    expect(within(rows[0]).getByText('Pão de queijo')).toHaveAttribute(
      'href',
      '/dashboard/products/10'
    )
    expect(within(rows[0]).getByText('75%')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Em risco')).toBeInTheDocument()
    expect(api.listWasteRisks).toHaveBeenCalledWith({ atRiskOnly: true })
  })

  it('shows every forecast product when the filter is turned off', async () => {
    vi.mocked(api.listWasteRisks).mockImplementation(async ({ atRiskOnly }) =>
      atRiskOnly ? [wasteRisk] : [wasteRisk, safe]
    )
    renderWithProviders(<WasteRiskPanel />)
    await screen.findByText('Pão de queijo')

    await userEvent.click(
      screen.getByRole('switch', { name: /só os produtos em risco/i })
    )

    expect(await screen.findByText('Bolo de milho')).toBeInTheDocument()
    expect(api.listWasteRisks).toHaveBeenLastCalledWith({ atRiskOnly: false })
    expect(screen.getByText('Sob controle')).toBeInTheDocument()
  })

  it('reassures when no product is at risk', async () => {
    vi.mocked(api.listWasteRisks).mockResolvedValue([])
    renderWithProviders(<WasteRiskPanel />)

    expect(
      await screen.findByText('Nenhum produto em risco de desperdício')
    ).toBeInTheDocument()
  })

  it('points to the products when nothing was forecast yet', async () => {
    vi.mocked(api.listWasteRisks).mockResolvedValue([])
    renderWithProviders(<WasteRiskPanel />)
    await screen.findByText('Nenhum produto em risco de desperdício')

    await userEvent.click(screen.getByRole('switch'))

    expect(
      await screen.findByText('Nenhum produto com previsão de demanda')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver produtos' })).toHaveAttribute(
      'href',
      '/dashboard/products'
    )
  })
})
