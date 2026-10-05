import { calculateWPM } from "../calculateWPM";

describe("calculateWPM", () => {
  it("returns 20 for 50 chars in 30s of a 60s test", () => {
    expect(calculateWPM(50, 30, 60)).toBe(20);
  });
});
