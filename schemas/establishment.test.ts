import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerEstablishmentSchema,
  toRegisterEstablishmentRequest,
  toUpdateEstablishmentRequest,
  updateEstablishmentSchema,
  type EstablishmentFormValues,
} from "./establishment";

const valid: EstablishmentFormValues = {
  name: "Padaria Pão Quente",
  cnpj: "11.222.333/0001-81",
  address: "Rua das Flores, 123",
  category: "BAKERY",
  email: "contato@paoquente.com",
  password: "secret",
};

function fieldErrors(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return Object.fromEntries((result.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));
}

describe("registerEstablishmentSchema", () => {
  it("accepts a valid establishment", () => {
    expect(registerEstablishmentSchema.safeParse(valid).success).toBe(true);
  });

  it("requires every field, including the password", () => {
    const result = registerEstablishmentSchema.safeParse({
      name: " ",
      cnpj: "",
      address: "",
      category: "",
      email: "",
      password: "",
    });

    expect(fieldErrors(result)).toEqual({
      name: "Informe o nome do estabelecimento.",
      cnpj: "Informe o CNPJ.",
      address: "Informe o endereço.",
      category: "Selecione a categoria.",
      email: "Informe o e-mail.",
      password: "Informe a senha.",
    });
  });

  it("rejects an invalid CNPJ (check digits)", () => {
    const result = registerEstablishmentSchema.safeParse({ ...valid, cnpj: "11.222.333/0001-82" });

    expect(fieldErrors(result)).toEqual({ cnpj: "CNPJ inválido." });
  });

  it("rejects an invalid e-mail and an unknown category", () => {
    const result = registerEstablishmentSchema.safeParse({ ...valid, email: "nope", category: "BAR" });

    expect(fieldErrors(result)).toEqual({ email: "E-mail inválido.", category: "Selecione a categoria." });
  });
});

describe("updateEstablishmentSchema", () => {
  it("allows a blank password (keeps the current one)", () => {
    expect(updateEstablishmentSchema.safeParse({ ...valid, password: "" }).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires e-mail and password", () => {
    expect(fieldErrors(loginSchema.safeParse({ email: "", password: "" }))).toEqual({
      email: "Informe o e-mail.",
      password: "Informe a senha.",
    });
  });
});

describe("request mappers", () => {
  it("sends the CNPJ without mask on register", () => {
    expect(toRegisterEstablishmentRequest(valid)).toEqual({ ...valid, cnpj: "11222333000181" });
  });

  it("omits a blank password on update", () => {
    const request = toUpdateEstablishmentRequest({ ...valid, password: "  " });

    expect(request).not.toHaveProperty("password");
    expect(request.cnpj).toBe("11222333000181");
  });

  it("sends a new password on update when informed", () => {
    expect(toUpdateEstablishmentRequest({ ...valid, password: "new-pass" }).password).toBe("new-pass");
  });
});
