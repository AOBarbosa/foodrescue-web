import type { Metadata } from 'next'

import { OfferOrderList } from '@/components/offerOrder/OfferOrderList'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Minhas reservas' }

export default function OfferOrdersPage() {
  return (
    <>
      <PageHeader
        title="Minhas reservas"
        subtitle="Acompanhe os pedidos que você reservou nas ofertas ativas."
      />
      <OfferOrderList />
    </>
  )
}
