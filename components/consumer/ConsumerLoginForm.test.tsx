import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/consumers'
import { getSession } from '@/lib/auth/session'
import { apiError, consumer } from '@/test/fixtures'
import { router } from '@/test/navigation'
import { renderWithProviders } from '@/test/render'

import { ConsumerLoginForm } from './ConsumerLoginForm'

vi.mock(
  'next/navigation',
  async () => (await import('@/test/navigation')).navigationMock
)
vi.mock('@/lib/api/consumers')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('ConsumerLoginForm', () => {
  it('logs in as a consumer and redirects to the requested path', async () => {
    vi.mocked(api.loginConsumer).mockResolvedValue({
      consumer,
      token: 'consumer-jwt',
    })
    const user = userEvent.setup()
    renderWithProviders(<ConsumerLoginForm redirectTo="/orders" />)

    await user.type(screen.getByLabelText(/e-mail/i), consumer.email)
    await user.type(screen.getByLabelText(/^senha/i), 'secret')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/orders'))
    expect(api.loginConsumer).toHaveBeenCalledWith({
      email: consumer.email,
      password: 'secret',
    })
    expect(getSession()).toEqual({
      role: 'CONSUMER',
      id: consumer.id,
      name: consumer.name,
    })
  })

  it('shows a friendly message for wrong credentials (422)', async () => {
    vi.mocked(api.loginConsumer).mockRejectedValue(
      apiError(422, 'BUSINESS_RULE_VIOLATION')
    )
    const user = userEvent.setup()
    renderWithProviders(<ConsumerLoginForm />)

    await user.type(screen.getByLabelText(/e-mail/i), consumer.email)
    await user.type(screen.getByLabelText(/^senha/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha incorretos.'
    )
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('validates required fields client-side', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ConsumerLoginForm />)

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
    expect(api.loginConsumer).not.toHaveBeenCalled()
  })
})
