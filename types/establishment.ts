export const ESTABLISHMENT_CATEGORIES = ["BAKERY", "RESTAURANT", "MARKET", "SNACK_BAR"] as const;

export type EstablishmentCategory = (typeof ESTABLISHMENT_CATEGORIES)[number];

/** `password` is always `null` on the way out: the backend never returns it. */
export type EstablishmentDTO = {
  id: number;
  name: string;
  cnpj: string;
  address: string;
  category: EstablishmentCategory;
  email: string;
  password: null;
};

export type RegisterEstablishmentRequest = {
  name: string;
  cnpj: string;
  address: string;
  category: EstablishmentCategory;
  email: string;
  password: string;
};

/** Blank or omitted `password` keeps the current one. */
export type UpdateEstablishmentRequest = Omit<RegisterEstablishmentRequest, "password"> & {
  password?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type EstablishmentAuthResponse = {
  establishment: EstablishmentDTO;
  token: string;
};
