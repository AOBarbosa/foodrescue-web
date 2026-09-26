"use client";

import { useState } from "react";
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useUpdateInventory } from "@/hooks/useProducts";
import { AppError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";
import { daysUntil } from "@/lib/product/expiration";
import {
  INVENTORY_FORM_FIELDS,
  inventoryUpdateSchema,
  toUpdateInventoryRequest,
  type InventoryFormValues,
} from "@/schemas/product";
import type { ProductDTO } from "@/types/product";

type Outcome = { severity: "success" | "warning"; message: string };

function isPast(isoDate: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) && daysUntil(isoDate) < 0;
}

function toFormValues(product: ProductDTO): InventoryFormValues {
  return {
    stockQuantity: String(product.stockQuantity),
    expirationDate: product.expirationDate ?? "",
  };
}

export function InventoryUpdateForm({ product }: { product: ProductDTO }) {
  const updateInventory = useUpdateInventory(product.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const { control, handleSubmit, setError, reset, formState } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: toFormValues(product),
  });
  const expirationDate = useWatch({ control, name: "expirationDate" });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setOutcome(null);
    try {
      const result = await updateInventory.mutateAsync(toUpdateInventoryRequest(values));
      reset(toFormValues(result.product));
      // A past date is saved on purpose: warn, don't fail.
      setOutcome(
        result.expirationDateInPast && result.product.expirationDate
          ? {
              severity: "warning",
              message: `Estoque atualizado, mas a validade informada (${formatDate(result.product.expirationDate)}) já passou. O produto aparece como vencido.`,
            }
          : { severity: "success", message: "Estoque e validade atualizados." },
      );
    } catch (error) {
      // 422 here means an empty update or a negative stock (see ProductService).
      setFormError(
        error instanceof AppError && error.code === "BUSINESS_RULE_VIOLATION"
          ? "Não foi possível atualizar: informe o estoque e/ou a validade, e o estoque não pode ser negativo."
          : applyServerErrors(error, setError, INVENTORY_FORM_FIELDS),
      );
    }
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Estoque e validade
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Altere um dos campos ou os dois. Campos vazios não são alterados.
        </Typography>
        <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
          <Controller
            name="stockQuantity"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="number"
                label="Quantidade em estoque"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{ htmlInput: { min: 0, step: 1, inputMode: "numeric" } }}
              />
            )}
          />
          <Controller
            name="expirationDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="date"
                label="Data de validade"
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  (isPast(expirationDate) ? "Esta data já passou. Você ainda pode salvar." : undefined)
                }
                slotProps={{
                  inputLabel: { shrink: true },
                  formHelperText: { sx: isPast(expirationDate) ? { color: "warning.dark" } : undefined },
                }}
              />
            )}
          />
          {formError && <Alert severity="error">{formError}</Alert>}
          {outcome && (
            <Alert severity={outcome.severity} onClose={() => setOutcome(null)}>
              {outcome.message}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            loading={updateInventory.isPending}
            disabled={!formState.isDirty}
          >
            Salvar estoque e validade
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
