import type { ApiSubError } from "@/types/api";
import { AppError, type AppErrorCode } from "./errors";

/**
 * User-facing (pt-BR) copy for backend errors. The backend's own messages are
 * in English and meant for developers, so they are only a last resort.
 */
const MESSAGES_BY_CODE: Record<AppErrorCode, string> = {
  VALIDATION_ERROR: "Alguns campos estão inválidos. Revise e tente novamente.",
  INVALID_PAYLOAD: "Os dados enviados são inválidos. Revise e tente novamente.",
  CONSTRAINT_VIOLATION: "Alguns campos estão inválidos. Revise e tente novamente.",
  ENTITY_NOT_FOUND: "Não encontramos o que você procurava.",
  DUPLICATE_ENTITY: "Já existe um cadastro com esses dados.",
  BUSINESS_RULE_VIOLATION: "A operação não é permitida.",
  OPTIMISTIC_LOCK_CONFLICT:
    "Este registro foi alterado em outro lugar. Recarregue a página e tente novamente.",
  ACCESS_DENIED: "Você não tem permissão para realizar esta ação.",
  UNAUTHORIZED: "Sua sessão expirou. Entre novamente.",
  INTERNAL_ERROR: "Ocorreu um erro no servidor. Tente novamente em instantes.",
  NETWORK_ERROR: "Não foi possível conectar ao servidor. Verifique sua conexão.",
  UNKNOWN: "Algo deu errado. Tente novamente.",
};

/** Backend sub-error codes (business validators and bean validation). */
const MESSAGES_BY_SUB_ERROR_CODE: Record<string, string> = {
  CNPJ_ALREADY_EXISTS: "Este CNPJ já está cadastrado.",
  EMAIL_ALREADY_EXISTS: "Este e-mail já está cadastrado.",
  INVALID_CNPJ_FORMAT: "CNPJ inválido.",
  NotBlank: "Campo obrigatório.",
  NotNull: "Campo obrigatório.",
  Email: "E-mail inválido.",
  Positive: "Deve ser maior que zero.",
};

export function describeError(error: unknown): string {
  if (error instanceof AppError) return MESSAGES_BY_CODE[error.code];
  return MESSAGES_BY_CODE.UNKNOWN;
}

export function describeSubError(subError: ApiSubError): string {
  return (subError.code && MESSAGES_BY_SUB_ERROR_CODE[subError.code]) || subError.message;
}
