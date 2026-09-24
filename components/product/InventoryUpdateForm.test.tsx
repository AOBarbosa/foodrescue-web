import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { productKeys } from "@/hooks/useProducts";
import * as api from "@/lib/api/products";
import { apiError, product } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { InventoryUpdateForm } from "./InventoryUpdateForm";

vi.mock("@/lib/api/products");

const stockField = () => screen.getByLabelText(/quantidade em estoque/i);
const dateField = () => screen.getByLabelText(/data de validade/i);
const submit = () => screen.getByRole("button", { name: /salvar estoque e validade/i });

function setDate(value: string) {
  fireEvent.change(dateField(), { target: { value } });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 24, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("InventoryUpdateForm", () => {
  it("starts from the current values and only enables saving after a change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InventoryUpdateForm product={product} />);

    expect(stockField()).toHaveValue(12);
    expect(dateField()).toHaveValue("2026-10-01");
    expect(submit()).toBeDisabled();

    await user.clear(stockField());
    await user.type(stockField(), "30");
    expect(submit()).toBeEnabled();
  });

  it("updates stock and expiration and refreshes the cached product", async () => {
    const updated = { ...product, stockQuantity: 30, expirationDate: "2026-10-10" };
    vi.mocked(api.updateInventory).mockResolvedValue({ product: updated, expirationDateInPast: false });
    const user = userEvent.setup();
    const { queryClient } = renderWithProviders(<InventoryUpdateForm product={product} />);

    await user.clear(stockField());
    await user.type(stockField(), "30");
    setDate("2026-10-10");
    await user.click(submit());

    expect(await screen.findByText("Estoque e validade atualizados.")).toBeInTheDocument();
    expect(api.updateInventory).toHaveBeenCalledWith(product.id, {
      stockQuantity: 30,
      expirationDate: "2026-10-10",
    });
    expect(queryClient.getQueryData(productKeys.detail(product.id))).toEqual(updated);
  });

  it("sends only the stock when the date is left empty (partial update)", async () => {
    const undated = { ...product, expirationDate: null };
    vi.mocked(api.updateInventory).mockResolvedValue({
      product: { ...undated, stockQuantity: 5 },
      expirationDateInPast: false,
    });
    const user = userEvent.setup();
    renderWithProviders(<InventoryUpdateForm product={undated} />);

    await user.clear(stockField());
    await user.type(stockField(), "5");
    await user.click(submit());

    await waitFor(() => expect(api.updateInventory).toHaveBeenCalledWith(product.id, { stockQuantity: 5 }));
  });

  it("treats a past expiration date as a warning, not an error", async () => {
    const saved = { ...product, expirationDate: "2026-09-20" };
    vi.mocked(api.updateInventory).mockResolvedValue({ product: saved, expirationDateInPast: true });
    const user = userEvent.setup();
    renderWithProviders(<InventoryUpdateForm product={product} />);

    setDate("2026-09-20");
    expect(screen.getByText(/esta data já passou/i)).toBeInTheDocument();
    expect(dateField()).not.toHaveAttribute("aria-invalid", "true");
    await user.click(submit());

    const warning = await screen.findByRole("alert");
    expect(warning).toHaveTextContent("Estoque atualizado, mas a validade informada (20/09/2026) já passou.");
    expect(warning.className).toMatch(/warning/i);
    expect(api.updateInventory).toHaveBeenCalledWith(product.id, {
      stockQuantity: 12,
      expirationDate: "2026-09-20",
    });
  });

  it("blocks a negative stock before calling the API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InventoryUpdateForm product={product} />);

    await user.clear(stockField());
    await user.type(stockField(), "-1");
    await user.click(submit());

    expect(await screen.findByText("O estoque não pode ser negativo.")).toBeInTheDocument();
    expect(api.updateInventory).not.toHaveBeenCalled();
  });

  it("requires at least one of the two fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InventoryUpdateForm product={product} />);

    await user.clear(stockField());
    setDate("");
    await user.click(submit());

    expect(await screen.findByText("Informe o estoque, a validade ou ambos.")).toBeInTheDocument();
    expect(api.updateInventory).not.toHaveBeenCalled();
  });

  it("explains the backend's 422 (e.g. negative stock) as a form error", async () => {
    vi.mocked(api.updateInventory).mockRejectedValue(apiError(422, "BUSINESS_RULE_VIOLATION"));
    const user = userEvent.setup();
    renderWithProviders(<InventoryUpdateForm product={product} />);

    await user.clear(stockField());
    await user.type(stockField(), "3");
    await user.click(submit());

    expect(await screen.findByRole("alert")).toHaveTextContent(/o estoque não pode ser negativo/i);
  });
});
