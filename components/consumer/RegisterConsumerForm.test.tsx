import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '@/lib/api/consumers'
import { getSession } from '@/lib/auth/session'
import { apiError, consumer } from '@/test/fixtures'
import { router } from '@/test/navigation'
import { renderWithProviders } from '@/test/render'

import { RegisterConsumerForm } from './RegisterConsumerForm'

vi.mock(
  'next/navigation',
  async () => (await import('@/test/navigation')).navigationMock
)
vi.mock('@/lib/api/consumers')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('RegisterConsumerForm', () => {
  it('registers a consumer, starts a CONSUMER session and navigates to /offers', async () => {
    vi.mocked(api.registerConsumer).mockResolvedValue({
      consumer,
      token: 'consumer-jwt',
    })
    const user = userEvent.setup()
    renderWithProviders(<RegisterConsumerForm />)

    await user.type(screen.getByLabelText(/nome/i), consumer.name)
    await user.type(screen.getByLabelText(/e-mail/i), consumer.email)
    await user.type(screen.getByLabelText(/^senha/i), 'secret')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/offers'))
    expect(api.registerConsumer).toHaveBeenCalledWith({
      name: consumer.name,
      email: consumer.email,
      password: 'secret',
    })
    expect(getSession()).toEqual({
      role: 'CONSUMER',
      id: consumer.id,
      name: consumer.name,
    })
  })

  it('maps EMAIL_ALREADY_EXISTS (422) onto the email field', async () => {
    vi.mocked(api.registerConsumer).mockRejectedValue(
      apiError(422, 'VALIDATION_ERROR', [
        {
          field: 'email',
          message: 'email already registered',
          code: 'EMAIL_ALREADY_EXISTS',
        },
      ])
    )
    const user = userEvent.setup()
    renderWithProviders(<RegisterConsumerForm />)

    await user.type(screen.getByLabelText(/nome/i), consumer.name)
    await user.type(screen.getByLabelText(/e-mail/i), consumer.email)
    await user.type(screen.getByLabelText(/^senha/i), 'secret')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(
      await screen.findByText('Este e-mail já está cadastrado.')
    ).toBeInTheDocument()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('validates required fields client-side before calling the API', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterConsumerForm />)

    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(await screen.findByText('Informe seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe o e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
    expect(api.registerConsumer).not.toHaveBeenCalled()
  })
})
