'use client'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import TuneIcon from '@mui/icons-material/Tune'
import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'

import { formatPercent } from '@/lib/format'
import { calculateAcceptanceRate } from '@/lib/indicators/format'
import type { WasteAndSavingsIndicatorsDTO } from '@/types/indicators'

type RecommendationStatsCardProps = {
  indicators: WasteAndSavingsIndicatorsDTO
  showComparison?: boolean
}

export function RecommendationStatsCard({
  indicators,
  showComparison,
}: RecommendationStatsCardProps) {
  const {
    acceptedRecommendations,
    refusedRecommendations,
    adjustedRecommendations,
    comparisonPeriod,
  } = indicators

  const totalDecisions = acceptedRecommendations + refusedRecommendations
  const rate = calculateAcceptanceRate(
    acceptedRecommendations,
    refusedRecommendations
  )

  const prevTotal = comparisonPeriod
    ? comparisonPeriod.acceptedRecommendations +
      comparisonPeriod.refusedRecommendations
    : null
  const prevRate = comparisonPeriod
    ? calculateAcceptanceRate(
        comparisonPeriod.acceptedRecommendations,
        comparisonPeriod.refusedRecommendations
      )
    : null

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Adesão às recomendações da IA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Como seu estabelecimento respondeu aos descontos sugeridos pela
                IA para acelerar a saída de produtos próximos ao vencimento.
              </Typography>
            </Box>
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
              <AutoAwesomeIcon color="primary" />
            </Box>
          </Stack>

          {totalDecisions === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nenhuma recomendação de desconto respondida neste período.
              </Typography>
            </Box>
          ) : (
            <>
              <Box>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Taxa de adesão ({acceptedRecommendations} de{' '}
                    {totalDecisions})
                  </Typography>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{ fontWeight: 700 }}
                  >
                    {formatPercent(rate)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={rate}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'action.disabledBackground',
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', mb: 1 }}
                    >
                      <CheckCircleOutlinedIcon
                        color="success"
                        fontSize="small"
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Aceitas
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {acceptedRecommendations}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sugestões acatadas
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', mb: 1 }}
                    >
                      <TuneIcon color="warning" fontSize="small" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Com ajuste
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {adjustedRecommendations}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Percentual alterado
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', mb: 1 }}
                    >
                      <CancelOutlinedIcon color="error" fontSize="small" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Recusadas
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {refusedRecommendations}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sugestões descartadas
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {showComparison &&
                comparisonPeriod &&
                prevRate !== null &&
                prevTotal !== null && (
                  <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Período anterior:{' '}
                      <strong>{formatPercent(prevRate)} de adesão</strong> (
                      {comparisonPeriod.acceptedRecommendations} aceitas de{' '}
                      {prevTotal} respondidas).
                    </Typography>
                  </Box>
                )}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
