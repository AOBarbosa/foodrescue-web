import type { Metadata } from "next";
import AddIcon from "@mui/icons-material/Add";
import { ProductList } from "@/components/product/ProductList";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Produtos" };

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle="Os produtos do seu estabelecimento, dos que vencem primeiro aos sem validade."
        actions={
          <LinkButton href="/dashboard/products/new" variant="contained" startIcon={<AddIcon />}>
            Novo produto
          </LinkButton>
        }
      />
      <ProductList />
    </>
  );
}
