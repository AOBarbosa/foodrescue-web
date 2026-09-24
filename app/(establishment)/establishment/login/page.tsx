import type { Metadata } from "next";
import Link from "next/link";
import { Alert, Card, CardContent, Typography } from "@mui/material";
import { LoginForm } from "@/components/establishment/LoginForm";
import { ESTABLISHMENT_HOME_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = { title: "Entrar" };

/** Only dashboard paths are accepted as `?next=`, so the login can't redirect off-site. */
function safeRedirect(next: string | string[] | undefined): string {
  return typeof next === "string" && next.startsWith("/dashboard") ? next : ESTABLISHMENT_HOME_PATH;
}

export default async function LoginPage({ searchParams }: PageProps<"/establishment/login">) {
  const { next, expired } = await searchParams;

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Entrar no painel
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Acesse com o e-mail e a senha do seu estabelecimento.
        </Typography>
        {expired && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Sua sessão expirou. Entre novamente para continuar.
          </Alert>
        )}
        <LoginForm redirectTo={safeRedirect(next)} />
        <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
          Ainda não tem conta? <Link href="/establishment/register">Cadastre seu estabelecimento</Link>
        </Typography>
      </CardContent>
    </Card>
  );
}
