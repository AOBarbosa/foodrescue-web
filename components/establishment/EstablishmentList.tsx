"use client";

import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { EmptyState } from "@/components/ui/EmptyState";
import { QueryStateView } from "@/components/ui/QueryStateView";
import { useEstablishments } from "@/hooks/useEstablishments";
import { useSession } from "@/hooks/useSession";
import { ESTABLISHMENT_CATEGORY_LABELS } from "./categoryLabels";

export function EstablishmentList() {
  const { data, isPending, error, refetch } = useEstablishments();
  const session = useSession();

  return (
    <QueryStateView isPending={isPending} error={error} onRetry={() => void refetch()}>
      {data?.length === 0 ? (
        <EmptyState
          icon={<StorefrontIcon fontSize="inherit" />}
          title="Nenhum estabelecimento cadastrado ainda"
          description="Assim que padarias, restaurantes e mercados se cadastrarem, eles aparecerão aqui."
        />
      ) : (
        <Box
          component="ul"
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
            listStyle: "none",
            p: 0,
            m: 0,
          }}
        >
          {data?.map((establishment) => (
            <Card component="li" key={establishment.id}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={ESTABLISHMENT_CATEGORY_LABELS[establishment.category]}
                  />
                  {session?.id === establishment.id && (
                    <Chip size="small" color="secondary" label="Sua conta" />
                  )}
                </Stack>
                <Typography variant="h6" component="h2">
                  {establishment.name}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 1, color: "text.secondary" }}>
                  <PlaceOutlinedIcon fontSize="small" />
                  <Typography variant="body2">{establishment.address}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </QueryStateView>
  );
}
