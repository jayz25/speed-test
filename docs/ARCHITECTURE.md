# Architecture

## What this is

A single-player typing-speed test built on Next.js 15 (Pages Router) +
React 19, with Redux Toolkit for state and Tailwind CSS for styling. A
visitor types a stream of randomized words for a fixed time limit (15/30/45/
60s) and sees live WPM / CPM / accuracy, then a result card. Optionally, a
result can be posted to an external stats API and a "/stats" page can show
a global leaderboard of past results — both gated behind an env var, so the
app works standalone with no backend.

## Routes (`pages/`)

| Route | File | Purpose |
|---|---|---|
| `/` | `pages/index.tsx` | Renders `TypingTest` — the main app. |
| `/stats` | `pages/stats/index.tsx` | Renders `GlobalStats` — leaderboard, only populated if `NEXT_PUBLIC_API_BASE_URL` is set. Not linked from any navigation yet (see `REFINEMENT_PLAN.md` 6.1). |
| `pages/_app.tsx` | — | Wraps every page in the Redux `<Provider>` and loads the `Inter` font. |

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
   freezes `finalStats` from `calculateStats`. It renders `TimerOptions`, `LiveStat`,
   `TypingArea` (memoized `Word`s, `FocusOverlay`, `TypingAreaSkeleton` while loading, and the hidden input as children), a `LiveAnnouncer` live region, `useFocusMode` (fades chrome while running),
   `RestartButton`, and `ResultCard` once finished.

## State management (`redux/`)

Two slices, combined in `redux/store.ts`:

- **`paragraph`** (`redux/paragraph.ts`) — holds `wordsCollection: string[]`.
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

All pure, side-effect-free, and small — good unit-test candidates (none
have tests yet; see `REFINEMENT_PLAN.md` Phase 4). The older DOM helpers
and small stat helpers were deleted in Phase 1.

| File | Purpose |
|---|---|
| `calculateStats.ts` | `calculateStats(state, elapsedMs)` -> net `wpm`, `rawWpm`, `cpm`, keystroke `accuracy`, correct/incorrect/extra/missed char counts. |
| `getWords.ts` | Builds a shuffled word list of a given length/difficulty from `wordBank.ts`. Exports `getWords` and `WordMode`; `fisherYatesShuffle` is module-private. |
| `wordBank.ts` | Static word lists (`easyWords`/`mediumWords`/`hardWords`). |
| `typingEngine.ts` | Pure typing reducer + selectors (see Core flow). |
| `hooks/useTypingEngine.ts` | `useReducer` wrapper around the engine. |
| `hooks/useCaret.ts` | Caret positioned from a ref to the active letter; scrolls the words container by lines (3 visible); ResizeObserver + `document.fonts.ready`. |
| `hooks/useFocusMode.ts` | While a test runs, sets `data-focus-mode` on `<html>` so `[data-focus-fade]` chrome fades (CSS in `globals.css`); mouse move reveals it. |
| `motion.ts` | `prefersReducedMotion()` helper (caret transition, `RenderStat`). |
| `hooks/useTimer.ts` | Countdown hook (100ms tick, derived from `performance.now()`): `start()`, `reset(newTimeout?)`, `seconds`, `elapsedMs()`. Guards against double-start; cleans up its interval on unmount. |

## Components (`components/`)

| File | Status |
|---|---|
| `TypingTest.tsx` | Orchestrator, see above. |
| `TypingArea.tsx`, `Word.tsx`, `FocusOverlay.tsx` | Words rendering (memoized `Word`), caret host, click-to-focus overlay. |
| `TimerOptions.tsx`, `LiveStat.tsx`, `RestartButton.tsx` | Duration picker, live stat tile, restart button. |
| `CapsLockAlert.tsx` | Active — shows a warning when Caps Lock is on while typing. |
| `ResultCard.tsx` | Active — shown after a test ends; two-column on `md+`: WPM/accuracy plus a details list (raw WPM, CPM, char counts, duration); uses `RenderStat.tsx`. |
| `LiveAnnouncer.tsx`, `TypingAreaSkeleton.tsx` | Visually hidden polite live region; loading placeholder lines. |
| `RenderStat.tsx` | Active — count-up animation for a single stat. |
| `GlobalStats.tsx` | Active — leaderboard list for `/stats`, handles the "API not configured" state. |
| `Layout.tsx` | Active — page shell: header with logo + Test/Stats nav, footer, default title, description and theme-color meta. |

## Types (`types/types.ts`)

Defines `RootState`/`AppDispatch` (standard RTK typed-hooks pattern),
`ParagraphState`, `StatState`, `StatsInstance`/`StatsInstancePayload`.
Status fields are still bare `string | null`, and the interface names are
camelCase; both are fixed in `REFINEMENT_PLAN.md` 3.6.
`interfaces/index.ts` is leftover boilerplate with no importers (removed in
2.2).

## Build & tooling

- Package manager: npm (`package-lock.json`; `yarn.lock` was removed).
- `tsconfig.json` has `"strict": true`.
- `.env.example` documents `NEXT_PUBLIC_API_BASE_URL`.
- `.github/workflows/ci.yml` runs lint → type-check → test → build on
  Node 20 and 22.
- Lint: ESLint 9 flat config (`eslint.config.mjs`, `next/core-web-vitals` +
  `next/typescript` via `FlatCompat`, `eslint-config-next@15.5`); `npm run lint` = `eslint .`.
- Tests: Vitest 5 (`vitest.config.ts`, jsdom, `vitest.setup.ts` loads
  jest-dom matchers, globals on); tests live next to code in `__tests__/`.
- `tsconfig.json`: target ES2017, `moduleResolution: bundler`, vitest globals types.
- `next.config.mjs`: `reactStrictMode: true`, `poweredByHeader: false`.
- Note: if `~/.npm` is root-owned, set `NPM_CONFIG_CACHE` to a writable dir.
- `.claude/helpers/graft-gate.cjs` (a `PreToolUse` hook) makes agents use
  graft instead of whole-file reads/greps on indexed source. See the graft
  protocol in `REFINEMENT_PLAN.md`.
