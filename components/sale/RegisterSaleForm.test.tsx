import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { productKeys } from '@/hooks/useProducts'
import * as api from '@/lib/api/sales'
import { apiError, product, sale } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { RegisterSaleForm } from './RegisterSaleForm'

vi.mock('@/lib/api/sales')

const quantityField = () => screen.getByLabelText(/quantidade vendida/i)
const priceField = () => screen.getByLabelText(/preço unitário/i)
const dateField = () => screen.getByLabelText(/data e hora da venda/i)
const submit = () => screen.getByRole('button', { name: /registrar venda/i })

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 8, 24, 12))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('RegisterSaleForm', () => {
  it('registers a sale with only the quantity and reports the deducted stock', async () => {
    vi.mocked(api.registerSale).mockResolvedValue(sale)
    const user = userEvent.setup()
    const { queryClient } = renderWithProviders(
      <RegisterSaleForm product={product} />
    )
    queryClient.setQueryData(productKeys.detail(product.id), product)

    await user.type(quantityField(), '3')
    await user.click(submit())

    expect(
      await screen.findByText(/venda registrada: 3 unidades a r\$/i)
    ).toHaveTextContent('O estoque foi atualizado.')
    expect(api.registerSale).toHaveBeenCalledWith({
      productId: product.id,
      quantity: 3,
    })
    // The stock changed on the backend, so the cached product must be refetched.
    expect(
      queryClient.getQueryState(productKeys.detail(product.id))?.isInvalidated
    ).toBe(true)
    expect(quantityField()).toHaveValue(null)
  })

  it('sends the practiced price and the moment of the sale when they are informed', async () => {
    vi.mocked(api.registerSale).mockResolvedValue({
      ...sale,
      quantity: 2,
      unitPrice: 7.5,
      totalPrice: 15,
    })
    const user = userEvent.setup()
    renderWithProviders(<RegisterSaleForm product={product} />)

    await user.type(quantityField(), '2')
    await user.type(priceField(), '7,50')
    fireEvent.change(dateField(), { target: { value: '2026-09-24T09:15' } })
    await user.click(submit())

    await waitFor(() =>
      expect(api.registerSale).toHaveBeenCalledWith({
        productId: product.id,
        quantity: 2,
        unitPrice: 7.5,
        soldAt: '2026-09-24T09:15:00',
      })
    )
  })

  it('blocks a quantity above the stock before calling the API', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterSaleForm product={product} />)

    await user.type(quantityField(), '13')
    await user.click(submit())

    expect(
      await screen.findByText(
        'Estoque insuficiente: há 12 unidades disponíveis.'
      )
    ).toBeInTheDocument()
    expect(api.registerSale).not.toHaveBeenCalled()
  })

  it('requires a quantity greater than zero', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterSaleForm product={product} />)

    await user.click(submit())
    expect(
      await screen.findByText('Informe a quantidade vendida.')
    ).toBeInTheDocument()

    await user.type(quantityField(), '0')
    await user.click(submit())
    expect(
      await screen.findByText('A quantidade deve ser maior que zero.')
    ).toBeInTheDocument()
    expect(api.registerSale).not.toHaveBeenCalled()
  })

  it("explains the backend's 422 when the stock ran out meanwhile", async () => {
    vi.mocked(api.registerSale).mockRejectedValue(
      apiError(422, 'BUSINESS_RULE_VIOLATION')
    )
    const user = userEvent.setup()
    renderWithProviders(<RegisterSaleForm product={product} />)

    await user.type(quantityField(), '3')
    await user.click(submit())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /estoque insuficiente para esta venda/i
    )
    expect(screen.getByText('Estoque insuficiente.')).toBeInTheDocument()
  })

  it('maps a field sub-error from the backend onto its field', async () => {
    vi.mocked(api.registerSale).mockRejectedValue(
      apiError(422, 'VALIDATION_ERROR', [
        {
          field: 'soldAt',
          message: 'soldAt must not be in the future',
          code: 'SOLD_AT_IN_FUTURE',
        },
      ])
    )
    const user = userEvent.setup()
    renderWithProviders(<RegisterSaleForm product={product} />)

    await user.type(quantityField(), '1')
    await user.click(submit())

    expect(
      await screen.findByText('A venda não pode estar no futuro.')
    ).toBeInTheDocument()
  })

  it('disables the form when the product has no stock', () => {
    renderWithProviders(
      <RegisterSaleForm product={{ ...product, stockQuantity: 0 }} />
    )

    expect(submit()).toBeDisabled()
    expect(quantityField()).toBeDisabled()
    expect(
      screen.getByText(/este produto está sem estoque/i)
    ).toBeInTheDocument()
  })
})
