"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Stack, TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { PasswordField } from "@/components/ui/PasswordField";
import { useLoginEstablishment } from "@/hooks/useEstablishments";
import { ESTABLISHMENT_HOME_PATH } from "@/lib/auth/constants";
import { AppError } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";
import { loginSchema, toLoginRequest, type LoginFormValues } from "@/schemas/establishment";

type LoginFormProps = {
  /** Dashboard path to return to after logging in. */
  redirectTo?: string;
};

function isWrongCredentials(error: unknown): boolean {
  // The backend answers wrong e-mail/password with 422 BUSINESS_RULE_VIOLATION.
  return error instanceof AppError && error.code === "BUSINESS_RULE_VIOLATION";
}

export function LoginForm({ redirectTo = ESTABLISHMENT_HOME_PATH }: LoginFormProps) {
  const router = useRouter();
  const login = useLoginEstablishment();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(toLoginRequest(values));
      router.replace(redirectTo);
    } catch (error) {
      setFormError(
        isWrongCredentials(error)
          ? "E-mail ou senha incorretos."
          : applyServerErrors(error, setError, ["email", "password"]),
      );
    }
  });

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type="email"
            label="E-mail"
            autoComplete="email"
            autoFocus
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <PasswordField
            {...field}
            label="Senha"
            autoComplete="current-password"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      {formError && <Alert severity="error">{formError}</Alert>}
      <Button type="submit" variant="contained" size="large" loading={login.isPending}>
        Entrar
      </Button>
    </Stack>
  );
}
