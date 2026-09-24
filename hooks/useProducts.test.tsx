import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/products";
import { apiError, product } from "@/test/fixtures";
import { renderHookWithProviders } from "@/test/render";
import { productKeys, useCreateProduct, useProduct, useProducts } from "./useProducts";

vi.mock("@/lib/api/products");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useProducts", () => {
  it("lists the establishment's products", async () => {
    vi.mocked(api.listProducts).mockResolvedValue([product]);

    const { result } = renderHookWithProviders(() => useProducts());

    await waitFor(() => expect(result.current.data).toEqual([product]));
  });
});

describe("useProduct", () => {
  it("surfaces a 404 (missing or another establishment's product)", async () => {
    vi.mocked(api.getProduct).mockRejectedValue(apiError(404, "ENTITY_NOT_FOUND"));

    const { result } = renderHookWithProviders(() => useProduct(99));

    await waitFor(() => expect(result.current.error).toMatchObject({ status: 404 }));
    expect(api.getProduct).toHaveBeenCalledWith(99);
  });
});

describe("useCreateProduct", () => {
  it("caches the created product and refreshes the list", async () => {
    vi.mocked(api.createProduct).mockResolvedValue(product);
    vi.mocked(api.listProducts).mockResolvedValue([]);

    const { result, queryClient } = renderHookWithProviders(() => useCreateProduct());
    queryClient.setQueryData(productKeys.list(), []);
    await act(() =>
      result.current.mutateAsync({ name: product.name, category: product.category, originalPrice: 9.9 }),
    );

    expect(queryClient.getQueryData(productKeys.detail(product.id))).toEqual(product);
    expect(queryClient.getQueryState(productKeys.list())?.isInvalidated).toBe(true);
  });
});
