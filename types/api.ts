/**
 * Response envelope shared by every backend endpoint, success or error.
 * Mirrors `rest/dtos/ApiResponse`, `ApiError` and `ApiSubError` in foodrescue-api.
 */

export type MessageCode =
  | "VALIDATION_ERROR"
  | "INVALID_PAYLOAD"
  | "CONSTRAINT_VIOLATION"
  | "ENTITY_NOT_FOUND"
  | "DUPLICATE_ENTITY"
  | "BUSINESS_RULE_VIOLATION"
  | "OPTIMISTIC_LOCK_CONFLICT"
  | "ACCESS_DENIED"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";

export type ApiSubError = {
  object?: string;
  field: string;
  rejectedValue?: unknown;
  message: string;
  code?: string;
};

export type ApiError = {
  timestamp: string;
  status: number;
  message: string;
  messageCode: MessageCode;
  subErrors?: ApiSubError[];
};

export type ApiResponse<T> = {
  data: T | ApiError;
  message: string;
  success: boolean;
  code: MessageCode | null;
};
