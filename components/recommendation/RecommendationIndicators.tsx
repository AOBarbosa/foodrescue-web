import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import { Chip, Stack, Typography } from '@mui/material'

import { formatCurrency, formatPercent } from '@/lib/format'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/recommendation/describe'
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
 */
export function PriceChange({
  recommendation,
}: {
  recommendation: DiscountRecommendationDTO
}) {
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
