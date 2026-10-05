import { readJSON, writeJSON, SETTINGS_KEY } from "../storage";

const isNum = (v: unknown): v is number => typeof v === "number";

describe("storage", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("round-trips a valid value", () => {
    writeJSON("k", 5);
    expect(readJSON("k", 0, isNum)).toBe(5);
  });

  it("returns fallback when missing, malformed or invalid", () => {
    expect(readJSON("missing", 1, isNum)).toBe(1);
    localStorage.setItem("k", "{oops");
    expect(readJSON("k", 2, isNum)).toBe(2);
    localStorage.setItem("k", '"str"');
    expect(readJSON("k", 3, isNum)).toBe(3);
  });

  it("does not throw when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    expect(readJSON("k", 9, isNum)).toBe(9);
    expect(() => writeJSON("k", 1)).not.toThrow();
  });

  it("uses the documented key", () => {
    expect(SETTINGS_KEY).toBe("speedtype:v1:settings");
  });
});
