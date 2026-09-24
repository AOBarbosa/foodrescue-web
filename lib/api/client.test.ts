import { AxiosHeaders, type AxiosAdapter } from "axios";
import { describe, expect, it, vi } from "vitest";
import { getSession, getToken, onSessionExpired, setSession } from "@/lib/auth/session";
import { apiClient } from "./client";
import { AppError } from "./errors";

const unauthorizedBody = {
  success: false,
  message: "Authentication required",
  code: "UNAUTHORIZED",
  data: { timestamp: "", status: 401, message: "Authentication required", messageCode: "UNAUTHORIZED" },
};

/** Adapter that fails with 401 and records the headers it received. */
function unauthorizedAdapter(seen: { authorization?: string }): AxiosAdapter {
  return async (config) => {
    seen.authorization = AxiosHeaders.from(config.headers).get("Authorization") as string | undefined;
    const response = { status: 401, statusText: "", data: unauthorizedBody, headers: {}, config };
    return Promise.reject(
      Object.assign(new Error("401"), { isAxiosError: true, config, response }),
    );
  };
}

describe("apiClient", () => {
  it("sends the session token and expires the session when it is rejected", async () => {
    setSession("jwt-123", { role: "ESTABLISHMENT", id: 1, name: "Padaria" });
    const seen: { authorization?: string } = {};
    const expired = vi.fn();
    const unsubscribe = onSessionExpired(expired);

    const request = apiClient.get("/products", { adapter: unauthorizedAdapter(seen) });

    await expect(request).rejects.toBeInstanceOf(AppError);
    expect(seen.authorization).toBe("Bearer jwt-123");
    expect(getToken()).toBeUndefined();
    expect(getSession()).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("does not send a token nor expire the session on anonymous 401s", async () => {
    const seen: { authorization?: string } = {};
    const expired = vi.fn();
    const unsubscribe = onSessionExpired(expired);

    await expect(
      apiClient.post("/establishments/login", {}, { adapter: unauthorizedAdapter(seen) }),
    ).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(seen.authorization).toBeUndefined();
    expect(expired).not.toHaveBeenCalled();
    unsubscribe();
  });
});
