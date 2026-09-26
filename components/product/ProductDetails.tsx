"use client";

import { Alert, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { QueryStateView } from "@/components/ui/QueryStateView";
import { useProduct } from "@/hooks/useProducts";
import { AppError } from "@/lib/api/errors";
import { InventoryUpdateForm } from "./InventoryUpdateForm";
import { ProductSummaryCard } from "./ProductSummaryCard";

type ProductDetailsProps = {
  productId: number;
  /** Just came from the create form. */
  created?: boolean;
};

const backButton = (
  <LinkButton href="/dashboard/products" startIcon={<ArrowBackIcon />}>
    Voltar para produtos
  </LinkButton>
);

export function ProductDetails({ productId, created = false }: ProductDetailsProps) {
  const { data: product, isPending, error, refetch } = useProduct(productId);

  // Another establishment's product is also a 404, on purpose (backend).
  if (error instanceof AppError && error.status === 404) {
    return (
      <>
        <PageHeader title="Produto não encontrado" actions={backButton} />
        <Alert severity="warning">
          Este produto não existe ou não pertence ao seu estabelecimento.
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader title={product?.name ?? "Produto"} actions={backButton} />
      <QueryStateView isPending={isPending} error={error} onRetry={() => void refetch()}>
        {product && (
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" }, alignItems: "start" }}>
            {created && (
              <Alert severity="success" sx={{ gridColumn: "1 / -1" }}>
                Produto cadastrado. Informe agora o estoque e a validade para acompanhá-lo.
              </Alert>
            )}
            <ProductSummaryCard product={product} />
            <InventoryUpdateForm key={product.id} product={product} />
          </Box>
        )}
      </QueryStateView>
    </>
  );
}
