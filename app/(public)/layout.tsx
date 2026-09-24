import { Container } from "@mui/material";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PublicHeader />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {children}
      </Container>
    </>
  );
}
