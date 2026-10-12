# Architecture

## What this is

A single-player typing-speed test built on Next.js 16 (Pages Router, Turbopack for dev and build) +
React 19, with Redux Toolkit for state and Tailwind CSS for styling. A
visitor types a stream of randomized words for a fixed time limit (15/30/60/120s) or word count (10-100), or types a real public-domain quote (short/medium/long), and sees live WPM / CPM / accuracy, then a result card. Optionally, a
result can be posted to an external stats API and a "/stats" page can show
a global leaderboard of past results — both gated behind an env var, so the
app works standalone with no backend.

## Routes (`pages/`)

| Route | File | Purpose |
|---|---|---|
| `/` | `pages/index.tsx` | Renders `TypingTest` — the main app. |
| `/stats` | `pages/stats/index.tsx` | "Your results" (`YourResults`: averages, personal bests, last 20 runs from localStorage history, Clear history) and, only if `NEXT_PUBLIC_API_BASE_URL` is set, "Global leaderboard" (`GlobalStats`). |
| `pages/_app.tsx` | — | Wraps every page in the Redux `<Provider>`, loads `Schibsted Grotesk` (UI) and `IBM Plex Mono` (typing area) fonts, and hydrates/persists `state.settings` after mount. |
| `pages/_document.tsx` | — | Sets `<Html lang="en">` and inlines `THEME_INIT_SCRIPT` in `<head>` so a stored explicit theme applies before first paint. |

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
   `activeLetterIndex`. `useTimer` (timestamp-based countdown), `useCaret`
   (glides one caret bar onto the active letter and scrolls the words box by
   lines; see below) and `useWpmSampler` (per-second WPM samples) are sibling hooks.
3. **Components**: `components/TypingTest.tsx` is the thin orchestrator. It
   loads words from Redux (`loadWords`/`refreshWords`), maps the visually hidden `<input>`'s events to engine actions
   (`onKeyDown` for Backspace/Space/Tab; printable characters and soft-keyboard
   backspace via `onInput`, so mobile keyboards work), starts the timer on
   the first printable character, and on `seconds === 0` dispatches `finish` and
   freezes `finalStats` from `calculateStats` (words and quote mode instead finish in the engine when the last word is completed; both count up). It renders `ConfigBar`, `LiveStat`,
   `TypingArea` (memoized `Word`s, `FocusOverlay`, `TypingAreaSkeleton` while loading, and the hidden input as children), a `LiveAnnouncer` live region, `useFocusMode` (fades chrome while running),
   `RestartButton`, and `ResultCard` once finished.

## State management (`redux/`)

Three slices, combined in `redux/store.ts`:

- **`paragraph`** (`redux/paragraph.ts`) — holds `wordsCollection: string[]`, the last `mode`/`options`, `quoteLength` and `source` (both `null` unless the words are a quote), and a `round` counter (bumped by `loadWords`/`refreshWords`/`repeatWords`; Repeat keeps the words but starts a new round).
  Quote flow: `loadWords({ quoteLength })` picks a quote with `pickQuote` and stores `quoteToWords(quote)` (exact case/punctuation; difficulty and the punctuation/numbers options are ignored) plus its `source`; `refreshWords` picks a different quote of the same tier; `repeatWords` keeps the same quote. `TypingTest` reads `source` to show "— Author" under the typing area and on the `ResultCard`.
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
- **`settings`** (`redux/settings.ts`, `state.settings`) — `mode` (time/words/quote), `timeLimit` (15/30/60/120), `wordCount` (10/25/50/100), `difficulty`, `quoteLength` (short/medium/long, default medium; quote mode only), `punctuation`, `numbers`, `playerName`. `setSetting` (partial) / `hydrateSettings`. `redux/persistSettings.ts` loads (per-field validated) and saves (debounced 300ms + on `pagehide`) it at `speedtype:v1:settings`; `_app.tsx` wires both after mount.
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
| `quotes.ts` | Quote mode data: `QUOTES` (~70 public-domain, plain-ASCII `{ text, source }`), `getQuoteLength` (short <= 20 words, medium 21-45, long 46+; thresholds `SHORT_MAX_WORDS`/`MEDIUM_MAX_WORDS`), `pickQuote(length, rng, excludeText)`, `quoteToWords`. |
| `history.ts`, `getGrade.ts`, `wpmSamples.ts` | Run history in `speedtype:v1:history` (newest 100; entries over `MAX_PLAUSIBLE_WPM` are dropped on load; `subscribeHistory`/`getHistorySnapshot` are a cached-snapshot store for `useSyncExternalStore`, notified by save/clear and cross-tab `storage` events; personal bests per mode+limit+difficulty; quote runs are `mode: "quote"`, `limit` = tier 1/2/3 via `quoteLimit`, `difficulty: "mixed"`, shown as "quote · medium"); WPM-aware grade table; per-second chart samples (`appendSample`, used by `hooks/useWpmSampler.ts`, which updates during render, no refs/effects). `hooks/useRecordResult.ts` appends the finished test once per round, only if `isPlausibleWpm` (≤ `MAX_PLAUSIBLE_WPM` = 300, in `calculateStats.ts`); `ResultCard` shows "Not saved" for faster runs. |
| `typingEngine.ts` | Pure typing reducer + selectors (see Core flow). |
| `hooks/useTypingEngine.ts` | `useReducer` wrapper around the engine. |
| `hooks/useCaret.ts` | Moves the caret bar (`[data-caret-bar]` in `TypingArea`, absolutely positioned inside the scrolling box) onto the letter marked `data-caret="before|after"` via `transform` (`getCaretTransform`), and scrolls the box by lines (3 visible). Sets `data-animate`: keystrokes glide (120ms ease-out, `motion-safe` only); first placement, a new engine round (`resetKey`), resize and `document.fonts.ready` jump. The bar blinks (`animate-caret-blink`) while idle. |
| `hooks/useFocusMode.ts` | While a test runs, sets `data-focus-mode` on `<html>` so `[data-focus-fade]` chrome fades (CSS in `globals.css`); mouse move reveals it. |
| `theme.ts` | Colour theme preference (`system`/`light`/`dark`) at `speedtype:v1:theme`: a tiny external store (`getThemePreference`/`setThemePreference`/`subscribeTheme`) for `useSyncExternalStore`, `applyThemePreference` (sets/removes `data-theme` on `<html>`), and the dependency-free `THEME_INIT_SCRIPT`. |
| `motion.ts` | `prefersReducedMotion()` helper (caret transition, `RenderStat`). |
| `hooks/useTimer.ts` | Timer hook, `direction` `"down"` (time mode) or `"up"` (words and quote mode) (100ms tick, derived from `performance.now()`): `start()`, `stop()`, `reset(newTimeout?)`, `seconds`, `elapsedSeconds`, `elapsedMs()`. Guards against double-start; cleans up its interval on unmount. |

## Components (`components/`)

| File | Status |
|---|---|
| `TypingTest.tsx` | Orchestrator, see above. |
| `TypingArea.tsx`, `Word.tsx`, `FocusOverlay.tsx` | Words rendering (memoized `Word`, which marks the caret letter with `data-caret`), the caret bar, click-to-focus overlay. |
| `SettingsPanel.tsx` | Settings UI (mode incl. Quote, time/word count/quote length, difficulty, punctuation, numbers; quote mode hides difficulty and the Include toggles) + player name; reads/writes `state.settings`; dimmed while running. |
| `LiveStatsPanel.tsx` | Live stats display: dark WPM tile with sparkline, plus grid of small tiles for accuracy/CPM/errors/words. |
| `Sparkline.tsx` | Inline-SVG mini chart of WPM over time (one point per second). |
| `TimerRow.tsx` | Timer label, progress bar, and goal text. |
| `icons.tsx` | Inline SVG icon components (RotateCcwIcon, ArrowRightIcon, MousePointerIcon). |
| `RestartButton.tsx` | Restart button. |
| `CapsLockAlert.tsx` | Active — shows a warning when Caps Lock is on while typing. |
| `ResultCard.tsx` | Active — shown after a test ends; two-column on `md+`: WPM/accuracy plus a details list (raw WPM, CPM, char counts, duration); uses `RenderStat.tsx`. |
| `YourResults.tsx` | `/stats` personal results from history (`useSyncExternalStore` over the history store; `null` = loading on the server/hydration). |
| `WpmChart.tsx` | Inline-SVG WPM / raw WPM line chart (+ mistake dots) on the result card; data from `utils/wpmSamples.ts`. |
| `LiveAnnouncer.tsx`, `TypingAreaSkeleton.tsx` | Visually hidden polite live region; loading placeholder lines. |
| `RenderStat.tsx` | Active — count-up animation for a single stat. |
| `GlobalStats.tsx` | Active — leaderboard list for `/stats`, handles the "API not configured" state. |
| `Layout.tsx` | Active — page shell: header with logo + Test/Stats nav + `ThemeToggle`, footer, default title, description and per-scheme theme-color meta. |
| `ThemeToggle.tsx` | Header button cycling system → light → dark (`utils/theme.ts`). |

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
  build on Node 22 and 24 (npm cache enabled).
- E2E: Playwright (`@playwright/test`, dev dependency). `playwright.config.ts` builds and serves the production app (`npm run build && npm start`; reuses a running server locally, not in CI) and defines two projects: desktop Chromium and a 375px-wide viewport. Specs in `e2e/` (`typing`, `config`, `focus`, `quote`, `theme`, `caret`, shared `helpers.ts`) automate the Smoke script, reading randomized words from the DOM. Run with `npm run test:e2e`; deliberately not part of `npm test`, and Vitest excludes `e2e/**`. CI runs it in a separate `e2e` job (Node 22, `playwright install --with-deps chromium`, uploads `test-results/` and `playwright-report/` on failure).
- Coverage: `npm run test:coverage` (`@vitest/coverage-v8`) enforces 80%
  thresholds on `utils/**` and `redux/**` (`useCaret.ts` excluded — DOM
  layout, verified in a real browser instead).
- Lint: ESLint 9 flat config (`eslint.config.mjs`, native flat exports
  `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`, `eslint-config-next@16`,
  which includes the React Compiler `react-hooks` rules); `npm run lint` = `eslint .`.
- Tests: Vitest 5 (`vitest.config.ts`, jsdom, `vitest.setup.ts` loads
  jest-dom matchers, globals on); tests live next to code in `__tests__/`.
- `tsconfig.json`: target ES2017, `moduleResolution: bundler`, vitest globals types.
- `next.config.mjs`: `reactStrictMode: true`, `poweredByHeader: false`.
- Styling: Tailwind CSS 4 via `@tailwindcss/postcss` (`postcss.config.js`). Config is CSS-first:
  layout breakpoint `panels` (1144px: settings 240 + typing card 560 + live stats 240 fit on one row;
  below it the side panels are full-width rows) and design tokens live in `@theme` in `styles/globals.css`, each as `light-dark(light, dark)`.
  `:root` has `color-scheme: light dark` (follows the OS); `data-theme="light|dark"` on `<html>`
  pins it, so no component needs `dark:` variants. Fonts use `@theme inline` because
  next/font sets `--font-schibsted` / `--font-plex-mono` on the app wrapper, not `:root`.
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
| `speedtype:v1:history` | `utils/history.ts` | newest 100 finished runs (`mode` time/words/quote, `limit`, `difficulty`, `wpm`, `rawWpm`, `accuracy`, `date`) |

Bump the `v1` segment if a shape changes incompatibly.
