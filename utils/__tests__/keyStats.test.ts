import { isKeyStat, summarizeKeyTimes } from "../keyStats";

describe("summarizeKeyTimes", () => {
  it("is null without samples", () => {
    expect(summarizeKeyTimes([])).toBeNull();
  });
  it("returns the mean and population standard deviation, rounded to 2 decimals", () => {
    expect(summarizeKeyTimes([100, 100, 100])).toEqual({ average: 100, sd: 0 });
    expect(summarizeKeyTimes([90, 110])).toEqual({ average: 100, sd: 10 });
    expect(summarizeKeyTimes([1, 2, 2])).toEqual({ average: 1.67, sd: 0.47 });
  });
});

describe("isKeyStat", () => {
  it("accepts { average, sd } numbers only", () => {
    expect(isKeyStat({ average: 1, sd: 0 })).toBe(true);
    expect(isKeyStat({ average: "1", sd: 0 })).toBe(false);
    expect(isKeyStat(null)).toBe(false);
  });
});
