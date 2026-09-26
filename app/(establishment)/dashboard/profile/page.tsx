import type { Metadata } from "next";
import { EstablishmentProfile } from "@/components/establishment/EstablishmentProfile";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Perfil" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Perfil do estabelecimento" subtitle="Dados públicos e de acesso da sua conta." />
      <EstablishmentProfile />
    </>
  );
}
