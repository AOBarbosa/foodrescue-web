import type { ApiResponse } from "@/types/api";
import type { RegisterSaleRequest, SaleDTO, SaleHistoryQuery } from "@/types/sale";
import { apiClient, unwrap } from "./client";

/*
 * Every sale route requires the ESTABLISHMENT role and only reaches the
 * authenticated establishment's own products (someone else's → 404).
 */

/**
 * Registers a counter sale. The backend deducts the quantity from the
 * product's stock, so the cached product is stale after this call.
 * Selling more than the available stock is a `422 BUSINESS_RULE_VIOLATION`.
 */
export async function registerSale(request: RegisterSaleRequest): Promise<SaleDTO> {
  return unwrap(await apiClient.post<ApiResponse<SaleDTO>>("/sales", request));
}

export async function getSale(id: number): Promise<SaleDTO> {
  return unwrap(await apiClient.get<ApiResponse<SaleDTO>>(`/sales/${id}`));
}

/** Sales of one product within a period, oldest first. */
export async function listSales({
  productId,
  startDate,
  endDate,
}: SaleHistoryQuery): Promise<SaleDTO[]> {
  return unwrap(
    await apiClient.get<ApiResponse<SaleDTO[]>>("/sales", {
      params: { productId, startDate, endDate },
    }),
  );
}
