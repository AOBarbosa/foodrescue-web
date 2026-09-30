'use client'

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import {
  Alert,
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

import { formatDate } from '@/lib/format'
import type {
  IndicatorPeriod,
  PeriodDTO,
  WasteAndSavingsIndicatorsDTO,
} from '@/types/indicators'

export type PeriodFilterState = {
  period: IndicatorPeriod
  startDate: string
  endDate: string
  compare: boolean
}

type IndicatorPeriodFilterProps = {
  value: PeriodFilterState
  onChange: (next: PeriodFilterState) => void
  currentPeriod?: PeriodDTO
  comparisonPeriod?: WasteAndSavingsIndicatorsDTO['comparisonPeriod']
}

export function describeDateRangeError(
  startDate: string,
  endDate: string
): string | null {
  if (!startDate || !endDate) return 'Informe as duas datas do período.'
  if (startDate > endDate)
    return 'A data inicial não pode ser posterior à data final.'
  return null
}

export function IndicatorPeriodFilter({
  value,
  onChange,
  currentPeriod,
  comparisonPeriod,
}: IndicatorPeriodFilterProps) {
  const isCustom = value.period === 'CUSTOM'
  const dateError = isCustom
    ? describeDateRangeError(value.startDate, value.endDate)
    : null

  const handlePeriodChange = (
    _: React.MouseEvent<HTMLElement>,
    nextPeriod: IndicatorPeriod | null
  ) => {
    if (!nextPeriod) return
    onChange({
      ...value,
      period: nextPeriod,
    })
  }

  const handleCompareChange = (checked: boolean) => {
    onChange({
      ...value,
      compare: checked,
    })
  }

  const handleDateChange = (field: 'startDate' | 'endDate', date: string) => {
    onChange({
      ...value,
      [field]: date,
    })
  }

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { sm: 'center' } }}
            >
              <ToggleButtonGroup
                value={value.period}
                exclusive
                size="small"
                onChange={handlePeriodChange}
                aria-label="Período dos indicadores"
              >
                <ToggleButton value="DAY">Hoje</ToggleButton>
                <ToggleButton value="WEEK">Últimos 7 dias</ToggleButton>
                <ToggleButton value="MONTH">Mês atual</ToggleButton>
                <ToggleButton value="CUSTOM">Personalizado</ToggleButton>
              </ToggleButtonGroup>

              {isCustom && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center' }}
                >
                  <TextField
                    type="date"
                    label="De"
                    size="small"
                    value={value.startDate}
                    onChange={(e) =>
                      handleDateChange('startDate', e.target.value)
                    }
                    error={Boolean(dateError)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    type="date"
                    label="Até"
                    size="small"
                    value={value.endDate}
                    onChange={(e) =>
                      handleDateChange('endDate', e.target.value)
                    }
                    error={Boolean(dateError)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Stack>
              )}
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={value.compare}
                  onChange={(e) => handleCompareChange(e.target.checked)}
                />
              }
              label="Comparar com período anterior"
              sx={{ ml: { xs: 0, md: 'auto' } }}
            />
          </Stack>

          {dateError && (
            <Alert severity="error" sx={{ py: 0.5 }}>
              {dateError}
            </Alert>
          )}

          {currentPeriod && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                pt: 1,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <CalendarMonthOutlinedIcon
                fontSize="small"
                sx={{ color: 'text.secondary' }}
              />
              <Typography variant="body2" color="text.secondary">
                Período exibido:{' '}
                <strong>
                  {formatDate(currentPeriod.startDate)} até{' '}
                  {formatDate(currentPeriod.endDate)}
                </strong>
              </Typography>

              {value.compare && comparisonPeriod && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: { sm: 2 } }}
                >
                  · Comparando com:{' '}
                  <strong>
                    {formatDate(comparisonPeriod.period.startDate)} até{' '}
                    {formatDate(comparisonPeriod.period.endDate)}
                  </strong>
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
