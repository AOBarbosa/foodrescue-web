/** Mirrors `SaleDTO` and `RegisterSaleDTO` in foodrescue-api (UC04). */

export type SaleDTO = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  /** `quantity * unitPrice`, calculated by the backend. */
  totalPrice: number;
  /** ISO local datetime */
  soldAt: string;
  /** ISO local datetime */
  creationDate: string | null;
};

export type RegisterSaleRequest = {
  productId: number;
  quantity: number;
  /** Defaults to the product's `currentPrice` when omitted. */
  unitPrice?: number;
  /** ISO local datetime; defaults to now when omitted. */
  soldAt?: string;
};

/**
 * Period of a sales history query. `startDate` is inclusive and `endDate` is
 * exclusive (the backend query is `soldAt >= start AND soldAt < end`), and
 * both are required: the backend passes them straight into JPQL, so a missing
 * bound matches nothing instead of meaning "no limit".
 */
export type SalePeriod = {
  /** ISO local datetime */
  startDate: string;
  /** ISO local datetime */
  endDate: string;
};

export type SaleHistoryQuery = SalePeriod & { productId: number };
