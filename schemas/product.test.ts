import { describe, expect, it } from "vitest";
import { createProductSchema, parsePrice, toCreateProductRequest, type ProductFormValues } from "./product";

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
