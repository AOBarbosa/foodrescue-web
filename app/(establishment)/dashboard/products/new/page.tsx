import type { Metadata } from "next";
import { Card, CardContent } from "@mui/material";
import { ProductForm } from "@/components/product/ProductForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Novo produto" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        title="Novo produto"
        subtitle="Estoque e validade são informados depois, na página do produto."
      />
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <ProductForm />
        </CardContent>
      </Card>
    </>
  );
}
