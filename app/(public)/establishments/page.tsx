import type { Metadata } from "next";
import { EstablishmentList } from "@/components/establishment/EstablishmentList";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Estabelecimentos" };

export default function EstablishmentsPage() {
  return (
    <>
      <PageHeader
        title="Estabelecimentos"
        subtitle="Padarias, restaurantes, mercados e lanchonetes que fazem parte do FoodRescue."
      />
      <EstablishmentList />
    </>
  );
}
