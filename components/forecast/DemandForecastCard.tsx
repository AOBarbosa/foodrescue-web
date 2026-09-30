'use client'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  type ChipProps,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'

import { QueryStateView } from '@/components/ui/QueryStateView'
import {
  useLatestDemandForecast,
  usePredictDemand,
} from '@/hooks/useDemandForecast'
import { describeError } from '@/lib/api/errorMessages'
import { AppError } from '@/lib/api/errors'
import {
  CONFIDENCE_LABELS,
  describeSource,
  isAiSource,
  parseInsufficientHistory,
} from '@/lib/forecast/describe'
import { formatDate, formatDateTime, formatTime } from '@/lib/format'
import type {
  DemandForecastDTO,
  ForecastConfidence,
} from '@/types/demandForecast'

const CONFIDENCE_COLORS: Record<ForecastConfidence, ChipProps['color']> = {
  LOW: 'warning',
  MEDIUM: 'info',
  HIGH: 'success',
}

function units(quantity: number): string {
  return `${quantity} ${quantity === 1 ? 'unidade' : 'unidades'}`
}

/** 422: not enough sales yet. Expected while sales can't be registered. */
function insufficientHistoryMessage(error: AppError): string {
  const history = parseInsufficientHistory(error.message)
  if (!history) {
    return 'Ainda não há vendas suficientes deste produto para prever a demanda.'
  }
  return `Ainda não há vendas suficientes deste produto para prever a demanda: encontramos ${history.found} ${history.found === 1 ? 'venda' : 'vendas'} nas últimas ${history.weeks} semanas, e são necessárias pelo menos ${history.required}.`
}

function PredictError({ error }: { error: unknown }) {
  if (error instanceof AppError && error.code === 'BUSINESS_RULE_VIOLATION') {
    return <Alert severity="info">{insufficientHistoryMessage(error)}</Alert>
  }
  return <Alert severity="error">{describeError(error)}</Alert>
}

function ForecastDetails({ forecast }: { forecast: DemandForecastDTO }) {
  const expired = new Date(forecast.forecastUntil).getTime() < Date.now()
  const share =
    forecast.stockQuantity > 0
      ? Math.min(
          100,
          (forecast.predictedQuantity / forecast.stockQuantity) * 100
        )
      : 0

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" component="p">
          {units(forecast.predictedQuantity)}
        </Typography>
        <Typography color="text.secondary">
          devem ser vendidas até {formatTime(forecast.forecastUntil)} de{' '}
          {formatDate(forecast.forecastUntil.slice(0, 10))}, de{' '}
          {units(forecast.stockQuantity)} em estoque no momento do cálculo.
        </Typography>
        <LinearProgress
          variant="determinate"
          value={share}
          aria-label="Parte do estoque que deve ser vendida"
          sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
        />
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Chip
          size="small"
          color={CONFIDENCE_COLORS[forecast.confidence]}
          label={CONFIDENCE_LABELS[forecast.confidence]}
        />
        <Chip
          size="small"
          variant="outlined"
          icon={isAiSource(forecast.source) ? <AutoAwesomeIcon /> : undefined}
          label={describeSource(forecast.source)}
        />
      </Stack>

      {forecast.rationale && (
        <Typography
          component="blockquote"
          sx={{
            m: 0,
            pl: 2,
            borderLeft: 3,
            borderColor: 'divider',
            color: 'text.secondary',
          }}
        >
          {forecast.rationale}
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary">
        Calculada em {formatDateTime(forecast.calculatedAt)} com base em{' '}
        {forecast.sampleSize}{' '}
        {forecast.sampleSize === 1 ? 'venda anterior' : 'vendas anteriores'}.
      </Typography>

      {expired && (
        <Alert severity="info">
          Esta previsão já passou do horário de fechamento a que se refere.
          Recalcule para ter a previsão de agora.
        </Alert>
      )}
    </Stack>
  )
}

/** UC05: latest demand forecast of a product, and recalculating it on demand. */
export function DemandForecastCard({ productId }: { productId: number }) {
  const latest = useLatestDemandForecast(productId)
  const predict = usePredictDemand(productId)
  const forecast = latest.data

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              Previsão de demanda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quantas unidades devem ser vendidas até o fechamento de hoje.
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <Button
              variant={forecast ? 'outlined' : 'contained'}
              startIcon={<QueryStatsIcon />}
              loading={predict.isPending}
              loadingPosition="start"
              onClick={() => predict.mutate()}
            >
              {forecast ? 'Recalcular previsão' : 'Calcular previsão'}
            </Button>
          </Box>
        </Stack>

        <Stack spacing={2}>
          {predict.isPending && (
            <Typography variant="body2" color="text.secondary">
              Calculando… Com a IA isso pode levar alguns segundos.
            </Typography>
          )}
          {predict.isError && <PredictError error={predict.error} />}

          <QueryStateView
            isPending={latest.isPending}
            error={latest.error}
            onRetry={() => void latest.refetch()}
          >
            {forecast ? (
              <ForecastDetails forecast={forecast} />
            ) : (
              <Typography color="text.secondary">
                Nenhuma previsão calculada para este produto ainda.
              </Typography>
            )}
          </QueryStateView>
        </Stack>
      </CardContent>
    </Card>
  )
}
