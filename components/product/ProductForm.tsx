"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Autocomplete, Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useCreateProduct, useProducts } from "@/hooks/useProducts";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";
import {
  createProductSchema,
  PRODUCT_FORM_FIELDS,
  toCreateProductRequest,
  type ProductFormValues,
} from "@/schemas/product";

/** Category is free text; these are only suggestions, merged with the ones already in use. */
const SUGGESTED_CATEGORIES = [
  "Pães",
  "Bolos e doces",
  "Salgados",
  "Refeições",
  "Laticínios",
  "Frios",
  "Hortifrúti",
  "Bebidas",
];

export function ProductForm() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { data: products } = useProducts();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: "", category: "", originalPrice: "", photoUrl: "" },
  });

  const categories = useMemo(
    () =>
      Array.from(new Set([...(products ?? []).map((p) => p.category), ...SUGGESTED_CATEGORIES])).sort(
        (a, b) => a.localeCompare(b, "pt-BR"),
      ),
    [products],
  );

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const product = await createProduct.mutateAsync(toCreateProductRequest(values));
      router.push(`/dashboard/products/${product.id}?created=1`);
    } catch (error) {
      setFormError(applyServerErrors(error, setError, PRODUCT_FORM_FIELDS));
    }
  });

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Nome do produto"
              required
              autoFocus
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
          )}
        />
        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <Autocomplete
              freeSolo
              options={categories}
              inputValue={field.value}
              onInputChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={field.ref}
                  onBlur={field.onBlur}
                  label="Categoria"
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? "Escolha uma sugestão ou digite uma nova."}
                />
              )}
            />
          )}
        />
        <Controller
          name="originalPrice"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Preço original"
              required
              placeholder="0,00"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> },
                htmlInput: { inputMode: "decimal" },
              }}
            />
          )}
        />
        <Controller
          name="photoUrl"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="url"
              label="URL da foto (opcional)"
              placeholder="https://"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
          )}
        />
      </Box>
      {formError && <Alert severity="error">{formError}</Alert>}
      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
        <Button onClick={() => router.back()} disabled={createProduct.isPending}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" loading={createProduct.isPending}>
          Cadastrar produto
        </Button>
      </Stack>
    </Stack>
  );
}
