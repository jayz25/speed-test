export type Grade = "S" | "A" | "B" | "C" | "D";

interface GradeThreshold {
  grade: Exclude<Grade, "D">;
  minWpm: number;
  minAccuracy: number;
}

/** Checked top to bottom; the first row met wins, otherwise "D". */
export const GRADE_THRESHOLDS: readonly GradeThreshold[] = [
  { grade: "S", minWpm: 80, minAccuracy: 97 },
  { grade: "A", minWpm: 60, minAccuracy: 94 },
  { grade: "B", minWpm: 40, minAccuracy: 90 },
  { grade: "C", minWpm: 25, minAccuracy: 0 },
];

export function getGrade(wpm: number, accuracy: number): Grade {
  const match = GRADE_THRESHOLDS.find((t) => wpm >= t.minWpm && accuracy >= t.minAccuracy);
  return match?.grade ?? "D";
}
