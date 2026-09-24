import { LinkButton } from "@/components/ui/LinkButton";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import StorefrontIcon from "@mui/icons-material/Storefront";

const STEPS = [
  {
    icon: <StorefrontIcon color="primary" />,
    title: "Cadastre seu estabelecimento",
    description: "Padarias, restaurantes, mercados e lanchonetes.",
  },
  {
    icon: <Inventory2Icon color="primary" />,
    title: "Registre seus produtos",
    description: "Nome, categoria e preço de cada item que você vende.",
  },
  {
    icon: <EventAvailableIcon color="primary" />,
    title: "Acompanhe estoque e validade",
    description: "Saiba o que está perto de vencer antes que vire desperdício.",
  },
];

export default function HomePage() {
  return (
    <Stack spacing={6}>
      <Box sx={{ maxWidth: 720 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Menos desperdício, mais comida na mesa.
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400 }}>
          O FoodRescue conecta estabelecimentos com produtos perto do vencimento a consumidores
          que querem aproveitá-los.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
          <LinkButton href="/establishment/register" variant="contained" size="large">
            Cadastrar meu estabelecimento
          </LinkButton>
          <LinkButton href="/establishments" variant="outlined" size="large">
            Ver estabelecimentos
          </LinkButton>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        }}
      >
        {STEPS.map((step) => (
          <Card key={step.title}>
            <CardContent>
              {step.icon}
              <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
                {step.title}
              </Typography>
              <Typography color="text.secondary">{step.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
