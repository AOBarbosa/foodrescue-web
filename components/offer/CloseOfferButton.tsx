'use client'

import { useState } from 'react'
import BlockIcon from '@mui/icons-material/Block'
import { Alert, Button, type ButtonProps, Stack } from '@mui/material'

import { useCloseOffer } from '@/hooks/useOffers'
import { describeError } from '@/lib/api/errorMessages'
import { AppError } from '@/lib/api/errors'
import { isNotActive } from '@/lib/offer/describe'
import type { OfferDTO } from '@/types/offer'

type CloseOfferButtonProps = {
  offer: OfferDTO
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}

/**
 * Closes an offer before its deadline. The offer may have been closed
 * elsewhere in the meantime — by its units running out (UC09) or by the
 * product running out of stock — which the backend answers with a 422.
 */
export function CloseOfferButton({
  offer,
  size,
  variant = 'outlined',
}: CloseOfferButtonProps) {
  const close = useCloseOffer()
  const [error, setError] = useState<string | null>(null)

  const onClose = async () => {
    setError(null)
    try {
      await close.mutateAsync(offer.id)
    } catch (caught) {
      if (
        caught instanceof AppError &&
        caught.code === 'BUSINESS_RULE_VIOLATION' &&
        isNotActive(caught.message)
      ) {
        setError(
          'Esta oferta já estava encerrada. Recarregue a página para ver a situação atual.'
        )
        return
      }
      setError(describeError(caught))
    }
  }

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Button
        color="inherit"
        variant={variant}
        size={size}
        startIcon={<BlockIcon />}
        loading={close.isPending}
        onClick={() => void onClose()}
      >
        Encerrar oferta
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  )
}
