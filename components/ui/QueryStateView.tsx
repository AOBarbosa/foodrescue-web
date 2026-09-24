import type { ReactNode } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { describeError } from "@/lib/api/errorMessages";

type QueryStateViewProps = {
  isPending: boolean;
  error: unknown;
  onRetry?: () => void;
  children: ReactNode;
};

/** Loading spinner / error alert around the content of a query-backed view. */
export function QueryStateView({ isPending, error, onRetry, children }: QueryStateViewProps) {
  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress aria-label="Carregando" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Tentar novamente
            </Button>
          )
        }
      >
        {describeError(error)}
      </Alert>
    );
  }

  return <>{children}</>;
}
