'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import { useCreateOffer } from '@/hooks/useOffers'
import { AppError } from '@/lib/api/errors'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import {
  hasNoStockToOffer,
  parseActiveOfferExists,
  parseQuantityAboveStock,
} from '@/lib/offer/describe'
import {
  createOfferSchema,
  describeAvailableStock,
  OFFER_FORM_FIELDS,
  type OfferFormValues,
  toCreateOfferRequest,
} from '@/schemas/offer'
import type { ProductDTO } from '@/types/product'

const EMPTY_FORM: OfferFormValues = {
  discountedPrice: '',
  availableQuantity: '',
  expiresAt: '',
}

/**
 * Closing time the backend falls back to when no deadline is informed
 * (`app.forecast.closing-time`, shared with UC05 and UC07). Shown as a hint
 * only — the deadline that gets saved is always the backend's.
 */
const CLOSING_TIME = '22:00'

export function CreateOfferForm({ product }: { product: ProductDTO }) {
  const createOffer = useCreateOffer()
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const resolver = useMemo(
    () => zodResolver(createOfferSchema(product)),
    [product]
  )
  const { control, handleSubmit, setError, reset } = useForm<OfferFormValues>({
    resolver,
    defaultValues: EMPTY_FORM,
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    setSuccess(null)
    try {
      const offer = await createOffer.mutateAsync(
        toCreateOfferRequest(product.id, values)
      )
      reset(EMPTY_FORM)
      setSuccess(
        `Oferta publicada: ${offer.availableQuantity} ${offer.availableQuantity === 1 ? 'unidade' : 'unidades'} a ${formatCurrency(offer.discountedPrice)}, aceitando pedidos até ${formatDateTime(offer.expiresAt)}.`
      )
    } catch (error) {
      if (
        error instanceof AppError &&
        error.code === 'BUSINESS_RULE_VIOLATION'
      ) {
        const activeOfferId = parseActiveOfferExists(error.message)
        if (activeOfferId !== null) {
          setFormError(
            `Este produto já tem uma oferta ativa (nº ${activeOfferId}). Encerre-a antes de publicar outra.`
          )
          return
        }
        if (hasNoStockToOffer(error.message)) {
          setFormError(
            'Este produto está sem estoque. Atualize o estoque antes de publicar uma oferta.'
          )
          return
        }
        // The stock may have changed since the page loaded, so the backend
        // checks the quantity again.
        const aboveStock = parseQuantityAboveStock(error.message)
        if (aboveStock) {
          setError(
            'availableQuantity',
            {
              type: 'server',
              message: describeAvailableStock(aboveStock.stock),
            },
            { shouldFocus: true }
          )
          setFormError(
            'O estoque mudou desde o carregamento da página — confira a quantidade disponível.'
          )
          return
        }
      }
      setFormError(applyServerErrors(error, setError, OFFER_FORM_FIELDS))
    }
  })

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          alignItems: 'start',
        }}
      >
        <Controller
          name="discountedPrice"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Preço da oferta"
              placeholder={product.currentPrice.toFixed(2).replace('.', ',')}
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message ??
                `Em branco: ${formatCurrency(product.currentPrice)} (preço atual)`
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">R$</InputAdornment>
                  ),
                },
                htmlInput: { inputMode: 'decimal' },
              }}
            />
          )}
        />
        <Controller
          name="availableQuantity"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="number"
              label="Quantidade ofertada"
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message ??
                `Em branco: todo o estoque (${product.stockQuantity})`
              }
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: product.stockQuantity,
                  step: 1,
                  inputMode: 'numeric',
                },
              }}
            />
          )}
        />
        <Controller
          name="expiresAt"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="datetime-local"
              label="Aceita pedidos até"
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message ??
                `Em branco: fechamento de hoje (${CLOSING_TIME})`
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />
      </Box>
      {formError && <Alert severity="error">{formError}</Alert>}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        startIcon={<LocalOfferIcon />}
        loading={createOffer.isPending}
        sx={{ alignSelf: { sm: 'flex-end' } }}
      >
        Publicar oferta
      </Button>
    </Stack>
  )
}
