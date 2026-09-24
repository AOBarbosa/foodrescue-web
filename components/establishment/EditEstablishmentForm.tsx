"use client";

import { useState } from "react";
import { Alert, Button, Card, CardContent, Stack } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateEstablishment } from "@/hooks/useEstablishments";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";
import { formatCnpj } from "@/lib/validation/cnpj";
import {
  ESTABLISHMENT_FORM_FIELDS,
  toUpdateEstablishmentRequest,
  updateEstablishmentSchema,
  type EstablishmentFormValues,
} from "@/schemas/establishment";
import type { EstablishmentDTO } from "@/types/establishment";
import { EstablishmentFormFields } from "./EstablishmentFormFields";

type EditEstablishmentFormProps = {
  establishment: EstablishmentDTO;
  onCancel: () => void;
  onSaved: () => void;
};

export function EditEstablishmentForm({ establishment, onCancel, onSaved }: EditEstablishmentFormProps) {
  const updateEstablishment = useUpdateEstablishment();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError } = useForm<EstablishmentFormValues>({
    resolver: zodResolver(updateEstablishmentSchema),
    defaultValues: {
      name: establishment.name,
      cnpj: formatCnpj(establishment.cnpj),
      address: establishment.address,
      category: establishment.category,
      email: establishment.email,
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updateEstablishment.mutateAsync({
        id: establishment.id,
        request: toUpdateEstablishmentRequest(values),
      });
      onSaved();
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ESTABLISHMENT_FORM_FIELDS));
    }
  });

  return (
    <Card>
      <CardContent>
        <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
          <EstablishmentFormFields
            control={control}
            passwordLabel="Nova senha"
            passwordHelperText="Deixe em branco para manter a senha atual."
          />
          {formError && <Alert severity="error">{formError}</Alert>}
          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <Button onClick={onCancel} disabled={updateEstablishment.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" loading={updateEstablishment.isPending}>
              Salvar alterações
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
