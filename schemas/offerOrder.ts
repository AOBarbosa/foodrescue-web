import { z } from 'zod'

import type { ReserveOfferRequest } from '@/types/offerOrder'

/*
 * Client-side mirror of ReserveOfferRequest (@NotNull, @Positive) and the
 * available-quantity check in OfferService.decreaseQuantity (422 when the
 * requested quantity exceeds what is left in the offer).
 */

export function reserveOfferSchema(availableQuantity: number) {
  return z.object({
    quantity: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === '') {
          ctx.addIssue({
            code: 'custom',
            message: 'Informe a quantidade desejada.',
            fatal: true,
          })
          return z.NEVER
        }
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
        } else if (quantity > availableQuantity) {
          ctx.addIssue({
            code: 'custom',
            message: `Quantidade indisponível: há ${availableQuantity} ${availableQuantity === 1 ? 'unidade disponível' : 'unidades disponíveis'} na oferta.`,
          })
        }
      }),
  })
}

export type ReserveOfferFormValues = z.infer<
  ReturnType<typeof reserveOfferSchema>
>

export const RESERVE_OFFER_FORM_FIELDS = [
  'quantity',
] as const satisfies readonly (keyof ReserveOfferFormValues)[]

export function toReserveOfferRequest(
  offerId: number,
  values: ReserveOfferFormValues
): ReserveOfferRequest {
  return {
    offerId,
    quantity: Number(values.quantity),
  }
}
