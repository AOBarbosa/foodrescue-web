"use client";

import Link from "next/link";
import { AppBar, Button, Container, Stack, Toolbar } from "@mui/material";
import { useSession } from "@/hooks/useSession";
import { ESTABLISHMENT_HOME_PATH, ESTABLISHMENT_LOGIN_PATH } from "@/lib/auth/constants";
import { BrandLink } from "./BrandLink";

export function PublicHeader() {
  const session = useSession();

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", gap: 2 }}>
          <BrandLink />
          <Stack direction="row" spacing={1}>
            <Button component={Link} href="/establishments" color="inherit">
              Estabelecimentos
            </Button>
            {session ? (
              <Button component={Link} href={ESTABLISHMENT_HOME_PATH} variant="contained">
                Meu painel
              </Button>
            ) : (
              <Button component={Link} href={ESTABLISHMENT_LOGIN_PATH} variant="outlined">
                Entrar
              </Button>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
