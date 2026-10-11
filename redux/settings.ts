import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WordMode } from "../utils/getWords";

export type TestMode = "time" | "words";

export const TIME_LIMITS = [15, 30, 60, 120] as const;
export const WORD_COUNTS = [10, 25, 50, 100] as const;
export const DIFFICULTIES = ["easy", "medium", "hard", "mixed"] as const;
export const TEST_MODES = ["time", "words"] as const;

export interface SettingsState {
  mode: TestMode;
  timeLimit: (typeof TIME_LIMITS)[number];
  wordCount: (typeof WORD_COUNTS)[number];
  difficulty: WordMode;
  punctuation: boolean;
  numbers: boolean;
  /** Raw (unsanitized) name; sanitize with `sanitizePlayerName` before use. */
  playerName: string;
}

export const DEFAULT_SETTINGS: SettingsState = {
  mode: "time",
  timeLimit: 30,
  wordCount: 25,
  difficulty: "mixed",
  punctuation: false,
  numbers: false,
  playerName: "",
};

const oneOf = <T extends readonly unknown[]>(options: T, v: unknown, fallback: T[number]): T[number] =>
  options.includes(v) ? (v as T[number]) : fallback;

/** Validates an untrusted value field by field, falling back to defaults on mismatch. */
export function sanitizeSettings(raw: unknown): SettingsState {
  if (typeof raw !== "object" || raw === null) return DEFAULT_SETTINGS;
  const o = raw as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    mode: oneOf(TEST_MODES, o.mode, d.mode),
    timeLimit: oneOf(TIME_LIMITS, o.timeLimit, d.timeLimit),
    wordCount: oneOf(WORD_COUNTS, o.wordCount, d.wordCount),
    difficulty: oneOf(DIFFICULTIES, o.difficulty, d.difficulty),
    punctuation: typeof o.punctuation === "boolean" ? o.punctuation : d.punctuation,
    numbers: typeof o.numbers === "boolean" ? o.numbers : d.numbers,
    playerName: typeof o.playerName === "string" ? o.playerName : d.playerName,
  };
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: DEFAULT_SETTINGS,
  reducers: {
    setSetting: (state, action: PayloadAction<Partial<SettingsState>>) => ({ ...state, ...action.payload }),
    hydrateSettings: (_state, action: PayloadAction<SettingsState>) => action.payload,
  },
});

export const { setSetting, hydrateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
