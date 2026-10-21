import type { Metadata } from 'next'

import { OfferList } from '@/components/offer/OfferList'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Ofertas' }

export default function OffersPage() {
  return (
    <>
      <PageHeader
        title="Ofertas de excedente"
        subtitle="O excedente que você publicou para os consumidores, das mais recentes às mais antigas. Cada produto tem no máximo uma oferta ativa; encerre a atual para publicar outra."
      />
      <OfferList />
    </>
  )
}
