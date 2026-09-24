"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppBar, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLogout, useSession } from "@/hooks/useSession";
import { ESTABLISHMENT_LOGIN_PATH } from "@/lib/auth/constants";
import { onSessionExpired } from "@/lib/auth/session";
import { BrandLink } from "./BrandLink";

const NAV_ITEMS = [
  { href: "/dashboard/products", label: "Produtos" },
  { href: "/dashboard/profile", label: "Perfil" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const logout = useLogout();

  // proxy.ts guards navigation; this covers the token being rejected (401)
  // while on a page. Logout and account deletion navigate on their own.
  useEffect(
    () =>
      onSessionExpired(() => {
        const params = new URLSearchParams({ expired: "1", next: pathname });
        router.replace(`${ESTABLISHMENT_LOGIN_PATH}?${params}`);
      }),
    [router, pathname],
  );

  const handleLogout = () => {
    logout();
    router.replace(ESTABLISHMENT_LOGIN_PATH);
  };

  return (
    <>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: "wrap", py: { xs: 1, sm: 0 } }}>
            <BrandLink href="/dashboard" />
            <Stack component="nav" direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color={pathname.startsWith(item.href) ? "primary" : "inherit"}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
            {session && (
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                {session.name}
              </Typography>
            )}
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Sair
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {children}
      </Container>
    </>
  );
}
