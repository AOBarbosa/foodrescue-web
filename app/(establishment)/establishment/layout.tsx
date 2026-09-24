import { Box, Container } from "@mui/material";
import { BrandLink } from "@/components/layout/BrandLink";

/** Centered, header-less layout for the establishment login and sign-up pages. */
export default function EstablishmentAuthLayout({ children }: LayoutProps<"/establishment">) {
  return (
    <Box component="main" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <BrandLink />
        </Box>
        {children}
      </Container>
    </Box>
  );
}
