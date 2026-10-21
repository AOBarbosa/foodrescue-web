'use client'

import { useState } from 'react'
import Link from 'next/link'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import { Alert, Box, Button, Stack } from '@mui/material'

import { EmptyState } from '@/components/ui/EmptyState'
import { QueryStateView } from '@/components/ui/QueryStateView'
import { useAvailableOffers } from '@/hooks/useOfferOrders'
import { CONSUMER_ORDERS_PATH } from '@/lib/auth/constants'
import { formatCurrency } from '@/lib/format'
import type { OfferOrderDTO } from '@/types/offerOrder'

import { AvailableOfferCard } from './AvailableOfferCard'

export function AvailableOfferList() {
  const { data: offers, isPending, error, refetch } = useAvailableOffers()
  const [lastOrder, setLastOrder] = useState<OfferOrderDTO | null>(null)

  return (
    <Stack spacing={3}>
      {lastOrder && (
        <Alert
          severity="success"
          onClose={() => setLastOrder(null)}
          action={
            <Button
              component={Link}
              href={CONSUMER_ORDERS_PATH}
              color="inherit"
              size="small"
            >
              Ver minhas reservas
            </Button>
          }
        >
          Pedido #{lastOrder.id} reservado: {lastOrder.quantity}{' '}
          {lastOrder.quantity === 1 ? 'unidade' : 'unidades'} de{' '}
          <strong>{lastOrder.productName}</strong> por{' '}
          {formatCurrency(lastOrder.totalPrice)}.
        </Alert>
      )}

      <QueryStateView
        isPending={isPending}
        error={error}
        onRetry={() => void refetch()}
      >
        {offers?.length === 0 ? (
          <EmptyState
            icon={<LocalOfferOutlinedIcon fontSize="inherit" />}
            title="Nenhuma oferta disponível no momento"
            description="Quando estabelecimentos publicarem excedentes com desconto, eles aparecerão aqui para reserva."
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            }}
          >
            {offers?.map((offer) => (
              <AvailableOfferCard
                key={offer.id}
                offer={offer}
                onReserved={setLastOrder}
              />
            ))}
          </Box>
        )}
      </QueryStateView>
    </Stack>
  )
}
