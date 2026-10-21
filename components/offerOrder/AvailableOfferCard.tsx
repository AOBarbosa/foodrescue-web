'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { useReserveOffer } from '@/hooks/useOfferOrders'
import { formatCurrency, formatDateTime, formatPercent } from '@/lib/format'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import {
  describeReserveOfferError,
  offerDiscountPercent,
} from '@/lib/offerOrder/describe'
import {
  RESERVE_OFFER_FORM_FIELDS,
  type ReserveOfferFormValues,
  reserveOfferSchema,
  toReserveOfferRequest,
} from '@/schemas/offerOrder'
import type { OfferDTO } from '@/types/offer'
import type { OfferOrderDTO } from '@/types/offerOrder'

type AvailableOfferCardProps = {
  offer: OfferDTO
  onReserved?: (order: OfferOrderDTO) => void
}

const DEFAULT_VALUES: ReserveOfferFormValues = { quantity: '1' }

function parsePositiveInt(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const value = Number(trimmed)
  return value > 0 ? value : null
}

export function AvailableOfferCard({
  offer,
  onReserved,
}: AvailableOfferCardProps) {
  const reserveOffer = useReserveOffer()
  const [formError, setFormError] = useState<string | null>(null)
  const [reservedOrder, setReservedOrder] = useState<OfferOrderDTO | null>(null)

  const resolver = useMemo(
    () => zodResolver(reserveOfferSchema(offer.availableQuantity)),
    [offer.availableQuantity]
  )

  const { control, handleSubmit, setError, reset } =
    useForm<ReserveOfferFormValues>({
      resolver,
      defaultValues: DEFAULT_VALUES,
    })

  const quantityRaw = useWatch({ control, name: 'quantity' })
  const parsedQuantity = parsePositiveInt(quantityRaw ?? '')
  const previewTotal =
    parsedQuantity !== null ? parsedQuantity * offer.discountedPrice : null
  const discountPct = offerDiscountPercent(offer)
  const hasDiscount = offer.discountedPrice < offer.originalPrice

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    setReservedOrder(null)
    try {
      const order = await reserveOffer.mutateAsync(
        toReserveOfferRequest(offer.id, values)
      )
      reset(DEFAULT_VALUES)
      setReservedOrder(order)
      onReserved?.(order)
    } catch (error) {
      const domainError = describeReserveOfferError(error)
      if (domainError) {
        if (domainError.fieldError) {
          setError(
            'quantity',
            { type: 'server', message: domainError.fieldError },
            { shouldFocus: true }
          )
        }
        setFormError(domainError.formError)
        return
      }
      setFormError(
        applyServerErrors(error, setError, RESERVE_OFFER_FORM_FIELDS)
      )
    }
  })

  return (
    <Card
      variant="outlined"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2.5,
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="h6" component="h2">
              {offer.productName}
            </Typography>
            <Stack direction="row" spacing={1}>
              {offer.priority && (
                <Chip
                  size="small"
                  color="warning"
                  icon={<AutoAwesomeIcon />}
                  label="Em destaque"
                />
              )}
              {discountPct > 0 && (
                <Chip
                  size="small"
                  color="success"
                  icon={<LocalOfferOutlinedIcon />}
                  label={`-${formatPercent(discountPct)}`}
                />
              )}
            </Stack>
          </Stack>

          <Box>
            {hasDiscount && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                De {formatCurrency(offer.originalPrice)}
              </Typography>
            )}
            <Typography
              variant="h5"
              color="primary.main"
              sx={{ fontWeight: 700 }}
            >
              {formatCurrency(offer.discountedPrice)}{' '}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                por unidade
              </Typography>
            </Typography>
          </Box>

          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {offer.availableQuantity}{' '}
              {offer.availableQuantity === 1
                ? 'unidade disponível'
                : 'unidades disponíveis'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Disponível até {formatDateTime(offer.expiresAt)}
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Divider />
          <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { sm: 'flex-start' } }}
            >
              <Controller
                name="quantity"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    size="small"
                    label="Quantidade"
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message ??
                      (previewTotal !== null
                        ? `Total: ${formatCurrency(previewTotal)}`
                        : undefined)
                    }
                    slotProps={{
                      htmlInput: {
                        min: 1,
                        max: offer.availableQuantity,
                        step: 1,
                        inputMode: 'numeric',
                      },
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                loading={reserveOffer.isPending}
                sx={{ minWidth: 120 }}
              >
                Reservar
              </Button>
            </Stack>

            {formError && <Alert severity="error">{formError}</Alert>}
            {reservedOrder && (
              <Alert severity="success" onClose={() => setReservedOrder(null)}>
                Reserva confirmada: {reservedOrder.quantity}{' '}
                {reservedOrder.quantity === 1 ? 'unidade' : 'unidades'} por{' '}
                {formatCurrency(reservedOrder.totalPrice)}.
              </Alert>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
