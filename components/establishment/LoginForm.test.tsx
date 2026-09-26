import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/establishments";
import { getSession } from "@/lib/auth/session";
import { apiError, establishment } from "@/test/fixtures";
import { router } from "@/test/navigation";
import { renderWithProviders } from "@/test/render";
import { LoginForm } from "./LoginForm";

vi.mock("next/navigation", async () => (await import("@/test/navigation")).navigationMock);
vi.mock("@/lib/api/establishments");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("LoginForm", () => {
  it("logs in and returns to the requested dashboard page", async () => {
    vi.mocked(api.loginEstablishment).mockResolvedValue({ establishment, token: "jwt" });
    const user = userEvent.setup();
    renderWithProviders(<LoginForm redirectTo="/dashboard/products" />);

    await user.type(screen.getByLabelText(/e-mail/i), "contato@paoquente.com");
    await user.type(screen.getByLabelText(/^senha/i), "secret");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard/products"));
    expect(api.loginEstablishment).toHaveBeenCalledWith({ email: "contato@paoquente.com", password: "secret" });
    expect(getSession()).toEqual({ role: "ESTABLISHMENT", id: 1, name: establishment.name });
  });

  it("shows a friendly message for wrong credentials (422)", async () => {
    vi.mocked(api.loginEstablishment).mockRejectedValue(apiError(422, "BUSINESS_RULE_VIOLATION"));
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), "contato@paoquente.com");
    await user.type(screen.getByLabelText(/^senha/i), "wrong");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("validates required fields client-side", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("Informe o e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
    expect(api.loginEstablishment).not.toHaveBeenCalled();
  });
});
