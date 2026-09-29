"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { EmptyState } from "@/components/ui/EmptyState";
import { QueryStateView } from "@/components/ui/QueryStateView";
import { useSaleHistory } from "@/hooks/useSales";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { defaultPeriodRange, toSalePeriod, type PeriodRange } from "@/lib/sale/period";
import type { SaleDTO, SalePeriod } from "@/types/sale";

/** Mirrors the backend's `startDate must not be after endDate` (422). */
function describeRangeError({ from, to }: PeriodRange): string | null {
  if (from === "" || to === "") return "Informe as duas datas do período.";
  if (from > to) return "A data inicial não pode ser depois da data final.";
  return null;
}

function summarize(sales: SaleDTO[]): string {
  const units = sales.reduce((total, sale) => total + sale.quantity, 0);
  const revenue = sales.reduce((total, sale) => total + sale.totalPrice, 0);
  return `${sales.length} ${sales.length === 1 ? "venda" : "vendas"} · ${units} ${units === 1 ? "unidade" : "unidades"} · ${formatCurrency(revenue)}`;
}

export function SaleHistory({ productId }: { productId: number }) {
  const [range, setRange] = useState<PeriodRange>(defaultPeriodRange);
  // Only a valid period reaches the query, so an invalid date being typed
  // does not throw away the results already on screen.
  const [period, setPeriod] = useState<SalePeriod>(() => toSalePeriod(range));
  const rangeError = describeRangeError(range);
  const { data, isPending, error, refetch } = useSaleHistory(productId, period);
  const sales = useMemo(() => data ?? [], [data]);

  const updateRange = (next: PeriodRange) => {
    setRange(next);
    if (!describeRangeError(next)) setPeriod(toSalePeriod(next));
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Histórico de vendas
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, alignItems: "flex-start" }}>
          <TextField
            type="date"
            label="De"
            size="small"
            value={range.from}
            onChange={(event) => updateRange({ ...range, from: event.target.value })}
            error={!!rangeError}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            label="Até"
            size="small"
            value={range.to}
            onChange={(event) => updateRange({ ...range, to: event.target.value })}
            error={!!rangeError}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
        {rangeError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {rangeError}
          </Alert>
        )}
        <QueryStateView isPending={isPending} error={error} onRetry={() => void refetch()}>
          {sales.length === 0 ? (
            <EmptyState
              icon={<ReceiptLongOutlinedIcon fontSize="inherit" />}
              title="Nenhuma venda neste período"
              description="Registre as vendas do balcão para acompanhar o histórico do produto."
            />
          ) : (
            <>
              <TableContainer>
                <Table size="small" aria-label="Vendas do produto">
                  <TableHead>
                    <TableRow>
                      <TableCell>Data e hora</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Preço unitário</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id} sx={{ "&:last-child td": { border: 0 } }}>
                        <TableCell>{formatDateTime(sale.soldAt)}</TableCell>
                        <TableCell align="right">{sale.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {summarize(sales)}
              </Typography>
            </>
          )}
        </QueryStateView>
      </CardContent>
    </Card>
  );
}
