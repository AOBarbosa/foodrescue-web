import type { Metadata } from 'next'

import { IndicatorsDashboard } from '@/components/indicators/IndicatorsDashboard'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Indicadores de desperdício e economia',
}

export default function IndicatorsPage() {
  return (
    <>
      <PageHeader
        title="Indicadores de desperdício e economia"
        subtitle="Consulte o volume de alimentos salvos do descarte, a receita financeira recuperada e o aproveitamento das recomendações da IA."
      />
      <IndicatorsDashboard />
    </>
  )
}
