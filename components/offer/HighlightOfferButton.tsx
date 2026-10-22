'use client'

import { useState } from 'react'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import {
  Alert,
  Button,
  type ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material'

import { useMarkOfferAsPriority } from '@/hooks/useOffers'
import { describeError } from '@/lib/api/errorMessages'
import { AppError } from '@/lib/api/errors'
import { isNotActive } from '@/lib/offer/describe'
import type { OfferDTO } from '@/types/offer'

type HighlightOfferButtonProps = {
  offer: OfferDTO
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}

/**
 * UC11: puts the offer ahead of the others for consumers. Asks for
 * confirmation because the backend has no route to undo it — the highlight
 * only ends when the offer itself is closed or expires.
 */
export function HighlightOfferButton({
  offer,
  size,
  variant = 'contained',
}: HighlightOfferButtonProps) {
  const markAsPriority = useMarkOfferAsPriority()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (markAsPriority.isPending) return
    setOpen(false)
  }

  const handleConfirm = async () => {
    setError(null)
    try {
      await markAsPriority.mutateAsync(offer.id)
      setOpen(false)
    } catch (caught) {
      // The offer may have been closed elsewhere in the meantime — by its
      // units running out (UC09) or by the product running out of stock.
      if (
        caught instanceof AppError &&
        caught.code === 'BUSINESS_RULE_VIOLATION' &&
        isNotActive(caught.message)
      ) {
        setError(
          'Esta oferta não está mais ativa e não pode ser destacada. Recarregue a página para ver a situação atual.'
        )
        return
      }
      setError(describeError(caught))
    }
  }

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Button
        variant={variant}
        size={size}
        color="warning"
        startIcon={<AutoAwesomeIcon />}
        onClick={() => setOpen(true)}
      >
        Destacar para os clientes
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="highlight-offer-title"
      >
        <DialogTitle id="highlight-offer-title">
          Destacar esta oferta?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {offer.productName} passa a aparecer antes das outras ofertas para
            os consumidores. O destaque não pode ser desfeito: ele dura até a
            oferta ser encerrada ou vencer o prazo.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={markAsPriority.isPending}>
            Cancelar
          </Button>
          <Button
            color="warning"
            variant="contained"
            loading={markAsPriority.isPending}
            onClick={() => void handleConfirm()}
          >
            Destacar oferta
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
