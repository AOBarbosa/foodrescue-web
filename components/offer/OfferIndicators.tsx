import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import { Chip, Stack, Typography } from '@mui/material'

import { formatCurrency, formatPercent } from '@/lib/format'
import {
  discountPercentage,
  getOfferDisplayStatus,
  OFFER_STATUS_COLORS,
  OFFER_STATUS_LABELS,
} from '@/lib/offer/describe'
import type { OfferDTO } from '@/types/offer'

export function OfferStatusChip({ offer }: { offer: OfferDTO }) {
  const status = getOfferDisplayStatus(offer)
  return (
    <Chip
      size="small"
      label={OFFER_STATUS_LABELS[status]}
      color={OFFER_STATUS_COLORS[status]}
      variant={status === 'ACTIVE' ? 'filled' : 'outlined'}
    />
  )
}

/**
 * The product's original price struck through, the price the consumer pays,
 * and how much was taken off. An offer published without a discount (the
 * price falls back to the product's current price) shows no chip.
 */
export function OfferPrice({
  offer,
  variant = 'h5',
}: {
  offer: OfferDTO
  variant?: 'h5' | 'body1'
}) {
  const discount = discountPercentage(offer)

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      {discount > 0 && (
        <Typography
          sx={{ textDecoration: 'line-through' }}
          color="text.secondary"
        >
          {formatCurrency(offer.originalPrice)}
        </Typography>
      )}
      {discount > 0 && <ArrowRightAltIcon fontSize="small" color="disabled" />}
      <Typography variant={variant} component="p">
        {formatCurrency(offer.discountedPrice)}
      </Typography>
      {discount > 0 && (
        <Chip
          size="small"
          color="success"
          label={`−${formatPercent(discount)}`}
        />
      )}
    </Stack>
  )
}
