'use client'

import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

import {
  calculateVariation,
  formatVariationText,
} from '@/lib/indicators/format'

type IndicatorKpiCardProps = {
  title: string
  value: string
  subtitle: string
  icon: ReactNode
  currentValue?: number
  previousValue?: number
  comparisonFormattedValue?: string
  valueType?: 'currency' | 'units'
  showComparison?: boolean
}

export function IndicatorKpiCard({
  title,
  value,
  subtitle,
  icon,
  currentValue,
  previousValue,
  comparisonFormattedValue,
  valueType,
  showComparison,
}: IndicatorKpiCardProps) {
  const hasComparison =
    showComparison &&
    currentValue !== undefined &&
    previousValue !== undefined &&
    valueType !== undefined

  const variation = hasComparison
    ? calculateVariation(currentValue, previousValue)
    : null

  const getTrendChip = () => {
    if (!variation || !valueType) return null

    const { diff, percentage } = variation
    const isPositive = diff > 0
    const isNegative = diff < 0

    const chipColor = isPositive ? 'success' : isNegative ? 'error' : 'default'
    const IconComponent = isPositive
      ? TrendingUpIcon
      : isNegative
        ? TrendingDownIcon
        : TrendingFlatIcon

    const labelText =
      percentage !== null
        ? `${isPositive ? '+' : ''}${Math.round(percentage)}%`
        : isPositive
          ? `+${diff}`
          : `${diff}`

    return (
      <Chip
        size="small"
        color={chipColor}
        icon={<IconComponent fontSize="small" />}
        label={labelText}
        sx={{ fontWeight: 600 }}
      />
    )
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 700, letterSpacing: 1 }}
            >
              {title}
            </Typography>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {hasComparison && getTrendChip()}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>

          {hasComparison && variation && valueType && (
            <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {formatVariationText(variation, valueType)}
              </Typography>
              {comparisonFormattedValue && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  Período anterior: <strong>{comparisonFormattedValue}</strong>
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
