import { z } from "zod";
import { isValidCnpj, onlyDigits } from "@/lib/validation/cnpj";
import {
  ESTABLISHMENT_CATEGORIES,
  type EstablishmentCategory,
  type LoginRequest,
  type RegisterEstablishmentRequest,
  type UpdateEstablishmentRequest,
} from "@/types/establishment";

/*
 * Client-side mirror of the backend rules (bean validation on
 * EstablishmentDTO / EstablishmentUpdateDTO / LoginRequest, plus the CNPJ
 * format check in EstablishmentBusinessValidator). Uniqueness of CNPJ and
 * e-mail can only be checked by the backend; those errors come back as
 * sub-errors and are mapped onto the fields by `applyServerErrors`.
 */

const requiredText = (message: string) => z.string().trim().min(1, { error: message, abort: true });

const email = requiredText("Informe o e-mail.").pipe(z.email("E-mail inválido."));

const category = z
  .string()
  .refine((value) => (ESTABLISHMENT_CATEGORIES as readonly string[]).includes(value), {
    message: "Selecione a categoria.",
  });

const establishmentFields = {
  name: requiredText("Informe o nome do estabelecimento."),
  cnpj: requiredText("Informe o CNPJ.").refine(isValidCnpj, { message: "CNPJ inválido." }),
  address: requiredText("Informe o endereço."),
  category,
  email,
};

export const registerEstablishmentSchema = z.object({
  ...establishmentFields,
  password: z.string().min(1, "Informe a senha."),
});

/** Same fields as registration; a blank password keeps the current one. */
export const updateEstablishmentSchema = z.object({
  ...establishmentFields,
  password: z.string(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha."),
});

/** Shared by the register and edit forms (same fields, different password rule). */
export type EstablishmentFormValues = z.infer<typeof registerEstablishmentSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;

export const ESTABLISHMENT_FORM_FIELDS = [
  "name",
  "cnpj",
  "address",
  "category",
  "email",
  "password",
] as const satisfies readonly (keyof EstablishmentFormValues)[];

export function toRegisterEstablishmentRequest(
  values: EstablishmentFormValues,
): RegisterEstablishmentRequest {
  return {
    ...values,
    cnpj: onlyDigits(values.cnpj),
    category: values.category as EstablishmentCategory,
  };
}

export function toUpdateEstablishmentRequest(
  values: EstablishmentFormValues,
): UpdateEstablishmentRequest {
  const { password, ...rest } = values;
  return {
    ...rest,
    cnpj: onlyDigits(values.cnpj),
    category: values.category as EstablishmentCategory,
    ...(password.trim() ? { password } : {}),
  };
}

export function toLoginRequest(values: LoginFormValues): LoginRequest {
  return values;
}
