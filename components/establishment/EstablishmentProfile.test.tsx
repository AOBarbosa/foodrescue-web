import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/establishments";
import { getToken, setSession } from "@/lib/auth/session";
import { apiError, establishment } from "@/test/fixtures";
import { router } from "@/test/navigation";
import { renderWithProviders } from "@/test/render";
import { EstablishmentProfile } from "./EstablishmentProfile";

vi.mock("next/navigation", async () => (await import("@/test/navigation")).navigationMock);
vi.mock("@/lib/api/establishments");

beforeEach(() => {
  vi.resetAllMocks();
  setSession("jwt", { role: "ESTABLISHMENT", id: establishment.id, name: establishment.name });
  vi.mocked(api.getEstablishment).mockResolvedValue(establishment);
});

describe("EstablishmentProfile", () => {
  it("shows the logged-in establishment's own profile", async () => {
    renderWithProviders(<EstablishmentProfile />);

    expect(await screen.findByText(establishment.name)).toBeInTheDocument();
    expect(screen.getByText("11.222.333/0001-81")).toBeInTheDocument();
    expect(screen.getByText("Padaria")).toBeInTheDocument();
    expect(api.getEstablishment).toHaveBeenCalledWith(establishment.id);
  });

  it("edits the profile keeping the current password when left blank", async () => {
    vi.mocked(api.updateEstablishment).mockResolvedValue({ ...establishment, name: "Padaria Nova" });
    const user = userEvent.setup();
    renderWithProviders(<EstablishmentProfile />);

    await user.click(await screen.findByRole("button", { name: /editar perfil/i }));
    const name = screen.getByLabelText(/nome do estabelecimento/i);
    await user.clear(name);
    await user.type(name, "Padaria Nova");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    expect(await screen.findByText("Perfil atualizado.")).toBeInTheDocument();
    expect(screen.getByText("Padaria Nova")).toBeInTheDocument();
    const [, request] = vi.mocked(api.updateEstablishment).mock.calls[0];
    expect(request).toEqual({
      name: "Padaria Nova",
      cnpj: establishment.cnpj,
      address: establishment.address,
      category: establishment.category,
      email: establishment.email,
    });
  });

  it("maps a duplicate e-mail on edit back to the e-mail field", async () => {
    vi.mocked(api.updateEstablishment).mockRejectedValue(
      apiError(422, "VALIDATION_ERROR", [
        { field: "email", message: "email already registered", code: "EMAIL_ALREADY_EXISTS" },
      ]),
    );
    const user = userEvent.setup();
    renderWithProviders(<EstablishmentProfile />);

    await user.click(await screen.findByRole("button", { name: /editar perfil/i }));
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    expect(await screen.findByText("Este e-mail já está cadastrado.")).toBeInTheDocument();
  });

  it("deletes the account after confirmation and ends the session", async () => {
    vi.mocked(api.deleteEstablishment).mockResolvedValue();
    const user = userEvent.setup();
    renderWithProviders(<EstablishmentProfile />);

    await user.click(await screen.findByRole("button", { name: /excluir conta/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /excluir conta/i }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    expect(api.deleteEstablishment).toHaveBeenCalledWith(establishment.id);
    expect(getToken()).toBeUndefined();
  });
});
