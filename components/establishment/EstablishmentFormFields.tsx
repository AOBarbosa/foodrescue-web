"use client";

import { Box, MenuItem, TextField } from "@mui/material";
import { Controller, type Control } from "react-hook-form";
import { PasswordField } from "@/components/ui/PasswordField";
import { formatCnpj } from "@/lib/validation/cnpj";
import type { EstablishmentFormValues } from "@/schemas/establishment";
import { ESTABLISHMENT_CATEGORIES } from "@/types/establishment";
import { ESTABLISHMENT_CATEGORY_LABELS } from "./categoryLabels";

type EstablishmentFormFieldsProps = {
  control: Control<EstablishmentFormValues>;
  passwordLabel: string;
  passwordHelperText?: string;
};

/** Fields shared by the register and edit-profile forms. */
export function EstablishmentFormFields({
  control,
  passwordLabel,
  passwordHelperText,
}: EstablishmentFormFieldsProps) {
  return (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Nome do estabelecimento"
            required
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            sx={{ gridColumn: { sm: "1 / -1" } }}
          />
        )}
      />
      <Controller
        name="cnpj"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            onChange={(event) => field.onChange(formatCnpj(event.target.value))}
            label="CNPJ"
            required
            placeholder="00.000.000/0000-00"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
        )}
      />
      <Controller
        name="category"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="Categoria"
            required
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          >
            {ESTABLISHMENT_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {ESTABLISHMENT_CATEGORY_LABELS[category]}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        name="address"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Endereço"
            required
            autoComplete="street-address"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            sx={{ gridColumn: { sm: "1 / -1" } }}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type="email"
            label="E-mail"
            required
            autoComplete="email"
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
            label={passwordLabel}
            autoComplete="new-password"
            error={!!fieldState.error}
            helperText={fieldState.error?.message ?? passwordHelperText}
          />
        )}
      />
    </Box>
  );
}
