import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/establishments";
import { getSession, getToken, setSession } from "@/lib/auth/session";
import { apiError, establishment } from "@/test/fixtures";
import { renderHookWithProviders } from "@/test/render";
import {
  establishmentKeys,
  useDeleteEstablishment,
  useEstablishments,
  useLoginEstablishment,
  useRegisterEstablishment,
  useUpdateEstablishment,
} from "./useEstablishments";

vi.mock("@/lib/api/establishments");

const registerRequest = {
  name: establishment.name,
  cnpj: establishment.cnpj,
  address: establishment.address,
  category: establishment.category,
  email: establishment.email,
  password: "secret",
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useEstablishments", () => {
  it("lists establishments", async () => {
    vi.mocked(api.listEstablishments).mockResolvedValue([establishment]);

    const { result } = renderHookWithProviders(() => useEstablishments());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([establishment]);
  });
});

describe("useRegisterEstablishment", () => {
  it("starts a session with the token and profile returned by the API", async () => {
    vi.mocked(api.registerEstablishment).mockResolvedValue({ establishment, token: "jwt" });

    const { result, queryClient } = renderHookWithProviders(() => useRegisterEstablishment());
    await act(() => result.current.mutateAsync(registerRequest));

    expect(getToken()).toBe("jwt");
    expect(getSession()).toEqual({ role: "ESTABLISHMENT", id: 1, name: establishment.name });
    expect(queryClient.getQueryData(establishmentKeys.detail(1))).toEqual(establishment);
  });

  it("does not start a session when the CNPJ is already registered", async () => {
    vi.mocked(api.registerEstablishment).mockRejectedValue(
      apiError(422, "VALIDATION_ERROR", [{ field: "cnpj", message: "CNPJ already registered", code: "CNPJ_ALREADY_EXISTS" }]),
    );

    const { result } = renderHookWithProviders(() => useRegisterEstablishment());
    await act(() => result.current.mutateAsync(registerRequest).catch(() => undefined));

    await waitFor(() => expect(result.current.error).toMatchObject({ status: 422 }));
    expect(getToken()).toBeUndefined();
  });
});

describe("useLoginEstablishment", () => {
  it("drops data cached for a previous account", async () => {
    vi.mocked(api.loginEstablishment).mockResolvedValue({ establishment, token: "jwt" });

    const { result, queryClient } = renderHookWithProviders(() => useLoginEstablishment());
    queryClient.setQueryData(["products", "list"], [{ id: 99 }]);
    await act(() => result.current.mutateAsync({ email: establishment.email, password: "secret" }));

    expect(queryClient.getQueryData(["products", "list"])).toBeUndefined();
    expect(getToken()).toBe("jwt");
  });
});

describe("useUpdateEstablishment", () => {
  it("updates the cached profile and the session name", async () => {
    setSession("jwt", { role: "ESTABLISHMENT", id: 1, name: "Old name" });
    const updated = { ...establishment, name: "Novo nome" };
    vi.mocked(api.updateEstablishment).mockResolvedValue(updated);

    const { result, queryClient } = renderHookWithProviders(() => useUpdateEstablishment());
    await act(() => result.current.mutateAsync({ id: 1, request: { ...registerRequest, name: "Novo nome" } }));

    expect(queryClient.getQueryData(establishmentKeys.detail(1))).toEqual(updated);
    expect(getSession()?.name).toBe("Novo nome");
  });
});

describe("useDeleteEstablishment", () => {
  it("ends the session and clears the cache", async () => {
    setSession("jwt", { role: "ESTABLISHMENT", id: 1, name: establishment.name });
    vi.mocked(api.deleteEstablishment).mockResolvedValue();

    const { result, queryClient } = renderHookWithProviders(() => useDeleteEstablishment());
    queryClient.setQueryData(establishmentKeys.detail(1), establishment);
    await act(() => result.current.mutateAsync(1));

    expect(api.deleteEstablishment).toHaveBeenCalledWith(1);
    expect(getToken()).toBeUndefined();
    expect(queryClient.getQueryData(establishmentKeys.detail(1))).toBeUndefined();
  });
});
