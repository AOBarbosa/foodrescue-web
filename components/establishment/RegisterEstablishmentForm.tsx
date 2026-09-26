"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Stack } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRegisterEstablishment } from "@/hooks/useEstablishments";
import { ESTABLISHMENT_HOME_PATH } from "@/lib/auth/constants";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";
import {
  ESTABLISHMENT_FORM_FIELDS,
  registerEstablishmentSchema,
  toRegisterEstablishmentRequest,
  type EstablishmentFormValues,
} from "@/schemas/establishment";
import { EstablishmentFormFields } from "./EstablishmentFormFields";

const EMPTY: EstablishmentFormValues = {
  name: "",
  cnpj: "",
  address: "",
  category: "",
  email: "",
  password: "",
};

export function RegisterEstablishmentForm() {
  const router = useRouter();
  const registerEstablishment = useRegisterEstablishment();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError } = useForm<EstablishmentFormValues>({
    resolver: zodResolver(registerEstablishmentSchema),
    defaultValues: EMPTY,
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerEstablishment.mutateAsync(toRegisterEstablishmentRequest(values));
      router.replace(ESTABLISHMENT_HOME_PATH);
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ESTABLISHMENT_FORM_FIELDS));
    }
  });

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
      <EstablishmentFormFields control={control} passwordLabel="Senha" />
      {formError && <Alert severity="error">{formError}</Alert>}
      <Button type="submit" variant="contained" size="large" loading={registerEstablishment.isPending}>
        Criar conta
      </Button>
    </Stack>
  );
}
