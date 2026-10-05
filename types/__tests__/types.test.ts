import { isStatsInstance } from "../types";

const valid = { id: 1, user: "a", words_per_minute: 50, characters_per_minute: 250, accuracy: 95 };

describe("isStatsInstance", () => {
  it("accepts a well-formed record", () => {
    expect(isStatsInstance(valid)).toBe(true);
  });

  it("rejects non-objects and null", () => {
    expect(isStatsInstance(null)).toBe(false);
    expect(isStatsInstance("x")).toBe(false);
    expect(isStatsInstance(42)).toBe(false);
  });

  it("rejects records with missing or mistyped fields", () => {
    expect(isStatsInstance({ ...valid, id: "1" })).toBe(false);
    expect(isStatsInstance({ ...valid, user: undefined })).toBe(false);
    expect(isStatsInstance({ ...valid, accuracy: null })).toBe(false);
  });
});
