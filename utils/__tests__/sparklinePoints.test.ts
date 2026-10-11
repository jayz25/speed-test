import { sparklinePoints } from "../sparklinePoints";

describe("sparklinePoints", () => {
  it("returns an empty string for no values", () => {
    expect(sparklinePoints([], 220, 56)).toBe("");
  });

  it("draws a flat line across the width for a single value", () => {
    expect(sparklinePoints([20], 220, 56)).toBe("0,28 220,28");
  });

  it("spreads points evenly and scales against a minimum max of 40", () => {
    expect(sparklinePoints([0, 40], 220, 56)).toBe("0,52 220,4");
  });

  it("scales to the largest value when it exceeds 40", () => {
    expect(sparklinePoints([0, 50, 100], 220, 56)).toBe("0,52 110,28 220,4");
  });
});
