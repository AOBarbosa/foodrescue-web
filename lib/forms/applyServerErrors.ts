import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { describeError, describeSubError } from "@/lib/api/errorMessages";
import { AppError } from "@/lib/api/errors";

/**
 * Maps a failed request back onto the form: each backend sub-error whose
 * `field` is one of the form's fields becomes that field's error. Returns the
 * message for a form-level alert when something could not be placed on a
 * field, or `null` when every error landed on a field.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  if (!(error instanceof AppError) || error.subErrors.length === 0) {
    return describeError(error);
  }

  let unmapped = false;
  let focused = false;
  for (const subError of error.subErrors) {
    const field = fields.find((name) => name === subError.field);
    if (!field) {
      unmapped = true;
      continue;
    }
    setError(field, { type: "server", message: describeSubError(subError) }, {
      shouldFocus: !focused,
    });
    focused = true;
  }

  return unmapped ? describeError(error) : null;
}
