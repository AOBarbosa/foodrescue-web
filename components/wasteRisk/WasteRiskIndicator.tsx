import { Chip, LinearProgress, Stack, Typography } from '@mui/material'

import { formatPercent } from '@/lib/format'
import type { WasteRiskDTO } from '@/types/wasteRisk'

type RiskProps = Pick<WasteRiskDTO, 'riskPercentage' | 'atRisk'>

/** "Em risco" once the backend flags the product (risk above its threshold). */
export function WasteRiskChip({ atRisk }: Pick<WasteRiskDTO, 'atRisk'>) {
  return atRisk ? (
    <Chip size="small" color="error" label="Em risco" />
  ) : (
    <Chip
      size="small"
      color="success"
      variant="outlined"
      label="Sob controle"
    />
  )
}

/** Risk percentage with a bar, red when the product is flagged. */
export function WasteRiskBar({ riskPercentage, atRisk }: RiskProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, riskPercentage)}
        color={atRisk ? 'error' : 'primary'}
        aria-label="Risco de desperdício"
        sx={{ flexGrow: 1, minWidth: 64, height: 8, borderRadius: 4 }}
      />
      <Typography
        variant="body2"
        sx={{ minWidth: 48, textAlign: 'right', fontWeight: 500 }}
      >
        {formatPercent(riskPercentage)}
      </Typography>
    </Stack>
  )
}
