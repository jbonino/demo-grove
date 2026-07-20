import { describe, expect, it } from "vitest";
import { normalizePhone } from "./phone.js";

describe("normalizePhone", () => {
  it("strips punctuation and whitespace, leaving only digits", () => {
    expect(normalizePhone("(906) 235-1626")).toBe("9062351626");
  });

  it("leaves an already-digits-only number unchanged", () => {
    expect(normalizePhone("9062351626")).toBe("9062351626");
  });

  it("keeps a leading plus sign so it still matches +1-prefixed stored numbers", () => {
    expect(normalizePhone("+1 (555) 123-4567")).toBe("+15551234567");
  });

  it("treats formatted and unformatted versions of the same number as equal", () => {
    expect(normalizePhone("(906) 235-1626")).toBe(normalizePhone("9062351626"));
  });
});
