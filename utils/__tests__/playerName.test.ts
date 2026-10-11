import { sanitizePlayerName } from "../playerName";

describe("sanitizePlayerName", () => {
  it("trims whitespace", () => expect(sanitizePlayerName("  Ann  ")).toBe("Ann"));
  it("defaults to Anonymous when empty", () => expect(sanitizePlayerName("   ")).toBe("Anonymous"));
  it("caps at 20 chars", () => expect(sanitizePlayerName("x".repeat(30))).toBe("x".repeat(20)));
});
