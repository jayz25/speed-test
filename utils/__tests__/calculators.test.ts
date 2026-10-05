import { calculateAccuracy } from "../calculateAccuracy";
import { calculateCPM } from "../calculateCPM";
import { calculateWPM } from "../calculateWPM";

describe("calculateWPM", () => {
  it("returns 20 for 50 chars in 30s of a 60s test", () => {
    expect(calculateWPM(50, 30, 60)).toBe(20);
  });
  it("returns 0 when no time has elapsed", () => {
    expect(calculateWPM(50, 60, 60)).toBe(0);
  });
  it("returns 0 when elapsed is negative", () => {
    expect(calculateWPM(50, 70, 60)).toBe(0);
  });
  it("returns 0 when zero characters were matched", () => {
    expect(calculateWPM(0, 30, 60)).toBe(0);
  });
});

describe("calculateCPM", () => {
  it("returns 100 for 50 chars in 30 elapsed seconds", () => {
    expect(calculateCPM(50, 30, 60)).toBe(100);
  });
  it("returns 0 when no time has elapsed", () => {
    expect(calculateCPM(50, 60, 60)).toBe(0);
  });
  it("returns 0 when zero characters were matched", () => {
    expect(calculateCPM(0, 10, 60)).toBe(0);
  });
});

describe("calculateAccuracy", () => {
  it("returns 0 when no words were submitted", () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });
  it("returns 100 when all words match", () => {
    expect(calculateAccuracy(0, 10)).toBe(100);
  });
  it("returns 0 when no words match", () => {
    expect(calculateAccuracy(5, 0)).toBe(0);
  });
  it("rounds to the nearest integer", () => {
    expect(calculateAccuracy(1, 2)).toBe(67);
  });
});
