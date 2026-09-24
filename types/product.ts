export type ProductDTO = {
  id: number;
  name: string;
  /** Free text, not an enum. */
  category: string;
  originalPrice: number;
  /** Defaults to `originalPrice`; set by the backend only. */
  currentPrice: number;
  photoUrl: string | null;
  stockQuantity: number;
  /** `yyyy-MM-dd` */
  expirationDate: string | null;
  establishmentId: number;
  /** ISO local datetime */
  modificationDate: string | null;
};

export type CreateProductRequest = {
  name: string;
  category: string;
  originalPrice: number;
  photoUrl?: string;
};

/** At least one of the two fields must be present. */
export type UpdateInventoryRequest = {
  stockQuantity?: number;
  /** `yyyy-MM-dd` */
  expirationDate?: string;
};

export type UpdateInventoryResponse = {
  product: ProductDTO;
  /** Not an error: the backend saves it and only flags it. */
  expirationDateInPast: boolean;
};
