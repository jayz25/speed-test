import { getGrade, GRADE_THRESHOLDS } from "../getGrade";

describe("getGrade", () => {
  it.each([
    [80, 97, "S"],
    [120, 100, "S"],
    [79, 99, "A"],
    [80, 96, "A"],
    [60, 94, "A"],
    [60, 93, "B"],
    [40, 90, "B"],
    [59, 89, "C"],
    [40, 89, "C"],
    [25, 0, "C"],
    [24, 100, "D"],
    [0, 100, "D"],
  ] as const)("%i wpm at %i%% accuracy is %s", (wpm, acc, grade) => {
    expect(getGrade(wpm, acc)).toBe(grade);
  });

  it("keeps thresholds ordered from best to worst", () => {
    const wpms = GRADE_THRESHOLDS.map((t) => t.minWpm);
    expect([...wpms].sort((a, b) => b - a)).toEqual(wpms);
  });
});
