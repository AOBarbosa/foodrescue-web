import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/wasteRisks'
import { apiError, wasteRisk } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { WasteRiskCard } from './WasteRiskCard'

vi.mock('@/lib/api/wasteRisks')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('WasteRiskCard', () => {
  it('asks for a forecast when the product was never forecast', async () => {
    vi.mocked(api.getProductWasteRisk).mockResolvedValue(null)
    renderWithProviders(<WasteRiskCard productId={10} />)

    expect(
      await screen.findByText(/calcule a previsão de demanda deste produto/i)
    ).toBeInTheDocument()
  })

  it('flags a product above the threshold', async () => {
    vi.mocked(api.getProductWasteRisk).mockResolvedValue(wasteRisk)
    renderWithProviders(<WasteRiskCard productId={10} />)

    expect(await screen.findByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Em risco')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Devem sobrar 9 unidades no fechamento: 12 unidades em estoque para 3 unidades com venda prevista.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText(/acima de 70% são sinalizados/)).toBeInTheDocument()
    expect(screen.getByText(/26\/09\/2026, 14:00/)).toBeInTheDocument()
  })

  it('shows 0% and no flag when the forecast covers the stock', async () => {
    vi.mocked(api.getProductWasteRisk).mockResolvedValue({
      ...wasteRisk,
      stockQuantity: 5,
      predictedQuantity: 8,
      expectedSurplus: 0,
      riskPercentage: 0,
      atRisk: false,
    })
    renderWithProviders(<WasteRiskCard productId={10} />)

    expect(await screen.findByText('0%')).toBeInTheDocument()
    expect(screen.getByText('Sob controle')).toBeInTheDocument()
    expect(screen.queryByText('Em risco')).not.toBeInTheDocument()
    expect(screen.getByText(/não deve sobrar nada/)).toBeInTheDocument()
  })

  it('shows an error with retry when loading fails', async () => {
    vi.mocked(api.getProductWasteRisk).mockRejectedValue(
      apiError(500, 'INTERNAL_ERROR')
    )
    renderWithProviders(<WasteRiskCard productId={10} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /erro no servidor/i
    )
  })
})
