'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import TuneIcon from '@mui/icons-material/Tune'
import {
  Alert,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import { useRespondToRecommendation } from '@/hooks/useDiscountRecommendations'
import { AppError } from '@/lib/api/errors'
import { formatCurrency } from '@/lib/format'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import { isNotPending } from '@/lib/recommendation/describe'
import {
  ADJUST_FORM_FIELDS,
  type AdjustRecommendationFormValues,
  adjustRecommendationSchema,
  parsePercentage,
  toAdjustRequest,
} from '@/schemas/discountRecommendation'
import type {
  DiscountRecommendationDTO,
  RespondToRecommendationRequest,
} from '@/types/discountRecommendation'

/** Preview of a percentage the user is still typing; the backend is the one
 * that computes the price that gets saved. */
function previewPrice(originalPrice: number, value: string): string | null {
  const percentage = parsePercentage(value)
  if (percentage === null || percentage < 0 || percentage > 100) return null
  return formatCurrency(originalPrice * (1 - percentage / 100))
}

export function RecommendationActions({
  recommendation,
}: {
  recommendation: DiscountRecommendationDTO
}) {
  const respond = useRespondToRecommendation()
  const [adjusting, setAdjusting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { control, handleSubmit, setError, watch } =
    useForm<AdjustRecommendationFormValues>({
      resolver: zodResolver(adjustRecommendationSchema),
      defaultValues: {
        adjustedPercentage: String(recommendation.suggestedPercentage),
      },
    })
  const typed = watch('adjustedPercentage')

  async function send(request: RespondToRecommendationRequest) {
    setFormError(null)
    try {
      await respond.mutateAsync({ id: recommendation.id, request })
      setAdjusting(false)
    } catch (error) {
      // The recommendation may have been answered elsewhere, or have expired
      // between the page load and the click.
      if (
        error instanceof AppError &&
        error.code === 'BUSINESS_RULE_VIOLATION' &&
        isNotPending(error.message)
      ) {
        setFormError(
          'Esta recomendação já foi respondida ou expirou. Recarregue a página para ver a situação atual.'
        )
        return
      }
      setFormError(applyServerErrors(error, setError, ADJUST_FORM_FIELDS))
    }
  }

  const onAdjust = handleSubmit((values) => send(toAdjustRequest(values)))

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<CheckIcon />}
          loading={respond.isPending && !adjusting}
          onClick={() => void send({ decision: 'ACCEPT' })}
        >
          Aceitar
        </Button>
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={() => setAdjusting((open) => !open)}
        >
          {adjusting ? 'Cancelar ajuste' : 'Ajustar'}
        </Button>
        <Button
          color="inherit"
          startIcon={<CloseIcon />}
          onClick={() => void send({ decision: 'REFUSE' })}
        >
          Recusar
        </Button>
      </Stack>

      {adjusting && (
        <Stack
          component="form"
          noValidate
          onSubmit={onAdjust}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'flex-start' } }}
        >
          <Controller
            name="adjustedPercentage"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Desconto"
                size="small"
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  (previewPrice(recommendation.originalPrice, typed)
                    ? `Preço ficaria em ${previewPrice(recommendation.originalPrice, typed)}`
                    : 'Sobre o preço original')
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  },
                  htmlInput: { inputMode: 'decimal' },
                }}
              />
            )}
          />
          <Button type="submit" variant="contained" loading={respond.isPending}>
            Aplicar desconto ajustado
          </Button>
        </Stack>
      )}

      {formError && <Alert severity="error">{formError}</Alert>}

      <Typography variant="caption" color="text.secondary">
        Aceitar ou ajustar altera o preço atual do produto. Recusar mantém o
        preço como está.
      </Typography>
    </Stack>
  )
}
