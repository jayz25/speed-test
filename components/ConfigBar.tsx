"use client";

import { useDispatch, useSelector } from "react-redux";
import { isStatsApiEnabled } from "../redux/stat";
import {
  DIFFICULTIES, SettingsState, setSetting, TEST_MODES, TIME_LIMITS, WORD_COUNTS,
} from "../redux/settings";
import type { AppDispatch, RootState } from "../types/types";
import { usePlayerName } from "../utils/hooks/usePlayerName";
import PlayerNameInput from "./PlayerNameInput";

interface PillOption<T> {
  value: T;
  label: string;
}

interface PillGroupProps<T> {
  label: string;
  options: readonly PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const PILL_BASE =
  "px-3 py-1 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523]";
const pillClass = (isActive: boolean) =>
  `${PILL_BASE} ${isActive ? "bg-[#FFD523] text-black" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`;

function PillGroup<T extends string | number>({ label, options, value, onChange }: PillGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex bg-white/5 rounded-lg p-1 text-sm font-medium border border-white/5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-config-btn="true"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={pillClass(value === o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const toOptions = <T extends string | number>(values: readonly T[], format: (v: T) => string = String): PillOption<T>[] =>
  values.map((v) => ({ value: v, label: format(v) }));

const MODE_OPTIONS = toOptions(TEST_MODES);
const TIME_OPTIONS = toOptions(TIME_LIMITS, (s) => `${s}s`);
const WORD_OPTIONS = toOptions(WORD_COUNTS);
const DIFFICULTY_OPTIONS = toOptions(DIFFICULTIES);

/** Test configuration pills (mode, length, difficulty, punctuation, numbers) and the player name. */
export default function ConfigBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { mode, timeLimit, wordCount, difficulty, punctuation, numbers } = useSelector((state: RootState) => state.settings);
  const [playerName, setPlayerName] = usePlayerName();
  const update = (patch: Partial<SettingsState>) => dispatch(setSetting(patch));

  return (
    <div data-focus-fade className="flex flex-wrap items-center justify-center gap-3 w-full transition-opacity duration-300">
      <PillGroup label="Test mode" options={MODE_OPTIONS} value={mode} onChange={(v) => update({ mode: v })} />
      {mode === "time" ? (
        <PillGroup label="Time limit" options={TIME_OPTIONS} value={timeLimit} onChange={(v) => update({ timeLimit: v })} />
      ) : (
        <PillGroup label="Word count" options={WORD_OPTIONS} value={wordCount} onChange={(v) => update({ wordCount: v })} />
      )}
      <PillGroup label="Difficulty" options={DIFFICULTY_OPTIONS} value={difficulty} onChange={(v) => update({ difficulty: v })} />
      <div className="flex gap-1 text-sm font-medium">
        <button type="button" data-config-btn="true" aria-pressed={punctuation} onClick={() => update({ punctuation: !punctuation })} className={`rounded-lg border border-white/5 bg-white/5 ${pillClass(punctuation)}`}>
          @ punctuation
        </button>
        <button type="button" data-config-btn="true" aria-pressed={numbers} onClick={() => update({ numbers: !numbers })} className={`rounded-lg border border-white/5 bg-white/5 ${pillClass(numbers)}`}>
          # numbers
        </button>
      </div>
      {isStatsApiEnabled && <PlayerNameInput value={playerName} onChange={setPlayerName} />}
    </div>
  );
}
