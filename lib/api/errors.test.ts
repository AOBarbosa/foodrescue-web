import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { AppError, toAppError } from "./errors";

function axiosErrorWith(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response = { status, data, statusText: "", headers: {}, config } as AxiosResponse;
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, response);
}

describe("toAppError", () => {
  it("normalizes the backend envelope, keeping code and sub-errors", () => {
    const error = toAppError(
      axiosErrorWith(422, {
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        data: {
          timestamp: "2026-09-24T10:00:00",
          status: 422,
          message: "Validation failed",
          messageCode: "VALIDATION_ERROR",
          subErrors: [{ field: "cnpj", message: "CNPJ already registered", code: "CNPJ_ALREADY_EXISTS" }],
        },
      }),
    );

    expect(error).toBeInstanceOf(AppError);
    expect(error.status).toBe(422);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.subErrors).toEqual([
      { field: "cnpj", message: "CNPJ already registered", code: "CNPJ_ALREADY_EXISTS" },
    ]);
  });

  it("handles envelopes from Spring Security (401) without sub-errors", () => {
    const error = toAppError(
      axiosErrorWith(401, {
        success: false,
        message: "Authentication required",
        code: "UNAUTHORIZED",
        data: { timestamp: "", status: 401, message: "Authentication required", messageCode: "UNAUTHORIZED" },
      }),
    );

    expect(error.status).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.subErrors).toEqual([]);
  });

  it("maps a missing response to NETWORK_ERROR", () => {
    const error = toAppError(new AxiosError("Network Error", "ERR_NETWORK"));

    expect(error.status).toBe(0);
    expect(error.code).toBe("NETWORK_ERROR");
  });

  it("falls back on the HTTP status when the body is not an envelope", () => {
    expect(toAppError(axiosErrorWith(502, "Bad Gateway")).code).toBe("INTERNAL_ERROR");
    expect(toAppError(axiosErrorWith(418, null)).code).toBe("UNKNOWN");
  });

  it("wraps non-Axios errors", () => {
    const error = toAppError(new Error("boom"));

    expect(error.code).toBe("UNKNOWN");
    expect(error.message).toBe("boom");
  });
});
