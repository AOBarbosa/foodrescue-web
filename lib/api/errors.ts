import { isAxiosError } from "axios";
import type { ApiError, ApiResponse, ApiSubError, MessageCode } from "@/types/api";

export type AppErrorCode = MessageCode | "NETWORK_ERROR" | "UNKNOWN";

/**
 * The single error type the rest of the app deals with. Every failed request
 * is normalized into one of these by the response interceptor in `client.ts`,
 * so hooks and components never inspect Axios errors or raw envelopes.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: AppErrorCode;
  readonly subErrors: ApiSubError[];

  constructor(params: {
    message: string;
    status: number;
    code: AppErrorCode;
    subErrors?: ApiSubError[];
  }) {
    super(params.message);
    this.name = "AppError";
    this.status = params.status;
    this.code = params.code;
    this.subErrors = params.subErrors ?? [];
  }
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "messageCode" in value &&
    "status" in value
  );
}

function isEnvelope(value: unknown): value is ApiResponse<unknown> {
  return typeof value === "object" && value !== null && "success" in value && "data" in value;
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isAxiosError(error)) {
    const response = error.response;
    if (!response) {
      return new AppError({ message: error.message, status: 0, code: "NETWORK_ERROR" });
    }

    const body: unknown = response.data;
    if (isEnvelope(body) && isApiError(body.data)) {
      return new AppError({
        message: body.data.message || body.message,
        status: body.data.status ?? response.status,
        code: body.data.messageCode,
        subErrors: body.data.subErrors,
      });
    }

    return new AppError({
      message: error.message,
      status: response.status,
      code: response.status >= 500 ? "INTERNAL_ERROR" : "UNKNOWN",
    });
  }

  return new AppError({
    message: error instanceof Error ? error.message : String(error),
    status: 0,
    code: "UNKNOWN",
  });
}
