import { z } from "zod";
import type { CreateProductRequest, UpdateInventoryRequest } from "@/types/product";

/*
 * Client-side mirror of RegisterProductDTO: name and category required
 * (category is free text), originalPrice required and > 0, photoUrl optional.
 */

/** Accepts `9,90`, `9.90`, `1.234,50`; `null` when it isn't a number. */
export function parsePrice(value: string): number | null {
  const raw = value.trim();
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized);
}

const requiredText = (message: string) => z.string().trim().min(1, { error: message, abort: true });

export const createProductSchema = z.object({
  name: requiredText("Informe o nome do produto."),
  category: requiredText("Informe a categoria."),
  originalPrice: requiredText("Informe o preço.").superRefine((value, ctx) => {
    const price = parsePrice(value);
    if (price === null) {
      ctx.addIssue({ code: "custom", message: "Informe um valor como 9,90." });
    } else if (price <= 0) {
      ctx.addIssue({ code: "custom", message: "O preço deve ser maior que zero." });
    }
  }),
  photoUrl: z.union([z.literal(""), z.url({ error: "Informe um endereço (URL) válido." })]),
});

export type ProductFormValues = z.infer<typeof createProductSchema>;

export const PRODUCT_FORM_FIELDS = [
  "name",
  "category",
  "originalPrice",
  "photoUrl",
] as const satisfies readonly (keyof ProductFormValues)[];

export function toCreateProductRequest(values: ProductFormValues): CreateProductRequest {
  return {
    name: values.name,
    category: values.category,
    originalPrice: parsePrice(values.originalPrice)!,
    ...(values.photoUrl ? { photoUrl: values.photoUrl } : {}),
  };
}

/*
 * Client-side mirror of the inventory rules in ProductService.updateInventory:
 * at least one field, stock not negative. A past expiration date is NOT an
 * error — the backend saves it and flags it, and so does the UI.
 */
export const inventoryUpdateSchema = z
  .object({
    stockQuantity: z
      .string()
      .trim()
      .refine((value) => value === "" || /^-?\d+$/.test(value), {
        message: "Informe um número inteiro.",
        abort: true,
      })
      .refine((value) => value === "" || Number(value) >= 0, {
        message: "O estoque não pode ser negativo.",
      }),
    expirationDate: z.union([z.literal(""), z.iso.date({ error: "Data inválida." })]),
  })
  .refine((values) => values.stockQuantity !== "" || values.expirationDate !== "", {
    message: "Informe o estoque, a validade ou ambos.",
    path: ["stockQuantity"],
  });

export type InventoryFormValues = z.infer<typeof inventoryUpdateSchema>;

export const INVENTORY_FORM_FIELDS = [
  "stockQuantity",
  "expirationDate",
] as const satisfies readonly (keyof InventoryFormValues)[];

/** Only the informed fields are sent (partial update). */
export function toUpdateInventoryRequest(values: InventoryFormValues): UpdateInventoryRequest {
  return {
    ...(values.stockQuantity !== "" ? { stockQuantity: Number(values.stockQuantity) } : {}),
    ...(values.expirationDate !== "" ? { expirationDate: values.expirationDate } : {}),
  };
}
