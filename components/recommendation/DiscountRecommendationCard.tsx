'use client'

import { useMemo } from 'react'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'

import { QueryStateView } from '@/components/ui/QueryStateView'
import {
  useProductRecommendations,
  useRecommendDiscount,
} from '@/hooks/useDiscountRecommendations'
import { describeError } from '@/lib/api/errorMessages'
import { AppError } from '@/lib/api/errors'
import { formatCurrency, formatDateTime, formatPercent } from '@/lib/format'
import {
  changedThePrice,
  isAlreadyPending,
  parseNotAtRisk,
} from '@/lib/recommendation/describe'
import type { DiscountRecommendationDTO } from '@/types/discountRecommendation'

import { RecommendationActions } from './RecommendationActions'
import {
  PriceChange,
  RecommendationStatusChip,
} from './RecommendationIndicators'

/** 422: the product is not at risk, or already has a pending recommendation. */
function RecommendError({ error }: { error: unknown }) {
  if (
    !(error instanceof AppError) ||
    error.code !== 'BUSINESS_RULE_VIOLATION'
  ) {
    return <Alert severity="error">{describeError(error)}</Alert>
  }

  if (isAlreadyPending(error.message)) {
    return (
      <Alert severity="info">
        Este produto já tem uma recomendação aguardando resposta. Responda a
        atual antes de pedir outra.
      </Alert>
    )
  }

  const notAtRisk = parseNotAtRisk(error.message)
  return (
    <Alert severity="info">
      {notAtRisk
        ? `Este produto não está em risco de desperdício: o risco é de ${formatPercent(notAtRisk.risk)} e o limite é ${formatPercent(notAtRisk.threshold)}. Só produtos sinalizados recebem recomendação de desconto.`
        : 'Só produtos sinalizados com risco de desperdício recebem recomendação de desconto.'}
    </Alert>
  )
}

function PendingRecommendation({
  recommendation,
}: {
  recommendation: DiscountRecommendationDTO
}) {
  return (
    <Stack spacing={2}>
      <Box>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', mb: 0.5 }}
        >
          <Typography color="text.secondary">Desconto sugerido</Typography>
          <RecommendationStatusChip status={recommendation.status} />
        </Stack>
        <PriceChange recommendation={recommendation} />
      </Box>

      <Typography variant="caption" color="text.secondary">
        Sugerida em {formatDateTime(recommendation.createdAt)}
        {recommendation.expiresAt &&
          `, expira em ${formatDateTime(recommendation.expiresAt)}`}
        . O preço atual hoje é {formatCurrency(recommendation.currentPrice)}.
      </Typography>

      <RecommendationActions recommendation={recommendation} />
    </Stack>
  )
}

function History({ answered }: { answered: DiscountRecommendationDTO[] }) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Recomendações anteriores
      </Typography>
      <Stack spacing={1}>
        {answered.map((recommendation) => (
          <Stack
            key={recommendation.id}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <RecommendationStatusChip status={recommendation.status} />
            <Typography variant="body2">
              {formatPercent(recommendation.suggestedPercentage)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {changedThePrice(recommendation.status)
                ? `preço para ${formatCurrency(recommendation.priceWithDiscount)}`
                : 'preço mantido'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(
                recommendation.respondedAt ?? recommendation.createdAt
              )}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

/** UC07: suggested discount for a product at risk, and the answer to it. */
export function DiscountRecommendationCard({
  productId,
}: {
  productId: number
}) {
  const { data, isPending, error, refetch } =
    useProductRecommendations(productId)
  const recommend = useRecommendDiscount(productId)

  const recommendations = useMemo(() => data ?? [], [data])
  // The backend returns them newest first, so the pending one (at most one per
  // product) is the head when it exists.
  const pending = recommendations.find(
    (recommendation) => recommendation.status === 'PENDING'
  )
  const answered = recommendations.filter(
    (recommendation) => recommendation.status !== 'PENDING'
  )

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'start' }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              Preço dinâmico
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Desconto sugerido para produtos em risco de desperdício. Você
              aceita, ajusta o percentual ou recusa.
            </Typography>
          </Box>
          {!pending && (
            <Button
              variant="contained"
              startIcon={<LocalOfferIcon />}
              loading={recommend.isPending}
              onClick={() => recommend.mutate()}
              sx={{ flexShrink: 0 }}
            >
              Sugerir desconto
            </Button>
          )}
        </Stack>

        <Stack spacing={3}>
          {recommend.isError && <RecommendError error={recommend.error} />}

          <QueryStateView
            isPending={isPending}
            error={error}
            onRetry={() => void refetch()}
          >
            <Stack spacing={3}>
              {pending ? (
                <PendingRecommendation recommendation={pending} />
              ) : (
                <Typography color="text.secondary">
                  Nenhuma recomendação aguardando resposta. Peça uma sugestão
                  quando o produto estiver em risco de desperdício.
                </Typography>
              )}

              {answered.length > 0 && (
                <>
                  <Divider />
                  <History answered={answered} />
                </>
              )}
            </Stack>
          </QueryStateView>
        </Stack>
      </CardContent>
    </Card>
  )
}
