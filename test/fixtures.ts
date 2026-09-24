import { AppError, type AppErrorCode } from "@/lib/api/errors";
import type { ApiSubError } from "@/types/api";
import type { EstablishmentDTO } from "@/types/establishment";
import type { ProductDTO } from "@/types/product";

export const establishment: EstablishmentDTO = {
  id: 1,
  name: "Padaria Pão Quente",
  cnpj: "11222333000181",
  address: "Rua das Flores, 123 - Natal/RN",
  category: "BAKERY",
  email: "contato@paoquente.com",
  password: null,
};

export const product: ProductDTO = {
  id: 10,
  name: "Pão de forma integral",
  category: "Padaria",
  originalPrice: 9.9,
  currentPrice: 9.9,
  photoUrl: null,
  stockQuantity: 12,
  expirationDate: "2026-10-01",
  establishmentId: 1,
  modificationDate: "2026-09-20T10:00:00",
};

export function apiError(
  status: number,
  code: AppErrorCode,
  subErrors?: ApiSubError[],
  message = "error",
): AppError {
  return new AppError({ status, code, subErrors, message });
}
