import { isPlausibleWpm, MAX_PLAUSIBLE_WPM } from "./calculateStats";

/** Monkeytype's floors: shorter tests give WPM numbers too noisy to keep. */
export const MIN_TEST_WORDS = 10;
export const MIN_TEST_MS = 1000;

export type InvalidReason = "too-short" | "too-fast";

export interface ValidityInput {
  wpm: number;
  rawWpm: number;
  /** Words in the test (configured size, not words typed). */
  wordCount: number;
  elapsedMs: number;
}

export const INVALID_REASON_LABELS: Record<InvalidReason, string> = {
  "too-short": "Not saved: test too short",
  "too-fast": `Not saved: over ${MAX_PLAUSIBLE_WPM} WPM`,
};

/** Why a finished test must not be saved, posted or counted as a PB; `null` when it is valid. */
export function getInvalidReason({ wpm, rawWpm, wordCount, elapsedMs }: ValidityInput): InvalidReason | null {
  if (elapsedMs < MIN_TEST_MS || wordCount < MIN_TEST_WORDS) return "too-short";
  if (!isPlausibleWpm(wpm) || !isPlausibleWpm(rawWpm)) return "too-fast";
  return null;
}
