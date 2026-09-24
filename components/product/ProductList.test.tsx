import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/products";
import { apiError, product } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { ProductList } from "./ProductList";

vi.mock("next/navigation", async () => (await import("@/test/navigation")).navigationMock);
vi.mock("@/lib/api/products");

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 24, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ProductList", () => {
  it("shows an empty state with a call to action", async () => {
    vi.mocked(api.listProducts).mockResolvedValue([]);
    renderWithProviders(<ProductList />);

    expect(await screen.findByText("Nenhum produto cadastrado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cadastrar primeiro produto/i })).toHaveAttribute(
      "href",
      "/dashboard/products/new",
    );
  });

  it("lists soonest-expiring first, with their status", async () => {
    vi.mocked(api.listProducts).mockResolvedValue([
      { ...product, id: 1, name: "Sem data", expirationDate: null },
      { ...product, id: 2, name: "Iogurte", expirationDate: "2026-10-30" },
      { ...product, id: 3, name: "Pão", expirationDate: "2026-09-25" },
      { ...product, id: 4, name: "Leite", expirationDate: "2026-09-20" },
    ]);
    renderWithProviders(<ProductList />);

    const rows = (await screen.findAllByRole("row")).slice(1);
    expect(rows.map((row) => within(row).getAllByRole("cell")[0].textContent)).toEqual([
      "Leite",
      "Pão",
      "Iogurte",
      "Sem data",
    ]);
    expect(within(rows[0]).getByText("Vencido")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Vence em breve")).toBeInTheDocument();
    expect(within(rows[2]).getByText("No prazo")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Sem validade")).toBeInTheDocument();
    expect(within(rows[0]).getByText("20/09/2026")).toBeInTheDocument();
  });

  it("shows an error with retry when loading fails", async () => {
    vi.mocked(api.listProducts).mockRejectedValue(apiError(500, "INTERNAL_ERROR"));
    renderWithProviders(<ProductList />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/erro no servidor/i);
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
