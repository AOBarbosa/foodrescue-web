import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { ProductDTO } from "@/types/product";
import { ExpirationStatusChip } from "./ExpirationStatusChip";
import { ProductThumbnail } from "./ProductThumbnail";

export function ProductSummaryCard({ product }: { product: ProductDTO }) {
  const rows: [string, string][] = [
    ["Categoria", product.category],
    ["Preço original", formatCurrency(product.originalPrice)],
    ["Preço atual", formatCurrency(product.currentPrice)],
    ["Estoque", `${product.stockQuantity} ${product.stockQuantity === 1 ? "unidade" : "unidades"}`],
    ["Validade", product.expirationDate ? formatDate(product.expirationDate) : "Não informada"],
  ];

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
          <ProductThumbnail name={product.name} photoUrl={product.photoUrl} size={72} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2" sx={{ wordBreak: "break-word" }}>
              {product.name}
            </Typography>
            <ExpirationStatusChip expirationDate={product.expirationDate} />
          </Box>
        </Stack>
        <Box
          component="dl"
          sx={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 3, rowGap: 1.5, m: 0 }}
        >
          {rows.map(([label, value]) => (
            <Box key={label} sx={{ display: "contents" }}>
              <Typography component="dt" color="text.secondary">
                {label}
              </Typography>
              <Typography component="dd" sx={{ m: 0 }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
        {product.modificationDate && (
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 3 }}>
            Atualizado em {formatDateTime(product.modificationDate)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
