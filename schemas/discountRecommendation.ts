import { z } from 'zod'

import type { RespondToRecommendationRequest } from '@/types/discountRecommendation'

/*
 * Client-side mirror of RespondToDiscountRecommendationRequest: the percentage
 * is only required to adjust (accepting keeps the suggested one, refusing
 * changes no price), and the backend bounds it with @DecimalMin("0.0") and
 * @DecimalMax("100.0").
 */

/** Accepts `12`, `12,5` and `12.5`; `null` when it isn't a number. */
export function parsePercentage(value: string): number | null {
  const raw = value.trim()
  const normalized = raw.includes(',') ? raw.replace(',', '.') : raw
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Number(normalized)
}

export const adjustRecommendationSchema = z.object({
  adjustedPercentage: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === '') {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o percentual de desconto.',
          fatal: true,
        })
        return z.NEVER
      }
      const percentage = parsePercentage(value)
      if (percentage === null) {
        ctx.addIssue({ code: 'custom', message: 'Informe um valor como 15.' })
      } else if (percentage < 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'O desconto não pode ser negativo.',
        })
      } else if (percentage > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'O desconto não pode passar de 100%.',
        })
      }
    }),
})

export type AdjustRecommendationFormValues = z.infer<
  typeof adjustRecommendationSchema
>

export const ADJUST_FORM_FIELDS = [
  'adjustedPercentage',
] as const satisfies readonly (keyof AdjustRecommendationFormValues)[]

export function toAdjustRequest(
  values: AdjustRecommendationFormValues
): RespondToRecommendationRequest {
  return {
    decision: 'ADJUST',
    adjustedPercentage: parsePercentage(values.adjustedPercentage)!,
  }
}
