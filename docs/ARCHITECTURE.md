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

`components/TypingTest.tsx` is the app's hub. It currently owns, in one
component:

- **Word source**: dispatches `loadWords`/`refreshWords` (see Redux below)
  to populate `state.paragraph.wordsCollection`.
- **Keystroke state machine**: tracks `activeWordIndex`, `activeLetterIndex`,
  and a per-word/per-letter `wordStates` array (`idle | correct | incorrect |
  active`) built by `buildWordStates()`. Handles backspace, space
  (word-submit), and printable-character input via `onKeyDown` (the
  `<input>` is visually hidden — this is a "hidden input" typing-test
  pattern, not a real text field).
- **Timer**: delegates countdown to `utils/hooks/useTimer.ts` (interval-based
  `start`/`reset`/`seconds`), and reacts to `seconds === 0` to end the test.
- **Cursor rendering**: a `useLayoutEffect` reads the DOM position of the
  element with `id="active-character"` and moves a cursor `<div>` via
  direct style mutation, for a low-latency caret feel that a React re-render
  would be too slow for.
- **Auto-scroll**: a separate effect scrolls the word container when the
  active word's vertical offset increases (i.e. the text wrapped a line).
- **Result stats**: computed each render via the pure functions in `utils/`
  (`calculateWPM`, `calculateCPM`, `calculateAccuracy`) from
  `charsMatched`/`wordsIncorrect`/`wordsMatched`/`seconds`, and frozen into
  `finalStats` when the test ends.

This concentration of concerns is the primary refactor target in
`REFINEMENT_PLAN.md` Phase 3, which moves the state machine into a pure
reducer (`utils/typingEngine.ts`) and splits out the sub-components.

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
  `/addStat/`. **Neither thunk currently checks `response.ok`** — a non-2xx
  HTTP response is not treated as a rejection, only a network-level failure
  or JSON-parse failure is. See `REFINEMENT_PLAN.md` 3.6. `addStatCall` is
  dispatched from a mount effect in `ResultCard.tsx` (see 8.3).
- Neither slice is currently exercised by any test.

## Utilities (`utils/`)

All pure, side-effect-free, and small — good unit-test candidates (none
have tests yet; see `REFINEMENT_PLAN.md` Phase 4). The older DOM helpers
and small stat helpers were deleted in Phase 1.

| File | Purpose |
|---|---|
| `calculateWPM.ts` | Words-per-minute from chars matched + elapsed time. |
| `calculateCPM.ts` | Characters-per-minute. |
| `calculateAccuracy.ts` | `% = correct / (correct + incorrect)` style calc from matched/incorrect word counts. |
| `getWords.ts` | Builds a shuffled word list of a given length/difficulty from `wordBank.ts`. Exports `getWords` and `WordMode`; `fisherYatesShuffle` is module-private. |
| `wordBank.ts` | Static word lists (`easyWords`/`mediumWords`/`hardWords`). |
| `hooks/useTimer.ts` | Countdown hook: `start()`, `reset(newTimeout?)`, `seconds`. Guards against double-start; cleans up its interval on unmount. |

## Components (`components/`)

| File | Status |
|---|---|
| `TypingTest.tsx` | Core, see above. |
| `CapsLockAlert.tsx` | Active — shows a warning when Caps Lock is on while typing. |
| `ResultCard.tsx` | Active — shown after a test ends; uses `RenderStat.tsx` to animate each stat value. |
| `RenderStat.tsx` | Active — count-up animation for a single stat. |
| `GlobalStats.tsx` | Active — leaderboard list for `/stats`, handles the "API not configured" state. |
| `Layout.tsx` | Active — page shell (title, wrapper). |

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
