import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/establishments";
import { ESTABLISHMENT_HOME_PATH } from "@/lib/auth/constants";
import { getToken } from "@/lib/auth/session";
import { apiError, establishment } from "@/test/fixtures";
import { router } from "@/test/navigation";
import { renderWithProviders } from "@/test/render";
import { RegisterEstablishmentForm } from "./RegisterEstablishmentForm";

vi.mock("next/navigation", async () => (await import("@/test/navigation")).navigationMock);
vi.mock("@/lib/api/establishments");

async function fillForm(user: UserEvent, overrides: { cnpj?: string } = {}) {
  await user.type(screen.getByLabelText(/nome do estabelecimento/i), "Padaria Pão Quente");
  await user.type(screen.getByLabelText(/cnpj/i), overrides.cnpj ?? "11222333000181");
  await user.click(screen.getByRole("combobox", { name: /categoria/i }));
  await user.click(await screen.findByRole("option", { name: "Padaria" }));
  await user.type(screen.getByLabelText(/endereço/i), "Rua das Flores, 123");
  await user.type(screen.getByLabelText(/e-mail/i), "contato@paoquente.com");
  await user.type(screen.getByLabelText(/^senha/i), "secret");
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("RegisterEstablishmentForm", () => {
  it("registers, starts the session and goes to the dashboard", async () => {
    vi.mocked(api.registerEstablishment).mockResolvedValue({ establishment, token: "jwt" });
    const user = userEvent.setup();
    renderWithProviders(<RegisterEstablishmentForm />);

    await fillForm(user);
    expect(screen.getByLabelText(/cnpj/i)).toHaveValue("11.222.333/0001-81");
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith(ESTABLISHMENT_HOME_PATH));
    expect(api.registerEstablishment).toHaveBeenCalledWith({
      name: "Padaria Pão Quente",
      cnpj: "11222333000181",
      address: "Rua das Flores, 123",
      category: "BAKERY",
      email: "contato@paoquente.com",
      password: "secret",
    });
    expect(getToken()).toBe("jwt");
  });

  it("shows the backend's duplicate-CNPJ error on the CNPJ field", async () => {
    vi.mocked(api.registerEstablishment).mockRejectedValue(
      apiError(422, "VALIDATION_ERROR", [
        { field: "cnpj", message: "CNPJ already registered", code: "CNPJ_ALREADY_EXISTS" },
      ]),
    );
    const user = userEvent.setup();
    renderWithProviders(<RegisterEstablishmentForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(await screen.findByText("Este CNPJ já está cadastrado.")).toBeInTheDocument();
    expect(screen.getByLabelText(/cnpj/i)).toHaveAttribute("aria-invalid", "true");
    expect(router.replace).not.toHaveBeenCalled();
    expect(getToken()).toBeUndefined();
  });

  it("blocks an invalid CNPJ before calling the API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterEstablishmentForm />);

    await fillForm(user, { cnpj: "11222333000182" });
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(await screen.findByText("CNPJ inválido.")).toBeInTheDocument();
    expect(api.registerEstablishment).not.toHaveBeenCalled();
  });

  it("shows a form-level alert when the server is unreachable", async () => {
    vi.mocked(api.registerEstablishment).mockRejectedValue(apiError(0, "NETWORK_ERROR"));
    const user = userEvent.setup();
    renderWithProviders(<RegisterEstablishmentForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/não foi possível conectar/i);
  });
});
