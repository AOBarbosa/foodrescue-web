'use client'

import { useMemo, useState } from 'react'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined'
import { Grid, Stack } from '@mui/material'

import { QueryStateView } from '@/components/ui/QueryStateView'
import { useIndicators } from '@/hooks/useIndicators'
import { formatCurrency } from '@/lib/format'
import type { GetIndicatorsParams } from '@/types/indicators'

import { IndicatorKpiCard } from './IndicatorKpiCard'
import {
  describeDateRangeError,
  IndicatorPeriodFilter,
  type PeriodFilterState,
} from './IndicatorPeriodFilter'
import { RecommendationStatsCard } from './RecommendationStatsCard'

export function IndicatorsDashboard() {
  const [filter, setFilter] = useState<PeriodFilterState>({
    period: 'MONTH',
    startDate: '',
    endDate: '',
    compare: false,
  })

  const queryParams = useMemo<GetIndicatorsParams>(() => {
    if (filter.period === 'CUSTOM') {
      const hasError = describeDateRangeError(filter.startDate, filter.endDate)
      if (!hasError) {
        return {
          period: 'CUSTOM',
          startDate: filter.startDate,
          endDate: filter.endDate,
          compare: filter.compare,
        }
      }
      return {
        period: 'MONTH',
        compare: filter.compare,
      }
    }

    return {
      period: filter.period,
      compare: filter.compare,
    }
  }, [filter])

  const { data, isPending, error, refetch } = useIndicators(queryParams)

  const unitsText = (qty: number) =>
    `${qty} ${qty === 1 ? 'unidade' : 'unidades'}`

  return (
    <Stack spacing={3}>
      <IndicatorPeriodFilter
        value={filter}
        onChange={setFilter}
        currentPeriod={data?.period}
        comparisonPeriod={data?.comparisonPeriod}
      />

      <QueryStateView
        isPending={isPending}
        error={error}
        onRetry={() => void refetch()}
      >
        {data && (
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <IndicatorKpiCard
                  title="Alimentos Salvos"
                  value={unitsText(data.wasteAvoidedUnits)}
                  subtitle="Produtos vendidos com desconto que evitaram descarte e desperdício."
                  icon={<VolunteerActivismOutlinedIcon color="success" />}
                  currentValue={data.wasteAvoidedUnits}
                  previousValue={data.comparisonPeriod?.wasteAvoidedUnits}
                  comparisonFormattedValue={
                    data.comparisonPeriod
                      ? unitsText(data.comparisonPeriod.wasteAvoidedUnits)
                      : undefined
                  }
                  valueType="units"
                  showComparison={filter.compare}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <IndicatorKpiCard
                  title="Receita Recuperada"
                  value={formatCurrency(data.recoveredRevenue)}
                  subtitle="Receita financeira obtida com as vendas que de outra forma seria perdida."
                  icon={<SavingsOutlinedIcon color="primary" />}
                  currentValue={data.recoveredRevenue}
                  previousValue={data.comparisonPeriod?.recoveredRevenue}
                  comparisonFormattedValue={
                    data.comparisonPeriod
                      ? formatCurrency(data.comparisonPeriod.recoveredRevenue)
                      : undefined
                  }
                  valueType="currency"
                  showComparison={filter.compare}
                />
              </Grid>
            </Grid>

            <RecommendationStatsCard
              indicators={data}
              showComparison={filter.compare}
            />
          </Stack>
        )}
      </QueryStateView>
    </Stack>
  )
}
