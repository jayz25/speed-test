import type { TestMode } from "../redux/settings";
import type { WordMode } from "./getWords";
import { HISTORY_KEY, readJSON, writeJSON } from "./storage";

export const MAX_HISTORY_ENTRIES = 100;
const MODES: readonly string[] = ["time", "words"];
const DIFFICULTIES: readonly string[] = ["easy", "medium", "hard", "mixed"];

export interface HistoryEntry {
  id: string;
  /** ISO 8601 */
  date: string;
  mode: TestMode;
  /** seconds (time mode) or word count (words mode) */
  limit: number;
  difficulty: WordMode;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}

/** What identifies a personal-best bucket. */
export type TestConfigKey = Pick<HistoryEntry, "mode" | "limit" | "difficulty">;

export const isHistoryEntry = (v: unknown): v is HistoryEntry => {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.date === "string" &&
    typeof o.mode === "string" && MODES.includes(o.mode) &&
    typeof o.difficulty === "string" && DIFFICULTIES.includes(o.difficulty) &&
    typeof o.limit === "number" &&
    typeof o.wpm === "number" &&
    typeof o.rawWpm === "number" &&
    typeof o.accuracy === "number"
  );
};

const isHistoryArray = (v: unknown): v is unknown[] => Array.isArray(v);

/** Stored history, oldest first; invalid entries are dropped. */
export function loadHistory(): HistoryEntry[] {
  return readJSON<unknown[]>(HISTORY_KEY, [], isHistoryArray).filter(isHistoryEntry);
}

/** Returns a new list with `entry` appended, keeping only the newest `MAX_HISTORY_ENTRIES`. */
export function appendEntry(history: readonly HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [...history, entry].slice(-MAX_HISTORY_ENTRIES);
}

export function saveHistory(history: readonly HistoryEntry[]): void {
  writeJSON(HISTORY_KEY, history);
}

export function clearHistory(): void {
  writeJSON(HISTORY_KEY, []);
}

export const isSameConfig = (a: TestConfigKey, b: TestConfigKey) =>
  a.mode === b.mode && a.limit === b.limit && a.difficulty === b.difficulty;

/** Highest WPM for the same mode + limit + difficulty, or null when there is none. */
export function getPersonalBest(history: readonly HistoryEntry[], key: TestConfigKey): number | null {
  const matches = history.filter((h) => isSameConfig(h, key));
  return matches.length === 0 ? null : Math.max(...matches.map((h) => h.wpm));
}

export interface PbDescription {
  isNew: boolean;
  label: string;
}

const MINUS = "−";

/** "New personal best!" or "PB: 87 wpm (-3)" given the best before this run. */
export function describePb(wpm: number, previousBest: number | null): PbDescription {
  if (previousBest === null || wpm > previousBest) return { isNew: true, label: "New personal best!" };
  const diff = wpm - previousBest;
  const sign = diff === 0 ? "+" : MINUS;
  return { isNew: false, label: `PB: ${previousBest} wpm (${sign}${Math.abs(diff)})` };
}

export function createHistoryEntry(key: TestConfigKey, stats: { wpm: number; rawWpm: number; accuracy: number }, now = new Date()): HistoryEntry {
  return {
    id: `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    date: now.toISOString(),
    ...key,
    wpm: stats.wpm,
    rawWpm: stats.rawWpm,
    accuracy: stats.accuracy,
  };
}
