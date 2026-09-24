import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/products";
import { apiError, product } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { ProductDetails } from "./ProductDetails";

vi.mock("next/navigation", async () => (await import("@/test/navigation")).navigationMock);
vi.mock("@/lib/api/products");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ProductDetails", () => {
  it("shows the product", async () => {
    vi.mocked(api.getProduct).mockResolvedValue(product);
    renderWithProviders(<ProductDetails productId={product.id} />);

    expect(await screen.findByRole("heading", { name: product.name, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("12 unidades")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 9,90")).toHaveLength(2);
    expect(screen.getByText("01/10/2026")).toBeInTheDocument();
  });

  it("explains a 404 without confirming whether the product exists", async () => {
    vi.mocked(api.getProduct).mockRejectedValue(apiError(404, "ENTITY_NOT_FOUND"));
    renderWithProviders(<ProductDetails productId={999} />);

    expect(await screen.findByText("Produto não encontrado")).toBeInTheDocument();
    expect(screen.getByText(/não existe ou não pertence ao seu estabelecimento/i)).toBeInTheDocument();
  });
});
