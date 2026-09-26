import type { ApiResponse } from "@/types/api";
import type {
  CreateProductRequest,
  ProductDTO,
  UpdateInventoryRequest,
  UpdateInventoryResponse,
} from "@/types/product";
import { apiClient, unwrap } from "./client";

/*
 * Every product route requires the ESTABLISHMENT role and only sees the
 * authenticated establishment's own products (someone else's → 404).
 */

export async function createProduct(request: CreateProductRequest): Promise<ProductDTO> {
  return unwrap(await apiClient.post<ApiResponse<ProductDTO>>("/products", request));
}

export async function listProducts(): Promise<ProductDTO[]> {
  return unwrap(await apiClient.get<ApiResponse<ProductDTO[]>>("/products"));
}

export async function getProduct(id: number): Promise<ProductDTO> {
  return unwrap(await apiClient.get<ApiResponse<ProductDTO>>(`/products/${id}`));
}

/**
 * Partial update: only the informed fields change. A past expiration date is
 * saved anyway and flagged through `expirationDateInPast`.
 */
export async function updateInventory(
  id: number,
  request: UpdateInventoryRequest,
): Promise<UpdateInventoryResponse> {
  return unwrap(
    await apiClient.patch<ApiResponse<UpdateInventoryResponse>>(`/products/${id}/inventory`, request),
  );
}
