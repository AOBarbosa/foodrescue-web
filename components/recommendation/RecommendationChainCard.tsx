'use client'

import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

import { QueryStateView } from '@/components/ui/QueryStateView'
import { useRecommendationChain } from '@/hooks/useDiscountRecommendations'
import { formatCurrency, formatDateTime, formatPercent } from '@/lib/format'
import {
  changedThePrice,
  isPriority,
  recommendationTitle,
} from '@/lib/recommendation/describe'
import type { DiscountRecommendationDTO } from '@/types/discountRecommendation'

import { RecommendationStatusChip } from './RecommendationIndicators'

function outcome(recommendation: DiscountRecommendationDTO): string {
  if (isPriority(recommendation)) return 'sem alteração de preço'
  const percentage =
    recommendation.suggestedPercentage === null
      ? ''
      : `${formatPercent(recommendation.suggestedPercentage)} · `
  return changedThePrice(recommendation.status)
    ? `${percentage}preço para ${formatCurrency(recommendation.priceWithDiscount)}`
    : `${percentage}preço mantido`
}

/**
 * UC10: the chain of recommendations made for a product today — the initial
 * one and each follow-up generated while it stayed at risk, oldest first.
 */
export function RecommendationChainCard({ productId }: { productId: number }) {
  const { data, isPending, error, refetch } = useRecommendationChain(productId)

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2">
            Sequência de recomendações do dia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quando o produto continua em risco perto do prazo, o sistema sugere
            um novo desconto ou destaca a oferta para os clientes.
          </Typography>
        </Box>

        <QueryStateView
          isPending={isPending}
          error={error}
          onRetry={() => void refetch()}
        >
          {data?.length === 0 ? (
            <Typography color="text.secondary">
              Nenhuma recomendação foi feita para este produto hoje.
            </Typography>
          ) : (
            <Stack component="ol" spacing={2} sx={{ m: 0, p: 0 }}>
              {data?.map((recommendation, index) => (
                <Stack
                  key={recommendation.id}
                  component="li"
                  direction="row"
                  spacing={2}
                  sx={{ listStyle: 'none' }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'grid',
                      placeItems: 'center',
                      typography: 'caption',
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Typography variant="subtitle2">
                        {recommendationTitle(recommendation)}
                      </Typography>
                      <RecommendationStatusChip
                        status={recommendation.status}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {outcome(recommendation)} ·{' '}
                      {formatDateTime(
                        recommendation.respondedAt ?? recommendation.createdAt
                      )}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        </QueryStateView>
      </CardContent>
    </Card>
  )
}
