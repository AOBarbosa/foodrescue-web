import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, Typography } from "@mui/material";
import { RegisterEstablishmentForm } from "@/components/establishment/RegisterEstablishmentForm";

export const metadata: Metadata = { title: "Cadastrar estabelecimento" };

export default function RegisterPage() {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Cadastrar estabelecimento
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Preencha os dados do seu negócio para começar a registrar produtos.
        </Typography>
        <RegisterEstablishmentForm />
        <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
          Já tem conta? <Link href="/establishment/login">Entrar</Link>
        </Typography>
      </CardContent>
    </Card>
  );
}
