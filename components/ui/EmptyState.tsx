import type { ReactNode } from "react";
import { Paper, Stack, Typography } from "@mui/material";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Paper variant="outlined" sx={{ py: 6, px: 3, borderStyle: "dashed" }}>
      <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
        {icon && <Stack sx={{ color: "text.disabled", fontSize: 48 }}>{icon}</Stack>}
        <Typography variant="h6" component="p">
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
            {description}
          </Typography>
        )}
        {action && <Stack sx={{ pt: 1 }}>{action}</Stack>}
      </Stack>
    </Paper>
  );
}
