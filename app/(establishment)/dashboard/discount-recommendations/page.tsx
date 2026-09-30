import type { Metadata } from 'next'

import { PendingRecommendationsPanel } from '@/components/recommendation/PendingRecommendationsPanel'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Preço dinâmico' }

export default function DiscountRecommendationsPage() {
  return (
    <>
      <PageHeader
        title="Preço dinâmico"
        subtitle="Descontos sugeridos para os produtos em risco de desperdício, dos mais antigos aos mais recentes. Aceite, ajuste o percentual ou recuse — o desconto incide sempre sobre o preço original."
      />
      <PendingRecommendationsPanel />
    </>
  )
}
