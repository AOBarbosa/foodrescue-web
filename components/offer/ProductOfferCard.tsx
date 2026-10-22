'use client'

import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'

import { QueryStateView } from '@/components/ui/QueryStateView'
import { useProductOffers } from '@/hooks/useOffers'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { canBeHighlighted, isExpired } from '@/lib/offer/describe'
import type { OfferDTO } from '@/types/offer'
import type { ProductDTO } from '@/types/product'

import { CloseOfferButton } from './CloseOfferButton'
import { CreateOfferForm } from './CreateOfferForm'
import { HighlightOfferButton } from './HighlightOfferButton'
import {
  OfferPrice,
  OfferPriorityChip,
  OfferStatusChip,
} from './OfferIndicators'

function ActiveOffer({ offer }: { offer: OfferDTO }) {
  const expired = isExpired(offer)

  return (
    <Stack spacing={2}>
      <Box>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', mb: 0.5 }}
        >
          <Typography color="text.secondary">Oferta publicada</Typography>
          <OfferStatusChip offer={offer} />
          {offer.priority && <OfferPriorityChip />}
        </Stack>
        <OfferPrice offer={offer} />
      </Box>

      <Typography variant="caption" color="text.secondary">
        {offer.availableQuantity}{' '}
        {offer.availableQuantity === 1
          ? 'unidade disponível'
          : 'unidades disponíveis'}{' '}
        · aceita pedidos até {formatDateTime(offer.expiresAt)}
        {offer.createdAt &&
          ` · publicada em ${formatDateTime(offer.createdAt)}`}
      </Typography>

      {expired ? (
        <Alert severity="warning">
          O prazo desta oferta venceu: os consumidores não conseguem mais pedir.
          Encerre-a para publicar uma nova.
        </Alert>
      ) : offer.priority ? (
        <Alert severity="info">
          Esta oferta está em destaque: aparece antes das outras para os
          consumidores, com as de prazo mais curto na frente. O destaque dura
          até a oferta ser encerrada ou vencer.
        </Alert>
      ) : (
        <Alert severity="info">
          Enquanto esta oferta estiver ativa, o produto não aceita outra.
          Encerre-a para publicar uma oferta com novo preço, quantidade ou
          prazo.
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {canBeHighlighted(offer) && <HighlightOfferButton offer={offer} />}
        <CloseOfferButton offer={offer} />
      </Stack>
    </Stack>
  )
}

function OfferHistory({ offers }: { offers: OfferDTO[] }) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Ofertas anteriores
      </Typography>
      <Stack spacing={1}>
        {offers.map((offer) => (
          <Stack
            key={offer.id}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <OfferStatusChip offer={offer} />
            {offer.priority && <OfferPriorityChip />}
            <Typography variant="body2">
              {formatCurrency(offer.discountedPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {offer.availableQuantity === 0
                ? 'todas as unidades pedidas'
                : `${offer.availableQuantity} ${offer.availableQuantity === 1 ? 'unidade' : 'unidades'} sem pedido`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              prazo {formatDateTime(offer.expiresAt)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

/**
 * UC08: the product's surplus offer. At most one offer can be active per
 * product, so the card either shows that one (with the option to close it) or
 * the form that publishes a new one.
 */
export function ProductOfferCard({ product }: { product: ProductDTO }) {
  const { data, isPending, error, refetch } = useProductOffers(product.id)

  // Blocking means `status === 'ACTIVE'` for the backend, deadline aside: an
  // expired offer still has to be closed before another one is published.
  const active = data?.find((offer) => offer.status === 'ACTIVE')
  const closed = data?.filter((offer) => offer.status === 'CLOSED') ?? []
  const outOfStock = product.stockQuantity <= 0

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Oferta de excedente
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Publique o excedente deste produto para os consumidores. Preço,
          quantidade e prazo em branco usam o preço atual, todo o estoque e o
          fechamento de hoje. Aceitar uma recomendação de desconto também
          publica uma oferta.
        </Typography>

        <QueryStateView
          isPending={isPending}
          error={error}
          onRetry={() => void refetch()}
        >
          <Stack spacing={3}>
            {active ? (
              <ActiveOffer offer={active} />
            ) : outOfStock ? (
              <Alert severity="info">
                Este produto está sem estoque. Atualize o estoque para publicar
                uma oferta.
              </Alert>
            ) : (
              <CreateOfferForm key={product.id} product={product} />
            )}

            {closed.length > 0 && (
              <>
                <Divider />
                <OfferHistory offers={closed} />
              </>
            )}
          </Stack>
        </QueryStateView>
      </CardContent>
    </Card>
  )
}
