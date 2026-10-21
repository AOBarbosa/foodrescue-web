'use client'

import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'
import { QueryStateView } from '@/components/ui/QueryStateView'
import { useOfferOrders } from '@/hooks/useOfferOrders'
import { CONSUMER_HOME_PATH } from '@/lib/auth/constants'
import { formatCurrency, formatDateTime } from '@/lib/format'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/offerOrder/describe'

export function OfferOrderList() {
  const { data: orders, isPending, error, refetch } = useOfferOrders()

  return (
    <QueryStateView
      isPending={isPending}
      error={error}
      onRetry={() => void refetch()}
    >
      {orders?.length === 0 ? (
        <EmptyState
          icon={<ReceiptLongOutlinedIcon fontSize="inherit" />}
          title="Você ainda não fez nenhuma reserva"
          description="Explore as ofertas ativas dos estabelecimentos e reserve produtos com desconto."
          action={
            <LinkButton href={CONSUMER_HOME_PATH} variant="contained">
              Ver ofertas disponíveis
            </LinkButton>
          }
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 650 }} aria-label="Minhas reservas">
            <TableHead>
              <TableRow>
                <TableCell>Pedido</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Preço unitário</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell>Data da reserva</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders?.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:last-child td': { border: 0 } }}
                >
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>
                      {order.productName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{order.quantity}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(order.unitPrice)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatCurrency(order.totalPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={ORDER_STATUS_LABELS[order.status]}
                      color={ORDER_STATUS_COLORS[order.status]}
                    />
                  </TableCell>
                  <TableCell>
                    {order.createdAt ? formatDateTime(order.createdAt) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </QueryStateView>
  )
}
