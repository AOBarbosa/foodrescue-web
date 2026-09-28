import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/demandForecasts'
import { apiError, demandForecast } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { DemandForecastCard } from './DemandForecastCard'

vi.mock('@/lib/api/demandForecasts')

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 8, 26, 15, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DemandForecastCard', () => {
  it('invites to calculate when there is no forecast yet', async () => {
    vi.mocked(api.getLatestDemandForecast).mockResolvedValue(null)
    renderWithProviders(<DemandForecastCard productId={10} />)

    expect(
      await screen.findByText(
        'Nenhuma previsão calculada para este produto ainda.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /calcular previsão/i })
    ).toBeInTheDocument()
  })

  it('shows the latest statistical forecast', async () => {
    vi.mocked(api.getLatestDemandForecast).mockResolvedValue(demandForecast)
    renderWithProviders(<DemandForecastCard productId={10} />)

    expect(await screen.findByText('8 unidades')).toBeInTheDocument()
    expect(screen.getByText(/até 22:00 de 26\/09\/2026/)).toBeInTheDocument()
    expect(screen.getByText(/12 unidades em estoque/)).toBeInTheDocument()
    expect(screen.getByText('Confiança alta')).toBeInTheDocument()
    expect(
      screen.getByText('Calculada pela média de vendas do mesmo dia da semana')
    ).toBeInTheDocument()
    expect(screen.getByText(/23 vendas anteriores/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /recalcular previsão/i })
    ).toBeInTheDocument()
    expect(screen.queryByText(/já passou do horário/)).not.toBeInTheDocument()
  })

  it('shows the AI source and its rationale', async () => {
    vi.mocked(api.getLatestDemandForecast).mockResolvedValue({
      ...demandForecast,
      confidence: 'MEDIUM',
      source: 'gemini:gemini-3.8-flash',
      rationale: 'Sábados à tarde vendem mais pães.',
    })
    renderWithProviders(<DemandForecastCard productId={10} />)

    expect(
      await screen.findByText('Calculada por IA (Gemini)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Sábados à tarde vendem mais pães.')
    ).toBeInTheDocument()
    expect(screen.getByText('Confiança média')).toBeInTheDocument()
  })

  it('flags a forecast whose closing time has passed', async () => {
    vi.mocked(api.getLatestDemandForecast).mockResolvedValue({
      ...demandForecast,
      calculatedAt: '2026-09-25T10:00:00',
      forecastUntil: '2026-09-25T22:00:00',
    })
    renderWithProviders(<DemandForecastCard productId={10} />)

    expect(
      await screen.findByText(/já passou do horário de fechamento/)
    ).toBeInTheDocument()
  })

  it('calculates a new forecast on demand', async () => {
    vi.mocked(api.getLatestDemandForecast).mockResolvedValue(null)
    vi.mocked(api.predictDemand).mockResolvedValue(demandForecast)
    const user = userEvent.setup()
    renderWithProviders(<DemandForecastCard productId={10} />)

    await user.click(
      await screen.findByRole('button', { name: /calcular previsão/i })
    )

    expect(await screen.findByText('8 unidades')).toBeInTheDocument()
    expect(api.predictDemand).toHaveBeenCalledWith(10)
  })

  it('explains insufficient sales history (422) as information, not failure', async () => {
    vi.mocked(api.getLatestDemandForecast).mockResolvedValue(null)
    vi.mocked(api.predictDemand).mockRejectedValue(
      apiError(
        422,
        'BUSINESS_RULE_VIOLATION',
        undefined,
        'insufficient sales history to forecast demand: 2 sales found in the last 4 weeks, at least 5 required'
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<DemandForecastCard productId={10} />)

    await user.click(
      await screen.findByRole('button', { name: /calcular previsão/i })
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'encontramos 2 vendas nas últimas 4 semanas, e são necessárias pelo menos 5'
    )
    expect(alert.className).toMatch(/info/i)
  })

  it('shows a generic error for other failures', async () => {
    vi.mocked(api.getLatestDemandForecast).mockResolvedValue(null)
    vi.mocked(api.predictDemand).mockRejectedValue(
      apiError(500, 'INTERNAL_ERROR')
    )
    const user = userEvent.setup()
    renderWithProviders(<DemandForecastCard productId={10} />)

    await user.click(
      await screen.findByRole('button', { name: /calcular previsão/i })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /erro no servidor/i
    )
  })
})
