import type { ReactNode } from "react";
import { Box, Card, CardActions, CardContent, Typography } from "@mui/material";
import { formatCnpj } from "@/lib/validation/cnpj";
import type { EstablishmentDTO } from "@/types/establishment";
import { ESTABLISHMENT_CATEGORY_LABELS } from "./categoryLabels";

type EstablishmentProfileCardProps = {
  establishment: EstablishmentDTO;
  actions?: ReactNode;
};

export function EstablishmentProfileCard({ establishment, actions }: EstablishmentProfileCardProps) {
  const rows = [
    ["Nome", establishment.name],
    ["CNPJ", formatCnpj(establishment.cnpj)],
    ["Categoria", ESTABLISHMENT_CATEGORY_LABELS[establishment.category]],
    ["Endereço", establishment.address],
    ["E-mail", establishment.email],
  ];

  return (
    <Card>
      <CardContent>
        <Box
          component="dl"
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" }, gap: { xs: 0.5, sm: 2 }, m: 0 }}
        >
          {rows.map(([label, value]) => (
            <Box key={label} sx={{ display: "contents" }}>
              <Typography component="dt" color="text.secondary" sx={{ mt: { xs: 1.5, sm: 0 } }}>
                {label}
              </Typography>
              <Typography component="dd" sx={{ m: 0, wordBreak: "break-word" }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
      {actions && <CardActions sx={{ px: 2, pb: 2 }}>{actions}</CardActions>}
    </Card>
  );
}
