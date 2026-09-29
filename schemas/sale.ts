import { z } from "zod";
import { parsePrice } from "@/schemas/product";
import type { RegisterSaleRequest } from "@/types/sale";

/*
 * Client-side mirror of RegisterSaleDTO and SaleBusinessValidator: quantity
 * required, integer and > 0; unitPrice optional and > 0 (the backend falls
 * back to the product's current price); soldAt optional and never in the
 * future (the backend falls back to now). The "quantity must not exceed the
 * available stock" rule lives in the service (`Insufficient stock`, 422) and
 * depends on the product, hence the schema factory.
 */

/** `datetime-local` gives `yyyy-MM-ddTHH:mm`; the backend wants seconds too. */
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export function registerSaleSchema(availableStock: number) {
  return z.object({
    quantity: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === "") {
          ctx.addIssue({ code: "custom", message: "Informe a quantidade vendida.", fatal: true });
          return z.NEVER;
        }
        if (!/^-?\d+$/.test(value)) {
          ctx.addIssue({ code: "custom", message: "Informe um número inteiro.", fatal: true });
          return z.NEVER;
        }
        const quantity = Number(value);
        if (quantity <= 0) {
          ctx.addIssue({ code: "custom", message: "A quantidade deve ser maior que zero." });
        } else if (quantity > availableStock) {
          ctx.addIssue({
            code: "custom",
            message: `Estoque insuficiente: há ${availableStock} ${availableStock === 1 ? "unidade" : "unidades"} disponíveis.`,
          });
        }
      }),
    unitPrice: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === "") return;
        const price = parsePrice(value);
        if (price === null) {
          ctx.addIssue({ code: "custom", message: "Informe um valor como 9,90." });
        } else if (price <= 0) {
          ctx.addIssue({ code: "custom", message: "O preço deve ser maior que zero." });
        }
      }),
    soldAt: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === "") return;
        if (!LOCAL_DATE_TIME.test(value)) {
          ctx.addIssue({ code: "custom", message: "Data e hora inválidas.", fatal: true });
          return z.NEVER;
        }
        if (new Date(value).getTime() > Date.now()) {
          ctx.addIssue({ code: "custom", message: "A venda não pode estar no futuro." });
        }
      }),
  });
}

export type SaleFormValues = z.infer<ReturnType<typeof registerSaleSchema>>;

export const SALE_FORM_FIELDS = [
  "quantity",
  "unitPrice",
  "soldAt",
] as const satisfies readonly (keyof SaleFormValues)[];

/** Empty optional fields are left out so the backend applies its defaults. */
export function toRegisterSaleRequest(
  productId: number,
  values: SaleFormValues,
): RegisterSaleRequest {
  return {
    productId,
    quantity: Number(values.quantity),
    ...(values.unitPrice !== "" ? { unitPrice: parsePrice(values.unitPrice)! } : {}),
    ...(values.soldAt !== ""
      ? { soldAt: values.soldAt.length === 16 ? `${values.soldAt}:00` : values.soldAt }
      : {}),
  };
}
