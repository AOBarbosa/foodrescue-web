import type { Metadata } from 'next'

import { PageHeader } from '@/components/ui/PageHeader'
import { WasteRiskPanel } from '@/components/wasteRisk/WasteRiskPanel'

export const metadata: Metadata = { title: 'Risco de desperdício' }

export default function WasteRisksPage() {
  return (
    <>
      <PageHeader
        title="Risco de desperdício"
        subtitle="Quanto do estoque de cada produto deve sobrar no fechamento, dos mais arriscados aos menos. O risco acompanha as vendas e o estoque atual."
      />
      <WasteRiskPanel />
    </>
  )
}
