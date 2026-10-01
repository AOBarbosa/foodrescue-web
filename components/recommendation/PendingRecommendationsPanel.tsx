'use client'

import Link from 'next/link'
import PriceCheckIcon from '@mui/icons-material/PriceCheck'
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material'

import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'
import { QueryStateView } from '@/components/ui/QueryStateView'
import { usePendingRecommendations } from '@/hooks/useDiscountRecommendations'
import { formatCurrency, formatDateTime } from '@/lib/format'

import { RecommendationActions } from './RecommendationActions'
import { PriceChange } from './RecommendationIndicators'

/**
 * UC07: every discount recommendation of the establishment still waiting for
 * an answer, oldest first — the ones closest to expiring come first.
 */
export function PendingRecommendationsPanel() {
  const {
    data: recommendations,
    isPending,
    error,
    refetch,
  } = usePendingRecommendations()

  return (
    <QueryStateView
      isPending={isPending}
      error={error}
      onRetry={() => void refetch()}
    >
      {recommendations?.length === 0 ? (
        <EmptyState
          icon={<PriceCheckIcon fontSize="inherit" />}
          title="Nenhuma recomendação aguardando resposta"
          description="As sugestões de desconto aparecem aqui quando você as pede na página de um produto em risco de desperdício."
          action={
            <LinkButton href="/dashboard/waste-risks" variant="contained">
              Ver produtos em risco
            </LinkButton>
          }
        />
      ) : (
        <Stack spacing={2}>
          {recommendations?.map((recommendation) => (
            <Card key={recommendation.id}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: { md: 'center' },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component={Link}
                      href={`/dashboard/products/${recommendation.productId}`}
                      sx={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {recommendation.productName}
                    </Typography>
                    <PriceChange recommendation={recommendation} />
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Preço atual {formatCurrency(recommendation.currentPrice)} ·
                    sugerida em {formatDateTime(recommendation.createdAt)}
                    {recommendation.expiresAt &&
                      ` · expira em ${formatDateTime(recommendation.expiresAt)}`}
                  </Typography>

                  <Divider />
                  <RecommendationActions recommendation={recommendation} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </QueryStateView>
  )
}
