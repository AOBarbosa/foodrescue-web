'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import {
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'
import { QueryStateView } from '@/components/ui/QueryStateView'
import { useWasteRisks } from '@/hooks/useWasteRisk'
import { formatDateTime } from '@/lib/format'

import { WasteRiskBar, WasteRiskChip } from './WasteRiskIndicator'

/**
 * UC06: the establishment's panel of products at risk of being wasted. The
 * backend already sorts them riskiest first; flagged rows are highlighted.
 */
export function WasteRiskPanel() {
  const router = useRouter()
  const [atRiskOnly, setAtRiskOnly] = useState(true)
  const { data: risks, isPending, error, refetch } = useWasteRisks(atRiskOnly)

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            checked={atRiskOnly}
            onChange={(event) => setAtRiskOnly(event.target.checked)}
          />
        }
        label="Mostrar só os produtos em risco"
      />

      <QueryStateView
        isPending={isPending}
        error={error}
        onRetry={() => void refetch()}
      >
        {risks?.length === 0 ? (
          atRiskOnly ? (
            <EmptyState
              icon={<TaskAltIcon fontSize="inherit" />}
              title="Nenhum produto em risco de desperdício"
              description="Pelas previsões mais recentes, o estoque dos seus produtos deve ser vendido até o fechamento."
            />
          ) : (
            <EmptyState
              title="Nenhum produto com previsão de demanda"
              description="O risco é avaliado a partir da previsão de demanda. Calcule-a na página de cada produto."
              action={
                <LinkButton href="/dashboard/products" variant="contained">
                  Ver produtos
                </LinkButton>
              }
            />
          )
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 800 }} aria-label="Risco de desperdício">
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell align="right">Estoque</TableCell>
                  <TableCell align="right">Venda prevista</TableCell>
                  <TableCell align="right">Sobra esperada</TableCell>
                  <TableCell sx={{ width: 200 }}>Risco</TableCell>
                  <TableCell>Situação</TableCell>
                  <TableCell>Previsão de</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {risks?.map((risk) => (
                  <TableRow
                    key={risk.productId}
                    hover
                    onClick={() =>
                      router.push(`/dashboard/products/${risk.productId}`)
                    }
                    sx={[
                      { cursor: 'pointer', '&:last-child td': { border: 0 } },
                      risk.atRisk &&
                        ((theme) => ({
                          bgcolor: alpha(theme.palette.error.main, 0.06),
                          boxShadow: `inset 3px 0 0 ${theme.palette.error.main}`,
                        })),
                    ]}
                  >
                    <TableCell>
                      <Typography
                        component={Link}
                        href={`/dashboard/products/${risk.productId}`}
                        onClick={(event) => event.stopPropagation()}
                        sx={{
                          fontWeight: 500,
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        {risk.productName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{risk.stockQuantity}</TableCell>
                    <TableCell align="right">
                      {risk.predictedQuantity}
                    </TableCell>
                    <TableCell align="right">{risk.expectedSurplus}</TableCell>
                    <TableCell>
                      <WasteRiskBar {...risk} />
                    </TableCell>
                    <TableCell>
                      <WasteRiskChip atRisk={risk.atRisk} />
                    </TableCell>
                    <TableCell>
                      {formatDateTime(risk.forecastCalculatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </QueryStateView>
    </Stack>
  )
}
