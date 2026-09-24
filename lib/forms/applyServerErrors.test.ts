import { describe, expect, it, vi } from "vitest";
import { apiError } from "@/test/fixtures";
import { applyServerErrors } from "./applyServerErrors";

type Form = { cnpj: string; email: string };
const fields = ["cnpj", "email"] as const;

describe("applyServerErrors", () => {
  it("places each sub-error on its field, using pt-BR copy for known codes", () => {
    const setError = vi.fn();
    const error = apiError(422, "VALIDATION_ERROR", [
      { field: "cnpj", message: "CNPJ already registered", code: "CNPJ_ALREADY_EXISTS" },
      { field: "email", message: "email already registered", code: "EMAIL_ALREADY_EXISTS" },
    ]);

    const alert = applyServerErrors<Form>(error, setError, fields);

    expect(alert).toBeNull();
    expect(setError).toHaveBeenCalledWith(
      "cnpj",
      { type: "server", message: "Este CNPJ já está cadastrado." },
      { shouldFocus: true },
    );
    expect(setError).toHaveBeenCalledWith(
      "email",
      { type: "server", message: "Este e-mail já está cadastrado." },
      { shouldFocus: false },
    );
  });

  it("falls back to the backend message for unknown sub-error codes", () => {
    const setError = vi.fn();
    const error = apiError(400, "VALIDATION_ERROR", [{ field: "email", message: "must be well-formed" }]);

    applyServerErrors<Form>(error, setError, fields);

    expect(setError).toHaveBeenCalledWith(
      "email",
      { type: "server", message: "must be well-formed" },
      expect.anything(),
    );
  });

  it("returns a form-level message when a sub-error has no matching field", () => {
    const setError = vi.fn();
    const error = apiError(400, "VALIDATION_ERROR", [{ field: "somethingElse", message: "bad" }]);

    const alert = applyServerErrors<Form>(error, setError, fields);

    expect(setError).not.toHaveBeenCalled();
    expect(alert).toBe("Alguns campos estão inválidos. Revise e tente novamente.");
  });

  it("returns a form-level message for errors without sub-errors", () => {
    const alert = applyServerErrors<Form>(apiError(422, "BUSINESS_RULE_VIOLATION"), vi.fn(), fields);

    expect(alert).toBe("A operação não é permitida.");
  });
});
