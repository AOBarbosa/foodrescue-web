import type { Metadata } from 'next'

import { AvailableOfferList } from '@/components/offerOrder/AvailableOfferList'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Ofertas disponíveis' }

export default function AvailableOffersPage() {
  return (
    <>
      <PageHeader
        title="Ofertas disponíveis"
        subtitle="Produtos com desconto publicados pelos estabelecimentos. As ofertas em destaque vêm primeiro, depois as de prazo mais curto. Escolha a quantidade desejada para reservar."
      />
      <AvailableOfferList />
    </>
  )
}
