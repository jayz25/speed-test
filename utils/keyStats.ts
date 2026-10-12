/** Mean and population standard deviation of keystroke timings, in ms. */
export interface KeyStat {
  average: number;
  sd: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function summarizeKeyTimes(values: readonly number[]): KeyStat | null {
  if (values.length === 0) return null;
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - average) ** 2, 0) / values.length;
  return { average: round2(average), sd: round2(Math.sqrt(variance)) };
}

export const isKeyStat = (v: unknown): v is KeyStat =>
  typeof v === "object" && v !== null &&
  typeof (v as Record<string, unknown>).average === "number" &&
  typeof (v as Record<string, unknown>).sd === "number";
