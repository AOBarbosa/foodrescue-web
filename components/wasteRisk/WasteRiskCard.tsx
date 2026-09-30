'use client'

import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

import { QueryStateView } from '@/components/ui/QueryStateView'
import { useProductWasteRisk } from '@/hooks/useWasteRisk'
import { formatDateTime, formatPercent } from '@/lib/format'
import type { WasteRiskDTO } from '@/types/wasteRisk'

import { WasteRiskBar, WasteRiskChip } from './WasteRiskIndicator'

function units(quantity: number): string {
  return `${quantity} ${quantity === 1 ? 'unidade' : 'unidades'}`
}

function RiskDetails({ risk }: { risk: WasteRiskDTO }) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <WasteRiskBar {...risk} />
        </Box>
        <WasteRiskChip atRisk={risk.atRisk} />
      </Stack>

      <Typography color="text.secondary">
        {risk.expectedSurplus === 0
          ? `A previsão de venda (${units(risk.predictedQuantity)}) cobre o estoque atual de ${units(risk.stockQuantity)}: não deve sobrar nada.`
          : `Devem sobrar ${units(risk.expectedSurplus)} no fechamento: ${units(risk.stockQuantity)} em estoque para ${units(risk.predictedQuantity)} com venda prevista.`}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Produtos com risco acima de {formatPercent(risk.riskThreshold)} são
        sinalizados. Baseado na previsão calculada em{' '}
        {formatDateTime(risk.forecastCalculatedAt)} e no estoque atual.
      </Typography>
    </Stack>
  )
}

/** UC06: how much of the current stock is expected to be left over. */
export function WasteRiskCard({ productId }: { productId: number }) {
  const {
    data: risk,
    isPending,
    error,
    refetch,
  } = useProductWasteRisk(productId)

  return (
    <Card
      variant={risk?.atRisk ? 'outlined' : undefined}
      sx={risk?.atRisk ? { borderColor: 'error.main' } : undefined}
    >
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2">
            Risco de desperdício
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quanto do estoque atual deve sobrar no fechamento, segundo a
            previsão de demanda.
          </Typography>
        </Box>

        <QueryStateView
          isPending={isPending}
          error={error}
          onRetry={() => void refetch()}
        >
          {risk ? (
            <RiskDetails risk={risk} />
          ) : (
            <Typography color="text.secondary">
              Calcule a previsão de demanda deste produto para avaliar o risco
              de desperdício.
            </Typography>
          )}
        </QueryStateView>
      </CardContent>
    </Card>
  )
}
