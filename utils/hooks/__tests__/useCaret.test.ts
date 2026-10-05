import { getLineScrollOffset } from "../useCaret";

describe("getLineScrollOffset", () => {
  it("does not scroll on the first two lines", () => {
    expect(getLineScrollOffset(0, 50)).toBe(0);
    expect(getLineScrollOffset(1, 50)).toBe(0);
  });
  it("keeps the active line in the middle from line 3 onwards", () => {
    expect(getLineScrollOffset(2, 50)).toBe(-50);
    expect(getLineScrollOffset(5, 50)).toBe(-200);
  });
  it("does nothing when the line pitch is unmeasurable", () => {
    expect(getLineScrollOffset(4, 0)).toBe(0);
  });
});
