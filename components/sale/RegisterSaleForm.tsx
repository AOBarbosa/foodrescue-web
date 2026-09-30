'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import { useRegisterSale } from '@/hooks/useSales'
import { AppError } from '@/lib/api/errors'
import { formatCurrency } from '@/lib/format'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import {
  registerSaleSchema,
  SALE_FORM_FIELDS,
  type SaleFormValues,
  toRegisterSaleRequest,
} from '@/schemas/sale'
import type { ProductDTO } from '@/types/product'

const EMPTY_FORM: SaleFormValues = { quantity: '', unitPrice: '', soldAt: '' }

export function RegisterSaleForm({ product }: { product: ProductDTO }) {
  const registerSale = useRegisterSale(product.id)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const outOfStock = product.stockQuantity <= 0
  const resolver = useMemo(
    () => zodResolver(registerSaleSchema(product.stockQuantity)),
    [product.stockQuantity]
  )
  const { control, handleSubmit, setError, reset } = useForm<SaleFormValues>({
    resolver,
    defaultValues: EMPTY_FORM,
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    setSuccess(null)
    try {
      const sale = await registerSale.mutateAsync(
        toRegisterSaleRequest(product.id, values)
      )
      reset(EMPTY_FORM)
      setSuccess(
        `Venda registrada: ${sale.quantity} ${sale.quantity === 1 ? 'unidade' : 'unidades'} a ${formatCurrency(sale.unitPrice)} (total ${formatCurrency(sale.totalPrice)}). O estoque foi atualizado.`
      )
    } catch (error) {
      // The only business rule broken here is selling more than the stock —
      // the backend checks it again because the stock may have changed.
      if (
        error instanceof AppError &&
        error.code === 'BUSINESS_RULE_VIOLATION'
      ) {
        setError(
          'quantity',
          { type: 'server', message: 'Estoque insuficiente.' },
          { shouldFocus: true }
        )
        setFormError(
          'Estoque insuficiente para esta venda. O estoque mudou desde o carregamento da página — confira a quantidade disponível.'
        )
        return
      }
      setFormError(applyServerErrors(error, setError, SALE_FORM_FIELDS))
    }
  })

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Registrar venda
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          A quantidade vendida é abatida do estoque. Preço e data em branco usam
          o preço atual do produto e o momento do registro.
        </Typography>
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
              name="quantity"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Quantidade vendida"
                  disabled={outOfStock}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ??
                    `${product.stockQuantity} ${product.stockQuantity === 1 ? 'unidade' : 'unidades'} em estoque`
                  }
                  slotProps={{
                    htmlInput: { min: 1, step: 1, inputMode: 'numeric' },
                  }}
                />
              )}
            />
            <Controller
              name="unitPrice"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Preço unitário praticado"
                  placeholder={product.currentPrice
                    .toFixed(2)
                    .replace('.', ',')}
                  disabled={outOfStock}
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
              name="soldAt"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="datetime-local"
                  label="Data e hora da venda"
                  disabled={outOfStock}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? 'Em branco: agora'}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Box>
          {outOfStock && (
            <Alert severity="info">
              Este produto está sem estoque. Atualize o estoque para registrar
              novas vendas.
            </Alert>
          )}
          {formError && <Alert severity="error">{formError}</Alert>}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            loading={registerSale.isPending}
            disabled={outOfStock}
            sx={{ alignSelf: { sm: 'flex-end' } }}
          >
            Registrar venda
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
