# Architecture

## What this is

A single-player typing-speed test built on Next.js 15 (Pages Router) +
React 19, with Redux Toolkit for state and Tailwind CSS for styling. A
visitor types a stream of randomized words for a fixed time limit (15/30/60/120s) or word count (10-100) and sees live WPM / CPM / accuracy, then a result card. Optionally, a
result can be posted to an external stats API and a "/stats" page can show
a global leaderboard of past results — both gated behind an env var, so the
app works standalone with no backend.

## Routes (`pages/`)

| Route | File | Purpose |
|---|---|---|
| `/` | `pages/index.tsx` | Renders `TypingTest` — the main app. |
| `/stats` | `pages/stats/index.tsx` | "Your results" (`YourResults`: averages, personal bests, last 20 runs from localStorage history, Clear history) and, only if `NEXT_PUBLIC_API_BASE_URL` is set, "Global leaderboard" (`GlobalStats`). |
| `pages/_app.tsx` | — | Wraps every page in the Redux `<Provider>`, loads `Schibsted Grotesk` (UI) and `IBM Plex Mono` (typing area) fonts, and hydrates/persists `state.settings` after mount. |
| `pages/_document.tsx` | — | Sets `<Html lang="en">`. |

## Core flow: the typing test

The flow is **engine -> hook -> components**:

1. **Engine** (`utils/typingEngine.ts`, pure, no React): `engineReducer`
   is the keystroke state machine over `EngineState` (`words`, `typed`,
   `activeWordIndex`, `status`, keystroke counters) with actions `reset`,
   `typeChar`, `backspace`, `submitWord`, `finish`. Pure selectors
   `getLetterStates`, `isWordWrong`, `getWordCounts` derive display and
   stats. The reducer never mutates; unchanged `typed` entries keep identity.
2. **Hook** (`utils/hooks/useTypingEngine.ts`): wraps `useReducer`, resets
   when `words` changes, returns memoized action callbacks and
   `activeLetterIndex`. `useTimer` (timestamp-based countdown) and `useCaret`
   (ref-based caret positioning, plus 3-line translate scrolling of the
   words container; re-runs on resize and font load) are sibling hooks.
3. **Components**: `components/TypingTest.tsx` is the thin orchestrator. It
   loads words from Redux (`loadWords`/`refreshWords`), maps the visually hidden `<input>`'s events to engine actions
   (`onKeyDown` for Backspace/Space/Tab; printable characters and soft-keyboard
   backspace via `onInput`, so mobile keyboards work), starts the timer on
   the first printable character, and on `seconds === 0` dispatches `finish` and
   freezes `finalStats` from `calculateStats` (words mode instead finishes in the engine when the last word is completed). It renders `ConfigBar`, `LiveStat`,
   `TypingArea` (memoized `Word`s, `FocusOverlay`, `TypingAreaSkeleton` while loading, and the hidden input as children), a `LiveAnnouncer` live region, `useFocusMode` (fades chrome while running),
   `RestartButton`, and `ResultCard` once finished.

## State management (`redux/`)

Three slices, combined in `redux/store.ts`:

- **`paragraph`** (`redux/paragraph.ts`) — holds `wordsCollection: string[]`, the last `mode`/`options`, and a `round` counter (bumped by `loadWords`/`refreshWords`/`repeatWords`; Repeat keeps the words but starts a new round).
  `loadWords({ count, mode })` and `refreshWords()` both call
  `utils/getWords.ts`, which shuffles (Fisher-Yates) a word pool from
  `utils/wordBank.ts` (`easy`/`medium`/`hard`/`mixed`) and repeats it to
  reach the requested count.
- **`globalStats`** (`redux/stat.ts`, slice name `"stats"`, mounted at
  `state.globalStats`) — `getStatCall` (GET) and `addStatCall` (POST) are
  `createAsyncThunk`s hitting `${NEXT_PUBLIC_API_BASE_URL}/getStats/` and
  `/addStat/`. Both reject on non-2xx; `getStatCall` validates the body with
  `isStatsInstance` and is abortable (`GlobalStats` aborts on unmount).
  `isStatsApiEnabled` is the single env check. `addStatCall` is dispatched
  once per round from `utils/hooks/usePostResultOnFinish.ts` (called by
  `TypingTest`); the player name (`PlayerNameInput`, persisted at
  `speedtype:v1:settings`) is the posted `user`.
- **`settings`** (`redux/settings.ts`, `state.settings`) — `mode` (time/words), `timeLimit` (15/30/60/120), `wordCount` (10/25/50/100), `difficulty`, `punctuation`, `numbers`, `playerName`. `setSetting` (partial) / `hydrateSettings`. `redux/persistSettings.ts` loads (per-field validated) and saves (debounced 300ms + on `pagehide`) it at `speedtype:v1:settings`; `_app.tsx` wires both after mount.
- `redux/stat.ts` is covered by `redux/__tests__/stat.test.ts`.

## Utilities (`utils/`)

Top-level `utils/*.ts` files are pure and unit-tested (`utils/__tests__/`);
`utils/hooks/` holds the React hooks (`utils/hooks/__tests__/`). `storage.ts`
(`readJSON`/`writeJSON`, SSR- and quota-safe localStorage) and
`playerName.ts` (sanitize, max 20 chars) are also here.

| File | Purpose |
|---|---|
| `calculateStats.ts` | `calculateStats(state, elapsedMs)` -> net `wpm`, `rawWpm`, `cpm`, keystroke `accuracy`, correct/incorrect/extra/missed char counts. |
| `getWords.ts` | Builds a shuffled word list of a given length/difficulty from `wordBank.ts`, then applies optional punctuation/numbers (`applyWordOptions`, injectable `rng`). Exports `getWords`, `applyWordOptions`, `WordMode`, `WordOptions`. |
| `wordBank.ts` | Static word lists (`easyWords`/`mediumWords`/`hardWords`). |
| `history.ts`, `getGrade.ts`, `wpmSamples.ts` | Run history in `speedtype:v1:history` (newest 100, personal bests per mode+limit+difficulty); WPM-aware grade table; per-second chart samples. `hooks/useRecordResult.ts` appends the finished test once per round. |
| `typingEngine.ts` | Pure typing reducer + selectors (see Core flow). |
| `hooks/useTypingEngine.ts` | `useReducer` wrapper around the engine. |
| `hooks/useCaret.ts` | Caret positioned from a ref to the active letter; scrolls the words container by lines (3 visible); ResizeObserver + `document.fonts.ready`. |
| `hooks/useFocusMode.ts` | While a test runs, sets `data-focus-mode` on `<html>` so `[data-focus-fade]` chrome fades (CSS in `globals.css`); mouse move reveals it. |
| `motion.ts` | `prefersReducedMotion()` helper (caret transition, `RenderStat`). |
| `hooks/useTimer.ts` | Timer hook, `direction` `"down"` (time mode) or `"up"` (words mode) (100ms tick, derived from `performance.now()`): `start()`, `stop()`, `reset(newTimeout?)`, `seconds`, `elapsedSeconds`, `elapsedMs()`. Guards against double-start; cleans up its interval on unmount. |

## Components (`components/`)

| File | Status |
|---|---|
| `TypingTest.tsx` | Orchestrator, see above. |
| `TypingArea.tsx`, `Word.tsx`, `FocusOverlay.tsx` | Words rendering (memoized `Word`), caret host, click-to-focus overlay. |
| `SettingsPanel.tsx` | Settings UI (mode, time/word count, difficulty, punctuation, numbers) + player name; reads/writes `state.settings`; dimmed while running. |
| `LiveStatsPanel.tsx` | Live stats display: dark WPM tile with sparkline, plus grid of small tiles for accuracy/CPM/errors/words. |
| `Sparkline.tsx` | Inline-SVG mini chart of WPM over time (one point per second). |
| `TimerRow.tsx` | Timer label, progress bar, and goal text. |
| `icons.tsx` | Inline SVG icon components (RotateCcwIcon, ArrowRightIcon, MousePointerIcon). |
| `RestartButton.tsx` | Restart button. |
| `CapsLockAlert.tsx` | Active — shows a warning when Caps Lock is on while typing. |
| `ResultCard.tsx` | Active — shown after a test ends; two-column on `md+`: WPM/accuracy plus a details list (raw WPM, CPM, char counts, duration); uses `RenderStat.tsx`. |
| `YourResults.tsx` | `/stats` personal results from history. |
| `WpmChart.tsx` | Inline-SVG WPM / raw WPM line chart (+ mistake dots) on the result card; data from `utils/wpmSamples.ts`. |
| `LiveAnnouncer.tsx`, `TypingAreaSkeleton.tsx` | Visually hidden polite live region; loading placeholder lines. |
| `RenderStat.tsx` | Active — count-up animation for a single stat. |
| `GlobalStats.tsx` | Active — leaderboard list for `/stats`, handles the "API not configured" state. |
| `Layout.tsx` | Active — page shell: header with logo + Test/Stats nav, footer, default title, description and theme-color meta. |

## Types (`types/types.ts`)

Defines `RootState`/`AppDispatch` (standard RTK typed-hooks pattern),
`ParagraphState`, `StatState`, `StatsInstance`/`StatsInstancePayload`, the
literal-union status types `ParagraphStatus`/`StatStatus`, and the
`isStatsInstance` type guard used to validate API responses. Engine types
(`EngineState`, `LetterState`, …) live in `utils/typingEngine.ts`, settings
types in `redux/settings.ts`.

## Build & tooling

- Package manager: npm (`package-lock.json`; `yarn.lock` was removed).
- `tsconfig.json` has `"strict": true`.
- `.env.example` documents `NEXT_PUBLIC_API_BASE_URL`.
- `.github/workflows/ci.yml` runs lint → type-check → `test:coverage` →
  build on Node 20 and 22 (npm cache enabled).
- Coverage: `npm run test:coverage` (`@vitest/coverage-v8`) enforces 80%
  thresholds on `utils/**` and `redux/**` (`useCaret.ts` excluded — DOM
  layout, verified in a real browser instead).
- Lint: ESLint 9 flat config (`eslint.config.mjs`, `next/core-web-vitals` +
  `next/typescript` via `FlatCompat`, `eslint-config-next@15.5`); `npm run lint` = `eslint .`.
- Tests: Vitest 5 (`vitest.config.ts`, jsdom, `vitest.setup.ts` loads
  jest-dom matchers, globals on); tests live next to code in `__tests__/`.
- `tsconfig.json`: target ES2017, `moduleResolution: bundler`, vitest globals types.
- `next.config.mjs`: `reactStrictMode: true`, `poweredByHeader: false`.
- `.claude/helpers/graft-gate.cjs` (a `PreToolUse` hook) makes agents use
  graft instead of whole-file reads/greps on indexed source. See the graft
  protocol in `REFINEMENT_PLAN.md`.
- `.claude/helpers/graft-hooks.cjs` and `graft-statusline.cjs` are generated
  by `graft init` and called by the hooks/status line in
  `.claude/settings.json`, so keep them committed; deleting them makes every
  session's hooks error. Each has a `BAKED` constant holding the committer's
  graft install path (e.g. `/opt/homebrew/...` vs `/usr/local/...`). That is
  only a fast path, since the script falls back to `node_modules` and
  `npm root -g`, so a different local value works and should not be committed.
  To keep your local edit out of `git status`:
  ```bash
  git update-index --skip-worktree .claude/helpers/graft-hooks.cjs .claude/helpers/graft-statusline.cjs
  ```
  Undo with `--no-skip-worktree` before committing an intentional change
  (e.g. after `graft upgrade` / `graft init` rewrites them) or if a
  `git pull` complains about these files.

## Local storage keys

| Key | Owner | Shape |
|---|---|---|
| `speedtype:v1:settings` | `redux/persistSettings.ts` | `SettingsState` incl. `playerName` (validated per field on load) |
| `speedtype:v1:history` | `utils/history.ts` | newest 100 finished runs (`mode`, `limit`, `difficulty`, `wpm`, `rawWpm`, `accuracy`, `date`) |

Bump the `v1` segment if a shape changes incompatibly.
