'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import {
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'
import { QueryStateView } from '@/components/ui/QueryStateView'
import { useOffers } from '@/hooks/useOffers'
import { formatDateTime } from '@/lib/format'
import { canBeHighlighted } from '@/lib/offer/describe'

import { CloseOfferButton } from './CloseOfferButton'
import { HighlightOfferButton } from './HighlightOfferButton'
import {
  OfferPrice,
  OfferPriorityChip,
  OfferStatusChip,
} from './OfferIndicators'

/**
 * UC08: every offer of the establishment, newest first (the backend sorts
 * them). Only an active offer can be closed or highlighted (UC11), so those
 * are the only rows with actions.
 */
export function OfferList() {
  const [activeOnly, setActiveOnly] = useState(true)
  const { data, isPending, error, refetch } = useOffers()
  const offers = useMemo(
    () =>
      activeOnly
        ? (data ?? []).filter((offer) => offer.status === 'ACTIVE')
        : (data ?? []),
    [data, activeOnly]
  )

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            checked={activeOnly}
            onChange={(event) => setActiveOnly(event.target.checked)}
          />
        }
        label="Mostrar só as ofertas ativas"
      />

      <QueryStateView
        isPending={isPending}
        error={error}
        onRetry={() => void refetch()}
      >
        {offers.length === 0 ? (
          <EmptyState
            icon={<LocalOfferOutlinedIcon fontSize="inherit" />}
            title={
              activeOnly
                ? 'Nenhuma oferta ativa'
                : 'Nenhuma oferta publicada ainda'
            }
            description="Publique o excedente na página do produto, ou aceite uma recomendação de desconto — ela publica a oferta automaticamente."
            action={
              <LinkButton href="/dashboard/products" variant="contained">
                Ver produtos
              </LinkButton>
            }
          />
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 820 }} aria-label="Ofertas de excedente">
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell>Preço</TableCell>
                  <TableCell align="right">Disponível</TableCell>
                  <TableCell>Aceita pedidos até</TableCell>
                  <TableCell>Situação</TableCell>
                  <TableCell>Publicada em</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow
                    key={offer.id}
                    hover
                    sx={[
                      { '&:last-child td': { border: 0 } },
                      // UC11: highlighted offers lead the consumer listing, so
                      // they lead this one visually too.
                      offer.priority &&
                        ((theme) => ({
                          bgcolor: alpha(theme.palette.warning.main, 0.06),
                          boxShadow: `inset 3px 0 0 ${theme.palette.warning.main}`,
                        })),
                    ]}
                  >
                    <TableCell>
                      <Typography
                        component={Link}
                        href={`/dashboard/products/${offer.productId}`}
                        sx={{
                          fontWeight: 500,
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        {offer.productName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <OfferPrice offer={offer} variant="body1" />
                    </TableCell>
                    <TableCell align="right">
                      {offer.availableQuantity}
                    </TableCell>
                    <TableCell>{formatDateTime(offer.expiresAt)}</TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexWrap: 'wrap', gap: 0.5 }}
                      >
                        <OfferStatusChip offer={offer} />
                        {offer.priority && <OfferPriorityChip />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {offer.createdAt ? formatDateTime(offer.createdAt) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {offer.status === 'ACTIVE' && (
                        <Stack
                          direction={{ xs: 'column', lg: 'row' }}
                          spacing={1}
                          sx={{ alignItems: 'flex-end' }}
                        >
                          {canBeHighlighted(offer) && (
                            <HighlightOfferButton
                              offer={offer}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          <CloseOfferButton offer={offer} size="small" />
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </QueryStateView>
    </Stack>
  )
}
