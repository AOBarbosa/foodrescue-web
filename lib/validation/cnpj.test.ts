import { describe, expect, it } from "vitest";
import { formatCnpj, isValidCnpj, onlyDigits } from "./cnpj";

describe("isValidCnpj", () => {
  it.each(["11222333000181", "11.222.333/0001-81", "45.723.174/0001-10"])("accepts %s", (cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(true);
  });

  it.each([
    ["wrong check digits", "11222333000182"],
    ["too short", "1122233300018"],
    ["too long", "112223330001811"],
    ["repeated digits", "00000000000000"],
    ["repeated digits, masked", "11.111.111/1111-11"],
    ["empty", ""],
  ])("rejects %s", (_, cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(false);
  });
});

describe("formatCnpj", () => {
  it("masks progressively while typing", () => {
    expect(formatCnpj("11")).toBe("11");
    expect(formatCnpj("11222")).toBe("11.222");
    expect(formatCnpj("11222333")).toBe("11.222.333");
    expect(formatCnpj("112223330001")).toBe("11.222.333/0001");
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("ignores non-digits and extra digits", () => {
    expect(formatCnpj("11a222b333/0001-8199")).toBe("11.222.333/0001-81");
  });
});

describe("onlyDigits", () => {
  it("strips the mask", () => {
    expect(onlyDigits("11.222.333/0001-81")).toBe("11222333000181");
  });
});
