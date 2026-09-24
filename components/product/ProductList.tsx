"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddIcon from "@mui/icons-material/Add";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { QueryStateView } from "@/components/ui/QueryStateView";
import { useProducts } from "@/hooks/useProducts";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ProductDTO } from "@/types/product";
import { ExpirationStatusChip } from "./ExpirationStatusChip";
import { ProductThumbnail } from "./ProductThumbnail";

/** Soonest expiration first (what needs attention), undated products last. */
function byExpiration(a: ProductDTO, b: ProductDTO): number {
  if (a.expirationDate === b.expirationDate) return a.name.localeCompare(b.name, "pt-BR");
  if (!a.expirationDate) return 1;
  if (!b.expirationDate) return -1;
  return a.expirationDate.localeCompare(b.expirationDate);
}

export function ProductList() {
  const router = useRouter();
  const { data, isPending, error, refetch } = useProducts();
  const products = useMemo(() => [...(data ?? [])].sort(byExpiration), [data]);

  return (
    <QueryStateView isPending={isPending} error={error} onRetry={() => void refetch()}>
      {products.length === 0 ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon fontSize="inherit" />}
          title="Nenhum produto cadastrado"
          description="Cadastre os produtos que você vende para acompanhar estoque e validade."
          action={
            <LinkButton href="/dashboard/products/new" variant="contained" startIcon={<AddIcon />}>
              Cadastrar primeiro produto
            </LinkButton>
          }
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 720 }} aria-label="Produtos">
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell align="right">Estoque</TableCell>
                <TableCell>Validade</TableCell>
                <TableCell>Situação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  onClick={() => router.push(`/dashboard/products/${product.id}`)}
                  sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <ProductThumbnail name={product.name} photoUrl={product.photoUrl} />
                      <Typography
                        component={Link}
                        href={`/dashboard/products/${product.id}`}
                        onClick={(event) => event.stopPropagation()}
                        sx={{ fontWeight: 500, color: "inherit", textDecoration: "none" }}
                      >
                        {product.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">{formatCurrency(product.currentPrice)}</TableCell>
                  <TableCell align="right">{product.stockQuantity}</TableCell>
                  <TableCell>{product.expirationDate ? formatDate(product.expirationDate) : "—"}</TableCell>
                  <TableCell>
                    <ExpirationStatusChip expirationDate={product.expirationDate} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </QueryStateView>
  );
}
