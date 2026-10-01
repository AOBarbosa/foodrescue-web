import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/indicators'
import { apiError, indicators } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { IndicatorsDashboard } from './IndicatorsDashboard'

vi.mock('@/lib/api/indicators')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('IndicatorsDashboard', () => {
  it('renders indicators data when the query succeeds', async () => {
    vi.mocked(api.getIndicators).mockResolvedValue(indicators)

    renderWithProviders(<IndicatorsDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Alimentos Salvos')).toBeInTheDocument()
      expect(screen.getByText('Receita Recuperada')).toBeInTheDocument()
      expect(
        screen.getByText('Adesão às recomendações da IA')
      ).toBeInTheDocument()
    })

    expect(screen.getByText('45 unidades')).toBeInTheDocument()
    expect(screen.getByText(/382,50/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '12' })).toBeInTheDocument()
    expect(screen.getByText(/Taxa de adesão/)).toBeInTheDocument()
  })

  it('allows switching period to WEEK and fetches updated data', async () => {
    vi.mocked(api.getIndicators).mockResolvedValue(indicators)

    renderWithProviders(<IndicatorsDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Alimentos Salvos')).toBeInTheDocument()
    })

    const weekButton = screen.getByRole('button', { name: /Últimos 7 dias/i })
    fireEvent.click(weekButton)

    await waitFor(() => {
      expect(api.getIndicators).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'WEEK' })
      )
    })
  })

  it('enables comparison and displays variation chips and previous period', async () => {
    vi.mocked(api.getIndicators).mockResolvedValue(indicators)

    renderWithProviders(<IndicatorsDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Alimentos Salvos')).toBeInTheDocument()
    })

    const compareSwitch = screen.getByRole('switch', {
      name: /Comparar com período anterior/i,
    })
    fireEvent.click(compareSwitch)

    await waitFor(() => {
      expect(api.getIndicators).toHaveBeenCalledWith(
        expect.objectContaining({ compare: true })
      )
      expect(
        screen.getAllByText(/vs\. período anterior/i).length
      ).toBeGreaterThan(0)
      expect(screen.getByText('30 unidades')).toBeInTheDocument()
    })
  })

  it('shows date inputs when CUSTOM is selected and validates date order', async () => {
    vi.mocked(api.getIndicators).mockResolvedValue(indicators)

    renderWithProviders(<IndicatorsDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Alimentos Salvos')).toBeInTheDocument()
    })

    const customButton = screen.getByRole('button', { name: /Personalizado/i })
    fireEvent.click(customButton)

    const fromInput = screen.getByLabelText(/^De$/i)
    const toInput = screen.getByLabelText(/^Até$/i)

    expect(fromInput).toBeInTheDocument()
    expect(toInput).toBeInTheDocument()

    // Test invalid dates
    fireEvent.change(fromInput, { target: { value: '2026-09-20' } })
    fireEvent.change(toInput, { target: { value: '2026-09-10' } })

    expect(
      screen.getByText('A data inicial não pode ser posterior à data final.')
    ).toBeInTheDocument()
  })

  it('shows error alert and allows retrying when API fails', async () => {
    vi.mocked(api.getIndicators).mockRejectedValue(
      apiError(500, 'INTERNAL_ERROR', [], 'Erro ao buscar indicadores')
    )

    renderWithProviders(<IndicatorsDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', {
      name: /Tentar novamente/i,
    })
    expect(retryButton).toBeInTheDocument()

    vi.mocked(api.getIndicators).mockResolvedValue(indicators)
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Alimentos Salvos')).toBeInTheDocument()
    })
  })
})
