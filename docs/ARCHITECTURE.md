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
| `/stats` | `pages/stats/index.tsx` | Renders `GlobalStats` — leaderboard, only populated if `NEXT_PUBLIC_API_BASE_URL` is set. |
| `/about` | `pages/about.tsx` | Leftover `create-next-app` boilerplate page, not linked from anywhere. Scheduled for removal — see `REFINEMENT_PLAN.md` Phase 1. |
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
`REFINEMENT_PLAN.md` Phase 3 — the state machine, cursor tracking, and
rendering should be separable units.

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
  or JSON-parse failure is. See `REFINEMENT_PLAN.md` Phase 3.
- Neither slice is currently exercised by any test.

## Utilities (`utils/`)

All pure, side-effect-free, and small — good unit-test candidates (none
have tests yet; see `REFINEMENT_PLAN.md` Phase 4):

| File | Purpose |
|---|---|
| `calculateWPM.ts` | Words-per-minute from chars matched + elapsed time. |
| `calculateCPM.ts` | Characters-per-minute. |
| `calculateAccuracy.ts` | `% = correct / (correct + incorrect)` style calc from matched/incorrect word counts. |
| `getWords.ts` | Builds a shuffled word list of a given length/difficulty from `wordBank.ts`. Exports `fisherYatesShuffle` (currently unexported — module-private) and `WordMode`. |
| `wordBank.ts` | Static word lists (`easyWords`/`mediumWords`/`hardWords`). |
| `getAccurateChars.ts`, `getAccurateWords.ts`, `getGrossWpm.ts`, `getTotalCharacters.ts`, `getWordsTyped.ts` | Smaller derived-stat helpers. Verify current call sites before changing — some may be superseded by logic now inlined in `TypingTest.tsx`. |
| `noBackSpace.ts`, `removeStyling.ts`, `scrollHelpers.ts` | DOM-manipulation helpers from an earlier, non-React-state-driven version of the typing UI. Confirm live usage before touching — some may be dead now that letter styling moved to React state (`LETTER_CLASSES` in `TypingTest.tsx`). |
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
| `List.tsx`, `ListDetail.tsx`, `ListItem.tsx` | **Dead code.** Leftover `create-next-app` example ("users list") components, not imported by any page or component. Candidates for deletion — see `REFINEMENT_PLAN.md` Phase 1. |

## Types (`types/types.ts`)

Defines `RootState`/`AppDispatch` (standard RTK typed-hooks pattern),
`paragraphState`, `statState`, `statsInstance`/`statsInstancePayload`. Also
defines a `TypingStats` interface that **no code currently references** —
`TypingTest.tsx` uses individual `useState` calls instead. Candidate for
removal (Phase 1) unless it's intended as a target shape for a future
state-consolidation refactor — confirm before deleting.

## Build & tooling gaps (context for Phase 2)

- No ESLint config, no test runner, no CI workflow exist today.
- `tsconfig.json` has `"strict": false`.
- Both `yarn.lock` and `package-lock.json` are committed.
- No `.env.example` documents `NEXT_PUBLIC_API_BASE_URL`.

These are addressed in `REFINEMENT_PLAN.md` Phase 2, before any behavioral
refactor (Phase 3) so that regressions get caught automatically.
