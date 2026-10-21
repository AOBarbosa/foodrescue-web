import { z } from 'zod'

import { formatCurrency } from '@/lib/format'
import { parsePrice } from '@/schemas/product'
import type { CreateOfferRequest } from '@/types/offer'

/*
 * Client-side mirror of CreateOfferRequest and OfferBusinessValidator: every
 * field is optional (the backend falls back to the product's current price,
 * to its whole stock and to today's closing time), and when informed the
 * price must be > 0 and not above the product's original price, the quantity
 * must be an integer > 0 within the stock, and the deadline must be in the
 * future. "The product already has an active offer" is a service rule (422)
 * that this schema cannot see, so the form handles it as a server error.
 */

/** `datetime-local` gives `yyyy-MM-ddTHH:mm`; the backend wants seconds too. */
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/

/**
 * "há 4 unidades disponíveis" / "há 1 unidade disponível". Shared with the
 * form, which repeats the message when the backend rejects the quantity
 * against a stock that changed in the meantime.
 */
export function describeAvailableStock(stock: number): string {
  return stock === 1
    ? 'Estoque insuficiente: há 1 unidade disponível.'
    : `Estoque insuficiente: há ${stock} unidades disponíveis.`
}

export function createOfferSchema(product: {
  originalPrice: number
  stockQuantity: number
}) {
  return z.object({
    discountedPrice: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === '') return
        const price = parsePrice(value)
        if (price === null) {
          ctx.addIssue({
            code: 'custom',
            message: 'Informe um valor como 9,90.',
          })
        } else if (price <= 0) {
          ctx.addIssue({
            code: 'custom',
            message: 'O preço deve ser maior que zero.',
          })
        } else if (price > product.originalPrice) {
          ctx.addIssue({
            code: 'custom',
            message: `O preço da oferta não pode passar de ${formatCurrency(product.originalPrice)} (preço original).`,
          })
        }
      }),
    availableQuantity: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === '') return
        if (!/^-?\d+$/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Informe um número inteiro.',
            fatal: true,
          })
          return z.NEVER
        }
        const quantity = Number(value)
        if (quantity <= 0) {
          ctx.addIssue({
            code: 'custom',
            message: 'A quantidade deve ser maior que zero.',
          })
        } else if (quantity > product.stockQuantity) {
          ctx.addIssue({
            code: 'custom',
            message: describeAvailableStock(product.stockQuantity),
          })
        }
      }),
    expiresAt: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === '') return
        if (!LOCAL_DATE_TIME.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Data e hora inválidas.',
            fatal: true,
          })
          return z.NEVER
        }
        if (new Date(value).getTime() <= Date.now()) {
          ctx.addIssue({
            code: 'custom',
            message: 'O prazo da oferta precisa estar no futuro.',
          })
        }
      }),
  })
}

export type OfferFormValues = z.infer<ReturnType<typeof createOfferSchema>>

export const OFFER_FORM_FIELDS = [
  'discountedPrice',
  'availableQuantity',
  'expiresAt',
] as const satisfies readonly (keyof OfferFormValues)[]

/** Empty optional fields are left out so the backend applies its defaults. */
export function toCreateOfferRequest(
  productId: number,
  values: OfferFormValues
): CreateOfferRequest {
  return {
    productId,
    ...(values.discountedPrice !== ''
      ? { discountedPrice: parsePrice(values.discountedPrice)! }
      : {}),
    ...(values.availableQuantity !== ''
      ? { availableQuantity: Number(values.availableQuantity) }
      : {}),
    ...(values.expiresAt !== ''
      ? {
          expiresAt:
            values.expiresAt.length === 16
              ? `${values.expiresAt}:00`
              : values.expiresAt,
        }
      : {}),
  }
}
