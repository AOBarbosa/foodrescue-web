import { describe, expect, it } from "vitest";
import {
  createProductSchema,
  inventoryUpdateSchema,
  parsePrice,
  toCreateProductRequest,
  toUpdateInventoryRequest,
  type ProductFormValues,
} from "./product";

const valid: ProductFormValues = {
  name: "Pão de forma integral",
  category: "Padaria",
  originalPrice: "9,90",
  photoUrl: "",
};

function messages(values: ProductFormValues) {
  const result = createProductSchema.safeParse(values);
  return Object.fromEntries((result.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));
}

describe("parsePrice", () => {
  it.each([
    ["9,90", 9.9],
    ["9.90", 9.9],
    ["10", 10],
    ["1.234,50", 1234.5],
    ["-1", -1],
  ])("parses %s", (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(["", "abc", "9,999", "1,2,3"])("rejects %s", (input) => {
    expect(parsePrice(input)).toBeNull();
  });
});

describe("createProductSchema", () => {
  it("accepts a valid product, with or without photo", () => {
    expect(messages(valid)).toEqual({});
    expect(messages({ ...valid, photoUrl: "https://example.com/pao.jpg" })).toEqual({});
  });

  it("requires name, category and price", () => {
    expect(messages({ name: "", category: " ", originalPrice: "", photoUrl: "" })).toEqual({
      name: "Informe o nome do produto.",
      category: "Informe a categoria.",
      originalPrice: "Informe o preço.",
    });
  });

  it.each(["0", "0,00", "-5"])("rejects price %s (must be > 0)", (price) => {
    expect(messages({ ...valid, originalPrice: price })).toEqual({
      originalPrice: "O preço deve ser maior que zero.",
    });
  });

  it("rejects a non-numeric price and an invalid photo URL", () => {
    expect(messages({ ...valid, originalPrice: "dez", photoUrl: "not a url" })).toEqual({
      originalPrice: "Informe um valor como 9,90.",
      photoUrl: "Informe um endereço (URL) válido.",
    });
  });
});

describe("toCreateProductRequest", () => {
  it("converts the price and omits an empty photo", () => {
    expect(toCreateProductRequest(valid)).toEqual({
      name: "Pão de forma integral",
      category: "Padaria",
      originalPrice: 9.9,
    });
  });
});

describe("inventoryUpdateSchema", () => {
  const issues = (values: { stockQuantity: string; expirationDate: string }) =>
    Object.fromEntries(
      (inventoryUpdateSchema.safeParse(values).error?.issues ?? []).map((i) => [i.path.join("."), i.message]),
    );

  it("accepts stock only, date only, or both", () => {
    expect(issues({ stockQuantity: "0", expirationDate: "" })).toEqual({});
    expect(issues({ stockQuantity: "", expirationDate: "2026-10-01" })).toEqual({});
    expect(issues({ stockQuantity: "7", expirationDate: "2026-10-01" })).toEqual({});
  });

  it("accepts a past expiration date (the backend only warns)", () => {
    expect(issues({ stockQuantity: "", expirationDate: "2020-01-01" })).toEqual({});
  });

  it("rejects an empty update", () => {
    expect(issues({ stockQuantity: "", expirationDate: "" })).toEqual({
      stockQuantity: "Informe o estoque, a validade ou ambos.",
    });
  });

  it("rejects a negative or fractional stock", () => {
    expect(issues({ stockQuantity: "-1", expirationDate: "" })).toEqual({
      stockQuantity: "O estoque não pode ser negativo.",
    });
    expect(issues({ stockQuantity: "1.5", expirationDate: "" })).toEqual({
      stockQuantity: "Informe um número inteiro.",
    });
  });
});

describe("toUpdateInventoryRequest", () => {
  it("sends only the informed fields", () => {
    expect(toUpdateInventoryRequest({ stockQuantity: "5", expirationDate: "" })).toEqual({ stockQuantity: 5 });
    expect(toUpdateInventoryRequest({ stockQuantity: "", expirationDate: "2026-10-01" })).toEqual({
      expirationDate: "2026-10-01",
    });
  });
});
