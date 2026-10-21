import type { ChipProps } from '@mui/material'

import type {
  DiscountRecommendationDTO,
  RecommendationStatus,
} from '@/types/discountRecommendation'

export const STATUS_LABELS: Record<RecommendationStatus, string> = {
  PENDING: 'Aguardando resposta',
  ACCEPTED: 'Aceita',
  ADJUSTED: 'Ajustada',
  REFUSED: 'Recusada',
  EXPIRED: 'Expirada',
}

export const STATUS_COLORS: Record<RecommendationStatus, ChipProps['color']> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  ADJUSTED: 'success',
  REFUSED: 'default',
  EXPIRED: 'default',
}

/** UC10: a recommendation to give the offer priority instead of a discount. */
export function isPriority(
  recommendation: Pick<DiscountRecommendationDTO, 'type'>
): boolean {
  return recommendation.type === 'SURPLUS_DESTINATION'
}

/** UC10: generated after an earlier recommendation of the same product. */
export function isFollowUp(
  recommendation: Pick<DiscountRecommendationDTO, 'previousRecommendationId'>
): boolean {
  return recommendation.previousRecommendationId != null
}

/** What the recommendation proposes, for headings and chain steps. */
export function recommendationTitle(
  recommendation: DiscountRecommendationDTO
): string {
  if (isPriority(recommendation)) return 'Destacar a oferta para os clientes'
  return isFollowUp(recommendation) ? 'Desconto adicional' : 'Desconto sugerido'
}

/** Accepting and adjusting are the two answers that change the price. */
export function changedThePrice(status: RecommendationStatus): boolean {
  return status === 'ACCEPTED' || status === 'ADJUSTED'
}

export type NotAtRisk = { risk: number; threshold: number }

/**
 * Reads the numbers out of the backend's 422 ("product 7 is not at risk of
 * waste: risk is 12.50%, threshold is 70%"). `null` when the wording changes,
 * so callers need a fallback.
 */
export function parseNotAtRisk(message: string): NotAtRisk | null {
  const match =
    /is not at risk of waste: risk is ([\d.]+)%, threshold is ([\d.]+)%/.exec(
      message
    )
  if (!match) return null
  return { risk: Number(match[1]), threshold: Number(match[2]) }
}

/** True for the 422 raised when a pending recommendation already exists. */
export function isAlreadyPending(message: string): boolean {
  return /already has a pending discount recommendation/.test(message)
}

/** True for the 422 raised when the recommendation was already answered. */
export function isNotPending(message: string): boolean {
  return /is not pending: current status is/.test(message)
}
