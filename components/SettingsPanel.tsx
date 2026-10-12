"use client";

import { useDispatch, useSelector } from "react-redux";
import { isStatsApiEnabled } from "../redux/stat";
import {
  DIFFICULTIES, SettingsState, setSetting, TEST_MODES, TIME_LIMITS, WORD_COUNTS,
} from "../redux/settings";
import { QUOTE_LENGTHS } from "../utils/quotes";
import type { AppDispatch, RootState } from "../types/types";
import { usePlayerName } from "../utils/hooks/usePlayerName";
import PlayerNameInput from "./PlayerNameInput";

const DEFAULT_TIME_LIMIT = 30;
const DEFAULT_WORD_COUNT = 25;

const LABEL = "text-xs font-semibold uppercase tracking-[0.08em] text-muted";
const FOCUS = "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent";
const titleCase = (v: string | number) => { const s = String(v); return s.charAt(0).toUpperCase() + s.slice(1); };
const OPTION_BASE = `min-h-[44px] text-sm transition-colors duration-200 ${FOCUS}`;

interface OptionGroupProps<T extends string | number> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (v: T) => string;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className={LABEL}>{title}</span>
      {children}
    </div>
  );
}

function SegmentedGroup<T extends string | number>({ label, options, value, onChange, format = titleCase, columns = "grid-cols-2" }: OptionGroupProps<T> & { columns?: string }) {
  return (
    <div role="group" aria-label={label} className={`grid ${columns} gap-1 rounded-xl bg-surface-sunken p-1`}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`${OPTION_BASE} rounded-[9px] ${value === o ? "bg-ink font-semibold text-on-ink" : "font-medium text-ink-2"}`}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}

function ChoiceGrid<T extends string | number>({
  label, options, value, onChange, format = titleCase, columns, mono = false,
}: OptionGroupProps<T> & { columns: string; mono?: boolean }) {
  return (
    <div role="group" aria-label={label} className={`grid ${columns} gap-1 ${mono ? "font-mono" : ""}`}>
      {options.map((o) => {
        const isActive = value === o;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(o)}
            className={`${OPTION_BASE} rounded-[10px] border text-ink ${
              isActive ? "border-accent bg-accent-soft font-semibold" : "border-border bg-surface font-normal"
            }`}
          >
            {format(o)}
          </button>
        );
      })}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 text-[15px] text-ink">
      {label}
      <input type="checkbox" checked={checked} onChange={onChange} className={`m-0 h-5 w-5 accent-ink ${FOCUS}`} />
    </label>
  );
}

/** Test configuration (mode, length, difficulty, punctuation, numbers) and the player name. */
export default function SettingsPanel({ isDimmed }: { isDimmed: boolean }) {
  const dispatch = useDispatch<AppDispatch>();
  const { mode, timeLimit, wordCount, difficulty, quoteLength, punctuation, numbers } = useSelector((state: RootState) => state.settings);
  const [playerName, setPlayerName] = usePlayerName();
  const update = (patch: Partial<SettingsState>) => dispatch(setSetting(patch));
  const pickMode = (m: SettingsState["mode"]) => {
    if (m === mode) return; // keep the chosen size when re-clicking the active mode
    if (m === "quote") update({ mode: m });
    else update(m === "time" ? { mode: m, timeLimit: DEFAULT_TIME_LIMIT } : { mode: m, wordCount: DEFAULT_WORD_COUNT });
  };

  return (
    <aside
      aria-label="Test settings"
      className={`flex basis-[220px] grow shrink max-w-[260px] flex-col gap-6 rounded-card bg-surface-muted p-6 transition-opacity duration-300 ${isDimmed ? "opacity-55" : ""}`}
    >
      <Group title="Mode">
        <SegmentedGroup label="Test mode" options={TEST_MODES} value={mode} onChange={pickMode} columns="grid-cols-3" />
      </Group>
      {mode === "time" && (
        <Group title="Duration (seconds)">
          <ChoiceGrid label="Time limit" options={TIME_LIMITS} value={timeLimit} onChange={(v) => update({ timeLimit: v })} columns="grid-cols-4" mono />
        </Group>
      )}
      {mode === "words" && (
        <Group title="Length (words)">
          <ChoiceGrid label="Word count" options={WORD_COUNTS} value={wordCount} onChange={(v) => update({ wordCount: v })} columns="grid-cols-4" mono />
        </Group>
      )}
      {mode === "quote" && (
        <Group title="Length">
          <ChoiceGrid label="Quote length" options={QUOTE_LENGTHS} value={quoteLength} onChange={(v) => update({ quoteLength: v })} columns="grid-cols-3" />
        </Group>
      )}
      {mode !== "quote" && (
        <>
          <Group title="Difficulty">
            <ChoiceGrid label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={(v) => update({ difficulty: v })} columns="grid-cols-2" />
          </Group>
          <div className="flex flex-col gap-1.5">
            <span className={LABEL}>Include</span>
            <Checkbox label="Punctuation" checked={punctuation} onChange={() => update({ punctuation: !punctuation })} />
            <Checkbox label="Numbers" checked={numbers} onChange={() => update({ numbers: !numbers })} />
          </div>
        </>
      )}
      {isStatsApiEnabled && <PlayerNameInput value={playerName} onChange={setPlayerName} />}
    </aside>
  );
}
