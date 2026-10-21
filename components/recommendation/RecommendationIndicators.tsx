import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import { Chip, Stack, Typography } from '@mui/material'

import { formatCurrency, formatPercent } from '@/lib/format'
import {
  isPriority,
  STATUS_COLORS,
  STATUS_LABELS,
} from '@/lib/recommendation/describe'
import type {
  DiscountRecommendationDTO,
  RecommendationStatus,
} from '@/types/discountRecommendation'

export function RecommendationStatusChip({
  status,
}: {
  status: RecommendationStatus
}) {
  return (
    <Chip
      size="small"
      label={STATUS_LABELS[status]}
      color={STATUS_COLORS[status]}
      variant={status === 'PENDING' ? 'filled' : 'outlined'}
    />
  )
}

/**
 * The discount always applies to the original price, never to the current
 * one — answering a second recommendation never compounds the discount.
 *
 * UC10: a recommendation to give the offer priority carries no percentage and
 * moves no price, so it shows the current price instead.
 */
export function PriceChange({
  recommendation,
}: {
  recommendation: DiscountRecommendationDTO
}) {
  if (
    isPriority(recommendation) ||
    recommendation.suggestedPercentage === null
  ) {
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Chip size="small" color="info" label="Prioridade" />
        <Typography color="text.secondary">
          Preço mantido em {formatCurrency(recommendation.currentPrice)}
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      <Typography
        sx={{ textDecoration: 'line-through' }}
        color="text.secondary"
      >
        {formatCurrency(recommendation.originalPrice)}
      </Typography>
      <ArrowRightAltIcon fontSize="small" color="disabled" />
      <Typography variant="h5" component="p">
        {formatCurrency(recommendation.priceWithDiscount)}
      </Typography>
      <Chip
        size="small"
        color="success"
        label={`−${formatPercent(recommendation.suggestedPercentage)}`}
      />
    </Stack>
  )
}
