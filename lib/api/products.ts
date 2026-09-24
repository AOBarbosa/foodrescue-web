import type { ApiResponse } from "@/types/api";
import type { CreateProductRequest, ProductDTO } from "@/types/product";
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
