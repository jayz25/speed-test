import type { TestMode } from "../redux/settings";
import type { WordMode } from "./getWords";
import { QUOTE_LENGTHS, type QuoteLength } from "./quotes";
import { HISTORY_KEY, readJSON, writeJSON } from "./storage";

export const MAX_HISTORY_ENTRIES = 100;
const MODES: readonly string[] = ["time", "words", "quote"];
const DIFFICULTIES: readonly string[] = ["easy", "medium", "hard", "mixed"];

export interface HistoryEntry {
  id: string;
  /** ISO 8601 */
  date: string;
  mode: TestMode;
  /** seconds (time mode), word count (words mode) or quote length tier, 1-3 (quote mode; see `quoteLimit`) */
  limit: number;
  difficulty: WordMode;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}

/** History `limit` for a quote run: the 1-based index of its length tier (short=1, medium=2, long=3). */
export const quoteLimit = (length: QuoteLength): number => QUOTE_LENGTHS.indexOf(length) + 1;

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

/** "30s mixed" (time mode), "25 words hard" (words mode) or "quote · medium" (quote mode). */
export function formatConfig(key: TestConfigKey): string {
  if (key.mode === "quote") return `quote \u00b7 ${QUOTE_LENGTHS[key.limit - 1] ?? key.limit}`;
  const length = key.mode === "time" ? `${key.limit}s` : `${key.limit} words`;
  return `${length} ${key.difficulty}`;
}

export interface PersonalBestRow extends TestConfigKey {
  wpm: number;
  /** accuracy of the run that set the best */
  accuracy: number;
  runs: number;
}

/** One row per mode+limit+difficulty: time, words, then quote mode, then by limit, then difficulty. */
export function getPersonalBests(history: readonly HistoryEntry[]): PersonalBestRow[] {
  const rows: PersonalBestRow[] = [];
  for (const h of history) {
    const i = rows.findIndex((r) => isSameConfig(r, h));
    if (i === -1) {
      rows.push({ mode: h.mode, limit: h.limit, difficulty: h.difficulty, wpm: h.wpm, accuracy: h.accuracy, runs: 1 });
    } else {
      const row = rows[i];
      rows[i] = { ...row, runs: row.runs + 1, ...(h.wpm > row.wpm ? { wpm: h.wpm, accuracy: h.accuracy } : {}) };
    }
  }
  const order = (r: PersonalBestRow) => [MODES.indexOf(r.mode), r.limit, DIFFICULTIES.indexOf(r.difficulty)];
  return rows.sort((a, b) => {
    const [oa, ob] = [order(a), order(b)];
    return oa[0] - ob[0] || oa[1] - ob[1] || oa[2] - ob[2];
  });
}

/** Rounded average WPM and accuracy over all entries (zeros when empty). */
export function getAverages(history: readonly HistoryEntry[]): { wpm: number; accuracy: number } {
  if (history.length === 0) return { wpm: 0, accuracy: 0 };
  const mean = (pick: (h: HistoryEntry) => number) => Math.round(history.reduce((sum, h) => sum + pick(h), 0) / history.length);
  return { wpm: mean((h) => h.wpm), accuracy: mean((h) => h.accuracy) };
}

/** The newest `count` entries, newest first. */
export function getRecent(history: readonly HistoryEntry[], count: number): HistoryEntry[] {
  return history.slice(-count).reverse();
}
