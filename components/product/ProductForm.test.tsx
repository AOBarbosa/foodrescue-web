import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/products";
import { apiError, product } from "@/test/fixtures";
import { router } from "@/test/navigation";
import { renderWithProviders } from "@/test/render";
import { ProductForm } from "./ProductForm";

vi.mock("next/navigation", async () => (await import("@/test/navigation")).navigationMock);
vi.mock("@/lib/api/products");

async function fillForm(user: UserEvent, price: string) {
  await user.type(screen.getByLabelText(/nome do produto/i), "Pão de forma integral");
  await user.type(screen.getByRole("combobox", { name: /categoria/i }), "Padaria");
  await user.type(screen.getByLabelText(/preço original/i), price);
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.listProducts).mockResolvedValue([]);
});

describe("ProductForm", () => {
  it("creates the product and opens its page", async () => {
    vi.mocked(api.createProduct).mockResolvedValue(product);
    const user = userEvent.setup();
    renderWithProviders(<ProductForm />);

    await fillForm(user, "9,90");
    await user.click(screen.getByRole("button", { name: /cadastrar produto/i }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith(`/dashboard/products/${product.id}?created=1`));
    expect(api.createProduct).toHaveBeenCalledWith({
      name: "Pão de forma integral",
      category: "Padaria",
      originalPrice: 9.9,
    });
  });

  it.each(["0", "-3"])("blocks price %s before calling the API", async (price) => {
    const user = userEvent.setup();
    renderWithProviders(<ProductForm />);

    await fillForm(user, price);
    await user.click(screen.getByRole("button", { name: /cadastrar produto/i }));

    expect(await screen.findByText("O preço deve ser maior que zero.")).toBeInTheDocument();
    expect(api.createProduct).not.toHaveBeenCalled();
  });

  it("maps the backend's validation error back onto the price field", async () => {
    vi.mocked(api.createProduct).mockRejectedValue(
      apiError(400, "VALIDATION_ERROR", [
        { field: "originalPrice", message: "must be greater than 0", code: "Positive" },
      ]),
    );
    const user = userEvent.setup();
    renderWithProviders(<ProductForm />);

    await fillForm(user, "0,01");
    await user.click(screen.getByRole("button", { name: /cadastrar produto/i }));

    expect(await screen.findByText("Deve ser maior que zero.")).toBeInTheDocument();
    expect(screen.getByLabelText(/preço original/i)).toHaveAttribute("aria-invalid", "true");
    expect(router.push).not.toHaveBeenCalled();
  });
});
