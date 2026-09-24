import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/ProductDetails";

export const metadata: Metadata = { title: "Produto" };

export default async function ProductPage({
  params,
  searchParams,
}: PageProps<"/dashboard/products/[id]">) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  return <ProductDetails productId={productId} created={created === "1"} />;
}
