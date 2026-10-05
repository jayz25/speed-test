# Refinement Plan

Status key: `[ ]` not started · `[~]` in progress · `[x]` done.

Last full analysis: 2026-10-05 (against commit `d005c7d`).

This is the single backlog for improving **correctness, performance, UI/UX
and features** of SpeedType. It is written so an agent with little context
can pick up **one task**, do it, verify it, and tick it off.

---

## How to execute this plan (read first)

1. Read `docs/ARCHITECTURE.md` and `docs/CONVENTIONS.md` (≈5 min), then
   follow the **graft navigation protocol** below for all code lookups.
2. Pick the **lowest-numbered unchecked task whose dependencies are done**
   (see the dependency map below). Do **one task per commit**; group the
   tasks of one phase into one PR if that's convenient.
3. Follow the task's **Do** steps literally. Where a task gives a type,
   name, file path, storage key or formula, use it exactly — other tasks
   depend on those names.
4. Run the **verification gate** before marking the task done:
   ```bash
   npm run lint && npm run type-check && npm test && npm run build
   ```
   (Before Phase 2 is done some of these are broken — Phase 2 fixes that.)
5. Tasks that change visible behavior also need a manual check: `npm run
   dev`, open http://localhost:3000, and walk through the **Smoke script**
   below. If you cannot drive a browser, say so in your summary instead of
   claiming it was checked.
6. Tick the box (`[x]`), add a one-line note under the task if you deviated,
   and update `ARCHITECTURE.md` in the same commit if you changed structure.
   If you created, deleted or renamed files, run `graft build` before you
   finish. End your summary with the output of `graft stats`.
7. Commit message format: `<type>(<area>): <summary>` — e.g.
   `fix(engine): count spaces in net WPM`. Types: feat, fix, refactor,
   perf, test, docs, chore, ci.

**Rules of engagement**
- Stay inside the task. If you notice something else, add it to
  "Parking lot" at the bottom instead of fixing it.
- If a task's premise turns out wrong (file moved, bug already fixed), write
  a note under the task, mark it `[x]` or adjust it, and move on — don't
  improvise a bigger change.
- No new runtime dependencies unless the task names them. No chart
  libraries, no UI kits, no state libraries.
- Keep the existing palette: `slate-*` grays, accent `#FFD523`, errors
  `red-400`, secondary stats `blue-400`/`green-400`.

### Graft navigation protocol (mandatory — saves tokens)

The repo's code is indexed by [graft](https://github.com/trailhq/graft) into
`graft/` (gitignored; rebuild with `graft build` if missing). It returns
exact `file:line` spans for a fraction of the tokens a full file read costs.
For **TypeScript/TSX source**, use graft and don't use `cat`, `grep -r`, or
whole-file `Read`:

| You need… | Run | Not |
|---|---|---|
| How something works / where it lives | `graft ask "<task or identifier>" --source` | grep + reading files |
| A file's functions/types and their line ranges | `graft skeleton <file>` | reading the whole file |
| Who calls X (rename/delete impact) | `graft callers <symbol>` (`--depth 2` for transitive) | grep for the name |
| What X calls | `graft callers <symbol> --direction out` | reading X's body |
| Every occurrence of a literal | `graft grep "<literal>"` | `grep -rn` |
| First orientation in the repo | `graft map` | `ls -R` / `find` |

Rules:
- Query with identifiers already named in the task (`handleKeyDown`,
  `getStatCall`, `TypingTest.tsx`). Re-querying is cheap.
- Only open a source file at the exact `file:line` range graft gave you,
  using `Read` with `offset`/`limit`. If a span is cut off ("+N more
  lines"), read just that range.
- Raw `grep`/`Read` are fine for files graft doesn't index: Markdown docs,
  JSON/YAML/config files, CSS, and files you created in this session
  before running `graft build`.
- Before deleting or renaming any exported symbol, run `graft callers`
  on it and note the caller count in your commit message. If it answers
  `no symbol "X" in the graph`, the symbol is a value rather than a
  declared function. This happens with Redux thunks and actions such as
  `getStatCall`, `addStatCall`, `loadWords`. Use `graft grep "X"` for
  those.
- Before committing, run `graft blast` to see what depends on the lines
  you changed, and check that each dependant is still covered by your
  change or its tests.
- In Claude Code, the `mcp__graft__*` tools (`graft_find_code`,
  `graft_file_api`, `graft_trace_calls`, `graft_find_all`,
  `graft_repo_map`) are the same commands; either form is fine.

**This is enforced.** A `PreToolUse` hook (`.claude/helpers/graft-gate.cjs`)
blocks these calls on graft-indexed source:
- `Read` without `offset`/`limit` on a file over 120 lines.
- `Grep`, `grep -r` or `rg` over code directories or `*.ts(x)` files.
- `cat` of a large source file.

If you're blocked, the message names the graft command to use instead.
Ranged reads (`Read` with `offset`/`limit`, `sed -n 'A,Bp'`) are always
allowed, and they also satisfy the read-before-`Edit` requirement. Bypass
only if graft is broken: start the session with `GRAFT_GATE=off`. The gate
turns itself off when `graft/` hasn't been built.

Each phase below starts with a **Context** line: the graft queries to run
before starting it.

### Smoke script (manual check)

1. Page loads, words visible, caret visible on first letter, typing
   works **without clicking first**.
2. Type a word correctly + space → next word. Type a word wrong + space →
   word gets red underline.
3. Backspace inside a word works; backspace at the start of a word does
   nothing.
4. Timer starts on first keystroke, counts down, test ends at 0, result
   card shows.
5. Enter / button on the result card starts a new test with new words.
6. Change the duration (15/30/45/60) before starting → timer shows it.
7. Click outside the typing area → "Click to focus" overlay; click it →
   typing resumes.

### Dependency map

```
Phase 2 (repair baseline)  ──►  Phase 3 (engine refactor)  ──►  Phase 4 (tests)
                                         │
                                         ├──► Phase 5 (correctness + perf)  ──► Phase 7 (features)
                                         └──► Phase 6 (UI/UX + a11y)         ──► Phase 7
Phase 8 (leaderboard/API) needs Phase 3 only.
```
Phases 5, 6 and 8 can run in parallel by different agents once Phase 3 is
done; within a phase, tasks are ordered — do them top to bottom unless a
task says it's independent.

---

## Current-state findings (why the phases below exist)

Verified by reading the code on 2026-10-05:

- **Tooling is not actually working.** `package.json` has `"test":
  "vitest run"` but `vitest` is not installed; there is no vitest config.
  ESLint is v9 but config is legacy `.eslintrc.json`, run through `next
  lint` (deprecated in Next 15.5), with `eslint-config-next@16` (made for
  Next 16) against `next@15`. CI will fail. `@vitejs/plugin-react-swc` and
  `@swc/helpers` sit in `dependencies` though nothing imports them.
- **Docs drift.** `ARCHITECTURE.md` still describes deleted files
  (`pages/about.tsx`, `List*.tsx`, `noBackSpace.ts`, …) and says no
  ESLint/CI exist; `README.md` lists an `/about` route that is gone.
- **Dead files.** `interfaces/index.ts` (boilerplate `User` type, no
  importers), `static/*.png|svg` (no references; Next only serves
  `public/`), committed `tsconfig.tsbuildinfo`.
- **Engine.** `components/TypingTest.tsx` (394 lines) mixes everything;
  every keystroke deep-clones the letter arrays of all 300 words and
  re-renders ~1,800 `<span>`s. Space-submit reads the word from the hidden
  input's DOM value.
- **Correctness bugs.**
  - Typing past the end of a word increments the letter index but nothing
    is rendered and the caret vanishes (no `active-character` element).
  - Live "ACC" shows 100 before start, then **0%** after the first
    keystroke until the first word is submitted (`calculateAccuracy`
    returns 0 for 0 words).
  - Accuracy is word-based; WPM ignores spaces and incorrect words entirely
    (no raw WPM). Timer is a 1s `setInterval` (drifts, stats use whole
    seconds).
  - `isFocused` starts `true` but the input may not have focus → first
    keystrokes are lost with no overlay shown.
  - Auto-scroll uses a hard-coded `scrollBy(40)`; actual line height is
    larger (`text-3xl leading-relaxed` + `gap-y-2`), so lines drift out of
    view on long tests. Caret isn't repositioned on window resize.
  - `refreshWords` always uses `"mixed"`, ignoring any mode.
  - Grade is based on accuracy only (5 WPM at 100% = "S").
  - Pressing Tab from the input focuses the "15s" button, so Tab+Enter
    silently switches the duration.
  - Mobile/Android: soft keyboards send `key: "Unidentified"` on keydown →
    app is unusable on phones.
- **Stats API.** Thunks don't check `response.ok`; failed GET shows "No
  stats recorded yet"; POST happens in a mount effect of `ResultCard`
  (double-posts under Strict Mode), sends `user: ""` which the thunk then
  overrides with `"Anonymous"`; leaderboard unsorted; API data not
  validated.
- **UI/a11y.** No navigation (the `/stats` page is unreachable), both pages
  titled "Home | …", no meta description. Each of 300 words has an
  `aria-label` (screen-reader noise), container is `role="button"`. Idle
  letters (`text-slate-600 opacity-70`) fail contrast. No
  `prefers-reduced-motion` handling. 200ms color transition on every letter
  makes feedback feel laggy. `flash` keyframe in `tailwind.config.js` is
  unused (caret never blinks).

---

## Phase 1 — Documentation & dead-code cleanup ✅

Done in commit `95b46e7` (README rewrite, `.env.example`, removed
`List*.tsx`, `pages/about.tsx`, unused utils, `TypingStats` type).

---

## Phase 2 — Repair the baseline (docs, deps, lint, test, CI)

**Context:** mostly config/docs, which graft doesn't index, so read those directly. For code: `graft skeleton pages/_app.tsx`.

Goal: every command in the verification gate works on a fresh clone, and
the docs describe the code that exists. **Everything else depends on this.**

- [x] **2.1 Fix docs drift.** _(Done with the plan commit. ARCHITECTURE "Build & tooling" will need another update once 2.3–2.5 land.)_
  - Files: `docs/ARCHITECTURE.md`, `README.md`.
  - Do: In `ARCHITECTURE.md` remove rows/mentions of `/about`,
    `List.tsx`/`ListDetail.tsx`/`ListItem.tsx`, `TypingStats`,
    `getAccurateChars`…`getWordsTyped`, `noBackSpace`, `removeStyling`,
    `scrollHelpers`; rewrite "Build & tooling gaps" to describe what Phase 2
    sets up. In `README.md` remove the `/about` row, add `lint` and `test`
    to the scripts list, and note "Package manager: npm (`package-lock.json`)".
  - Done when: `grep -rnE "about\.tsx|ListItem|noBackSpace|removeStyling|TypingStats" docs README.md`
    only matches this plan file. (Raw grep is correct here: Markdown isn't
    indexed by graft.)

- [x] **2.2 Delete dead files.**
  - Do: `git rm -r interfaces static` and `git rm --cached tsconfig.tsbuildinfo`;
    add `*.tsbuildinfo` to `.gitignore`. First re-confirm zero references:
    `graft grep "interfaces"` and `graft grep "static/"` (code), plus
    `grep -rn "static/" styles` (CSS isn't indexed).
  - Done when: build succeeds; files are gone.

- [x] **2.3 Fix dependencies.** _(`@testing-library/jest-dom@^7.0.1` exists, kept. Resolved `eslint-config-next@15.5.27`, vitest 5, plugin-react 6/vite 8. Needed a writable npm cache: `~/.npm` is root-owned.)_
  - Do:
    ```bash
    npm uninstall @vitejs/plugin-react-swc @swc/helpers
    npm install -D vitest @vitejs/plugin-react jsdom eslint-config-next@^15.5 @eslint/eslintrc
    ```
    Check `@testing-library/jest-dom` resolves to a real version (`npm ls
    @testing-library/jest-dom`); if `^7` doesn't exist, use the latest 6.x.
  - Done when: `npm ci` on a clean checkout succeeds with no peer-dep errors.

- [x] **2.4 ESLint flat config.** _(Also ignored `.claude/**` and `next-env.d.ts` in the config; removed unused `WordsCollection` import in `redux/paragraph.ts`.)_
  - Files: create `eslint.config.mjs`, delete `.eslintrc.json`, edit
    `package.json` script `"lint": "eslint ."`.
  - Do:
    ```js
    // eslint.config.mjs
    import { FlatCompat } from "@eslint/eslintrc";
    const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
    export default [
      { ignores: [".next/**", "node_modules/**", "graft/**", "coverage/**", "*.config.*"] },
      ...compat.extends("next/core-web-vitals", "next/typescript"),
      {
        rules: {
          "@typescript-eslint/no-explicit-any": "warn",
          "no-console": "warn",
        },
      },
    ];
    ```
    Fix what it reports (e.g. `pages/_app.tsx` `any` props → use
    `AppProps` from `next/app`). Don't blanket-disable rules.
  - Done when: `npm run lint` exits 0.

- [x] **2.5 Vitest wiring.**
  - Files: create `vitest.config.ts`, `vitest.setup.ts`,
    `utils/__tests__/smoke.test.ts`.
  - Do:
    ```ts
    // vitest.config.ts
    import { defineConfig } from "vitest/config";
    import react from "@vitejs/plugin-react";
    export default defineConfig({
      plugins: [react()],
      test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
    });
    // vitest.setup.ts
    import "@testing-library/jest-dom/vitest";
    ```
    Smoke test: `calculateWPM(50, 30, 60)` returns `20`.
    Add `"types": ["vitest/globals"]` to `tsconfig.json` `compilerOptions`.
  - Done when: `npm test` runs 1 passing test.

- [x] **2.6 Modernize tsconfig + add next.config.**
  - Do: in `tsconfig.json` set `"target": "ES2017"`,
    `"moduleResolution": "bundler"`. Create `next.config.mjs`:
    ```js
    /** @type {import('next').NextConfig} */
    export default { reactStrictMode: true, poweredByHeader: false };
    ```
    Note: Strict Mode double-runs effects in dev — `ResultCard` will
    double-POST stats in dev until task 8.3. That's acceptable.
  - Done when: type-check + build pass.

- [x] **2.7 CI green.** _(`cache: npm` added; CI run verification pending a push — not pushed.)_
  - Files: `.github/workflows/ci.yml`.
  - Do: add `cache: npm` to `setup-node`. Leave the rest. Push a branch and
    confirm the run is green (`gh run watch`), or state that you couldn't.
  - Done when: CI passes on both Node 20 and 22.

**Acceptance:** verification gate passes locally on a fresh `npm ci`.

---

## Phase 3 — Extract a pure typing engine (behavior-preserving)

**Context:** `graft skeleton components/TypingTest.tsx` · `graft ask "handleKeyDown keystroke state machine" --source` · `graft ask "useTimer" --source` · `graft grep "getStatCall"` · `graft callers buildWordStates`.

Goal: move the keystroke state machine into a **pure reducer** (trivially
testable, cheap to update), and split `TypingTest.tsx` into small pieces.
**The app must look and behave exactly the same** (run the Smoke script
before and after). Depends on Phase 2.

- [x] **3.1 Create the pure engine.**
  - File: `utils/typingEngine.ts` (no React imports).
  - Do: implement exactly this API:
    ```ts
    export type TestStatus = "idle" | "running" | "finished";
    export type LetterState = "idle" | "correct" | "incorrect";

    export interface EngineState {
      words: readonly string[];
      typed: readonly string[];      // typed[i] = chars typed for word i; length = activeWordIndex + 1
      activeWordIndex: number;
      status: TestStatus;
      correctKeystrokes: number;     // printable keys that matched target (used in Phase 5)
      incorrectKeystrokes: number;
    }

    export type EngineAction =
      | { type: "reset"; words: readonly string[] }
      | { type: "typeChar"; char: string }     // single printable char, not space
      | { type: "backspace" }
      | { type: "submitWord" }                 // space
      | { type: "finish" };

    export function createEngineState(words: readonly string[]): EngineState;
    export function engineReducer(state: EngineState, action: EngineAction): EngineState;

    // Derived selectors (pure):
    export function getLetterStates(target: string, typed: string): LetterState[];
    export function isWordWrong(state: EngineState, index: number): boolean; // submitted && typed !== target
    export function getWordCounts(state: EngineState): { wordsMatched: number; wordsIncorrect: number; charsMatched: number };
    ```
    Rules (match current behavior):
    - `typeChar` when `status === "idle"` sets `status: "running"`.
      Ignored when `"finished"` or `words.length === 0`.
    - `backspace` removes the last char of the active word; no-op if empty
      (cannot go back to the previous word).
    - `submitWord` is a no-op if the active word's typed string is empty;
      otherwise advances `activeWordIndex` and pushes `""` onto `typed`.
    - `getLetterStates`: for `i < target.length`, `idle` if `i >=
      typed.length`, else `correct`/`incorrect`. (Extra chars are ignored
      for now — Phase 5.3 renders them.)
    - `getWordCounts` counts only submitted words (`i < activeWordIndex`);
      `charsMatched` = sum of `target.length` for correct ones.
    - Never mutate: always return new arrays/objects; only the changed
      `typed` entry gets a new string, so unchanged words keep identity.
  - Done when: type-check passes (tests come in 4.3).

- [x] **3.2 `useTypingEngine` hook.**
  - File: `utils/hooks/useTypingEngine.ts`.
  - Do: wrap `useReducer(engineReducer, words, createEngineState)`; dispatch
    `reset` whenever `words` changes. Return `{ state, typeChar, backspace,
    submitWord, finish, activeLetterIndex }` where `activeLetterIndex =
    state.typed[state.activeWordIndex]?.length ?? 0`. Memoize the action
    callbacks with `useCallback` (they only depend on `dispatch`).

- [x] **3.3 Memoize `useTimer` callbacks.**
  - File: `utils/hooks/useTimer.ts`.
  - Do: wrap `start` and `reset` in `useCallback` (deps: `[]` and
    `[timeout]`). No behavior change.

- [x] **3.4 Extract components.**
  - Create:
    - `components/TimerOptions.tsx` — props `{ value: number; options: readonly number[]; onChange(n: number): void }`.
    - `components/LiveStat.tsx` — the current inner `Stat` (`{ label, value, unit? }`). (Named `LiveStat` to avoid confusion with `RenderStat`.)
    - `components/Word.tsx` — props `{ word: string; typed: string; isActive: boolean; isWrong: boolean; activeLetterIndex: number }`;
      renders the letter spans exactly as now, using `getLetterStates`.
      Export wrapped in `React.memo`. Keep `id="active-character"` logic
      for now (5.4 replaces it).
    - `components/FocusOverlay.tsx` — the "Click to focus" overlay.
  - Move `LETTER_CLASSES` into `Word.tsx`.
    - Note: `Word` has no ref; auto-scroll now reads `#active-character`'s parent (same word div). `LetterState` lives in `typingEngine.ts` (no `"active"` member).

- [x] **3.5 Rewire `TypingTest.tsx`.**
  - Do: replace the 8 `useState`s for engine state with
    `useTypingEngine(words)`. In `handleKeyDown` map keys → actions
    (`Backspace` → `backspace`, space → `preventDefault()` + `submitWord`,
    `e.key.length === 1` → `typeChar`). Call `start()` when the first
    keystroke arrives while `state.status === "idle"`. When `seconds === 0`
    and status is `"running"`, dispatch `finish` and freeze `finalStats`.
    Stop reading `textInput.current.value`; instead keep the input
    controlled with `value=""` and `onChange={() => {}}` so the DOM value
    never accumulates.
  - Pass `typed={state.typed[wi] ?? ""}` to each `<Word>`.
  - Done when: `TypingTest.tsx` ≤ 200 lines, no component defined inside
    another, Smoke script behaves as before.
    - Note: also extracted `TypingArea`, `RestartButton`, `utils/hooks/useCaretTracking.ts` to reach <=200 lines (195). Timer now starts only on the first printable key (previously any non-modifier key incl. Backspace/Space/Shift started it).

- [x] **3.6 Typed Redux status + `response.ok`.**
  - Files: `types/types.ts`, `redux/stat.ts`, `redux/paragraph.ts`.
  - Do: `paragraphState.status: "idle" | "ready"`; `statState.status:
    null | "Loading Stats" | "Stats Received" | "Stats API Failed" |
    "Saving Stat" | "Stat Saved" | "Save Failed"`. In both thunks:
    `if (!response.ok) throw new Error(\`HTTP ${response.status}\`);`
    before `response.json()`. Rename interfaces to PascalCase while there
    (`ParagraphState`, `StatState`, `StatsInstance`, `StatsInstancePayload`)
    and update importers (`graft callers <name>` to find them).
    - Note: `redux/paragraph.ts` has no thunk, so `response.ok` was added only to the two thunks in `redux/stat.ts`.

- [x] **3.7 Update `ARCHITECTURE.md`** "Core flow" to describe engine →
  hook → components.

**Acceptance:** Smoke script identical to before; gate passes.

---

## Phase 4 — Test coverage

**Context:** `graft skeleton utils/typingEngine.ts` · `graft skeleton utils/hooks/useTimer.ts` · `graft skeleton utils/getWords.ts`.

Depends on Phase 2 (runner) and Phase 3 (engine). Tests live next to code in
`__tests__/` folders: `utils/__tests__/*.test.ts`,
`utils/hooks/__tests__/*.test.ts`, `components/__tests__/*.test.tsx`.
Use Arrange/Act/Assert and descriptive names.

- [x] **4.1 Pure utils** — `calculateWPM`, `calculateCPM`,
  `calculateAccuracy`, `getWords` (length == count; every word comes from
  the chosen pool; `count` > pool size cycles; each mode uses its pool).
  Edge cases: elapsed 0 → 0, zero words → 0. Delete the smoke test from 2.5.
- [x] **4.2 `useTimer`** with `vi.useFakeTimers()` + `renderHook`: starts at
  timeout, reaches exactly 0, never negative, double `start()` no-op,
  `reset(n)` stops the interval and sets `n`, unmount clears interval.
  - Note: also asserts `timeout` prop changes update `seconds`.
- [x] **4.3 `typingEngine`** — one `describe` per action: first `typeChar`
  sets running; correct/incorrect letter states; backspace; backspace at
  empty is no-op; submit empty is no-op; submit wrong word → `isWordWrong`;
  `getWordCounts`; `finish` blocks further input; reducer returns new
  objects and leaves unchanged `typed` entries referentially equal.
  - Note: `typed` entries are strings, so referential-equality is trivially true; test asserts value equality of unchanged entries and that `typed` is a new array.
- [x] **4.4 Component test** `TypingTest.test.tsx`: render with a real
  store (export a `makeStore()` factory from `redux/store.ts` for this —
  keep the default export), type `"the "` via `@testing-library/user-event`
  (install as devDependency) against a store preloaded with known words,
  assert the first word is not marked wrong and live WPM element exists.
  - Note: `makeStore(preloadedState?)` added to `redux/store.ts` (default export kept). `TypingTest` dispatches `loadWords` on mount, so `utils/getWords` is mocked to return known words. Added `redux/__tests__/slices.test.ts` (paragraph reducers + stat thunks with mocked `fetch`) to meet the 80% bar.
- [x] **4.5 Coverage** — add `"test:coverage": "vitest run --coverage"`
  (install `@vitest/coverage-v8`), set
  `coverage.include: ["utils/**", "redux/**"]` and thresholds 80%. Add it
  to CI in place of `npm test`.
  - Note: coverage excludes `utils/hooks/useCaretTracking.ts` (DOM-heavy) and `__tests__`; vitest/coverage ignore `.worktrees/**`. CI step now `npm run test:coverage`. `package.json` deps for 4.4 (`@testing-library/user-event`) landed in the 4.5 commit together with the script. Also added `.worktrees` to eslint ignores and tsconfig `exclude` so the Phase 8 worktree isn't linted/type-checked from the main tree.

**Acceptance:** `npm run test:coverage` ≥ 80% on `utils/` + `redux/`, CI green.

---

## Phase 5 — Correctness & performance

**Context:** `graft skeleton utils/typingEngine.ts` · `graft ask "cursor position caret useLayoutEffect" --source` · `graft ask "auto-scroll active word line" --source` · `graft callers calculateWPM` (before deleting the calculate* files).

Depends on Phase 3. Each task must add/adjust tests in
`utils/__tests__/typingEngine.test.ts` when it touches the engine.

- [x] **5.1 Timestamp-based timer.**
  - Note: also exports `TIMER_TICK_MS`; `elapsedMs()` freezes at the limit once finished.
  - File: `utils/hooks/useTimer.ts`.
  - Do: on `start()`, store `startedAt = performance.now()`; tick every
    `TIMER_TICK_MS = 100`; `seconds = Math.max(0, Math.ceil(limit -
    elapsed/1000))`; expose `elapsedMs()` (function, reads the clock). Only
    call `setSeconds` when the displayed integer changes (avoid 10
    renders/s). Keep the `{ seconds, start, reset }` API, add `elapsedMs`.
  - Update 4.2 tests.

- [x] **5.2 Standard stat formulas.**
  - Note: `calculateAccuracy(state)` is also exported from `calculateStats.ts`; ResultCard keeps its `wpm/cpm/accuracy` props (only the accuracy subtitle changed to "correct keystrokes"). Net WPM spaces = correct words − 1 (submitted words only).
  - Files: new `utils/calculateStats.ts` (replaces the three
    `calculate*.ts` files — delete them and their tests, move tests over).
  - Do: implement and test
    ```ts
    export interface TestStats {
      wpm: number;       // net: (chars of correct words + 1 space per correct word except the last) / 5 / minutes
      rawWpm: number;    // all typed chars incl. spaces, incorrect and extra / 5 / minutes
      cpm: number;       // net chars / minutes
      accuracy: number;  // correctKeystrokes / (correct + incorrect) * 100, rounded; 100 if no keystrokes
      correctChars: number; incorrectChars: number; extraChars: number; missedChars: number;
    }
    export function calculateStats(state: EngineState, elapsedMs: number): TestStats;
    ```
    `missedChars` = untyped chars of submitted words. All results rounded,
    `0` when `elapsedMs <= 0`. Engine: increment `correctKeystrokes` /
    `incorrectKeystrokes` in `typeChar` (a char typed past the word end is
    incorrect). Use `calculateStats` for live stats and the result card.
    Fixes the "ACC 0% after first key" bug.

- [x] **5.3 Render extra characters.**
  - Do: engine caps `typed[active]` at `target.length + MAX_EXTRA_CHARS`
    (`= 10`, exported const). Extend `LetterState` with `"extra"`;
    `getLetterStates` returns one entry per char of `max(target, typed)`.
    `Word.tsx` renders extra chars in `text-red-400/70`. Caret now always
    has a target element.

- [x] **5.4 Caret: ref-based + resize-safe.**
  - Note: implemented together with 5.5 in one commit (same hook). `useCaretTracking.ts` was `git mv`d to `utils/hooks/useCaret.ts` (single hook). Signature: `useCaret({ caretRef /* caret div */, targetRef /* active letter, passed to Word as caretRef */, containerRef, viewportRef, deps })`. `Word` also got a `data-word` attribute (used to measure line pitch) and non-active words get `activeLetterIndex = -1`.
  - File: new `utils/hooks/useCaret.ts`; remove the `useLayoutEffect` and
    `getElementById` from `TypingTest.tsx`, and `id="active-character"`
    from `Word.tsx`.
  - Do: `Word` accepts `caretRef?: React.Ref<HTMLSpanElement>` and attaches
    it to the active letter (or trailing spacer). `useCaret({ caretRef,
    targetRef, deps })` positions the caret in `useLayoutEffect` (same
    transition logic as today) and also on `ResizeObserver` of the words
    container and on `document.fonts.ready`. Caret blinks
    (`animate-flash`, already in `tailwind.config.js`) only while
    `status === "idle"`.

- [x] **5.5 Line-based scrolling.**
  - Note: viewport height = `VISIBLE_LINES (3) * pitch`, pitch = first word height + row gap (measured, jsdom-safe). Layout-dependent hook is excluded from coverage; pure `getLineScrollOffset` is unit-tested. Not verified in a real browser.
  - Do: replace `scrollBy(40)` with a translate: keep 3 lines visible; when
    the active word's `offsetTop` reaches line 3, set the inner word
    container's `transform: translateY(-<offsetTop of line 2>px)` with a
    150ms transition. Container height = `3 * lineHeight` measured from the
    first word element (not hard-coded `h-40`). Remove `scrollRef` scroll
    logic.
  - Done when: a 60s test typed with long words never hides the active line.

- [x] **5.6 Per-keystroke render cost.**
  - Note: no browser, so no DevTools Profiler commit durations. Instead `components/__tests__/TypingTest.renders.test.tsx` counts `Word` renders (via `getLetterStates` calls) with 300 words: letter keystroke = 1 Word render, space-submit = 2, never more. Before (3.x/Phase 3 code) every Word received the changing `activeLetterIndex`, so all 300 re-rendered per keystroke. Fix: non-active words get `activeLetterIndex=-1`, `caretRef` only to the active word, letter color transition removed, live stats memoised on `[seconds, state.words]`.
  - Do: confirm `Word` is memoized and receives only primitive props;
    `caretRef` passed only to the active word. Remove `transition-colors
    duration-200` from letter spans. Compute live stats once per timer tick
    (`useMemo` keyed on `seconds`), not per keystroke.
  - Verify: React DevTools Profiler — a keystroke re-renders `TypingTest`,
    at most 2 `Word`s, and no others. Record the before/after commit
    duration in the task note.

- [x] **5.7 Focus & shortcuts.**
  - Note: `isFocused` starts `false` and is set after mount from `document.activeElement`; `resetTest` now also refocuses the input (needed after Tab+Enter). Esc listener is disabled while the result card is shown (it handles Esc itself).
  - Do: initialise `isFocused` from `document.activeElement ===
    inputRef.current` after mount; `autoFocus` the input. On Tab keydown in
    the input: `preventDefault()` and focus `#reset-btn` (so Tab → Enter
    restarts). Esc anywhere: restart test. Show a hint line under the
    typing area: `tab + enter — restart · esc — restart`.

- [ ] **5.8 `refreshWords` respects mode.**
  - File: `redux/paragraph.ts`. Store `mode: WordMode` in state (set by
    `loadWords`), and use it in `refreshWords`. Add a reducer test.

**Acceptance:** Smoke script passes; new engine/stat tests pass; Profiler
note recorded in 5.6.

---

## Phase 6 — UI/UX polish & accessibility

**Context:** `graft skeleton components/Layout.tsx` · `graft skeleton components/Word.tsx` · `graft skeleton components/ResultCard.tsx` · `graft ask "focus overlay blur" --source`.

Depends on Phase 3 (5.x not required). Visual direction: keep the current
dark gradient + yellow accent; minimal, "monkeytype-like" focus on the text.

- [x] **6.1 Layout shell.**
  - Note: Footer text uses `text-slate-400` (not slate-600) for contrast. Added a `sr-only` h1 per page (heading hierarchy). Active nav link also sets `aria-current="page"`.
  - File: `components/Layout.tsx`.
  - Do: header: logo (`<Link href="/">`) left, nav right with `Test` (`/`)
    and `Stats` (`/stats`); active link `text-white`, others
    `text-slate-400 hover:text-white`. Footer: one small `text-slate-600` line
    reading "SpeedType" (no placeholder or made-up URLs).
    Default `title` → `"SpeedType"`; pages pass `"SpeedType — Typing Test"`
    and `"SpeedType — Stats"`. Add `<meta name="description">` and
    `<meta name="theme-color" content="#0f172a">`.

- [x] **6.2 Typing font + responsive sizing.**
  - Note: 375px no-horizontal-scroll check NOT verified (no browser). Header/stat rows use `flex-col sm:flex-row` / `flex-wrap`.
  - Do: load `Roboto_Mono` via `next/font/google` in `_app.tsx` as
    `--font-mono`; add `fontFamily.mono: ["var(--font-mono)", "monospace"]`
    to `tailwind.config.js`; typing area uses `font-mono`. Sizes:
    `text-2xl sm:text-3xl`; header/stat row stack vertically below `sm`.
    Check at 375px width: no horizontal scroll.

- [x] **6.3 Focus mode.**
  - Note: `utils/hooks/useFocusMode.ts` sets `data-focus-mode` on `<html>`; elements marked `data-focus-fade` (Layout header+nav, player-name input, timer options, hint) fade via `styles/globals.css`. Those elements are now always mounted (previously unmounted while running). Mouse move reveals until the next run; Esc restarts (status goes idle).
  - Do: while `status === "running"`, fade header, nav, `TimerOptions` and
    hint line to `opacity-0 pointer-events-none` (300ms transition). They
    return on finish, Esc, or mouse move.

- [x] **6.4 Contrast & semantics.**
  - Note: Removed per-word `aria-label` (tests now query `[data-word]`) and `role="button"`/`tabIndex`/`aria-label` on the typing area; removed redundant `aria-label="Restart test"` on RestartButton (visible text gives the same name). Small secondary text (hint, footer, result subtitle) raised to `text-slate-400`. Live region is `components/LiveAnnouncer.tsx` ("Test started", "10 seconds left", final result). axe check skipped (would need a new dev dependency); Lighthouse not run.
  - Do: idle letters → `text-slate-500` (no opacity); remove `aria-label`
    from each `Word`; remove `role="button"`/`tabIndex` from the container
    (keep click handler); give the visible words region
    `aria-hidden="true"` and add a visually hidden `aria-live="polite"`
    region that announces "Test started", "10 seconds left", and the final
    result. `TimerOptions` buttons get `aria-pressed`. All buttons get
    `focus-visible:ring-2 focus-visible:ring-[#FFD523]`.

- [x] **6.5 Reduced motion.**
  - Note: Caret inline transition is disabled via `utils/motion.ts#prefersReducedMotion()`; Tailwind `motion-safe:` used for scroll translate, blink and fade-in. `RenderStat` shows the final value immediately and cancels its rAF on unmount.
  - Do: prefix caret transition, fade-in, scroll translate and blink with
    `motion-safe:`; in `RenderStat`, if
    `matchMedia("(prefers-reduced-motion: reduce)").matches`, set the final
    value immediately. Also cancel the rAF on unmount (store the id; return
    a cleanup) — currently it leaks.

- [x] **6.6 Mobile input support.**
  - Note: Printable chars handled only in `onInput` (`insertText` per char; `deleteContentBackward` guarded against double handling after a Backspace keydown). keydown ignores `Unidentified` and composition. Used `onInput` only (not `onBeforeInput`; React's synthetic beforeinput is unreliable). Hidden input is `1px` and lives inside `TypingArea` (children). Tests: `TypingTest.input.test.tsx`. NOT verified in DevTools emulation or on a real device (note: Android soft-keyboard Backspace on an empty input may not fire an input event; composition text `insertCompositionText` is not handled).
  - Do: handle `onBeforeInput`/`onInput` on the hidden input:
    `inputType === "insertText"` → for each char of `data`: space →
    `submitWord`, else `typeChar`; `"deleteContentBackward"` → `backspace`.
    In `onKeyDown`, ignore `e.key === "Unidentified"` and `e.isComposing`.
    Guard against double handling (desktop fires both keydown and input):
    handle printable chars **only** in the input event path, keep keydown
    for Backspace/Tab/Esc/space-preventDefault. Make the hidden input
    `1px × 1px` (not `0×0`, iOS won't open the keyboard), positioned over
    the typing area. Test with Chrome DevTools device emulation; note in
    the task that a real-device check is still needed.

- [x] **6.7 Loading & empty states.**
  - Note: `TypingAreaSkeleton.tsx` renders 3 pulse lines with the same line height/gap as the text (`motion-safe:animate-pulse`). Pixel parity not verified in a browser.
  - Do: before words load, render 3 skeleton lines (`animate-pulse
    bg-white/5 rounded h-[1em]`) of the same height as the text area so
    nothing shifts.

- [x] **6.8 Result card layout.**
  - Note: `ResultCard` now takes `stats: TestStats` + `durationSeconds`; two columns on `md+`. Only the "Next test" button is rendered (Repeat 7.6 / Copy 7.7 not done); Enter/Esc unchanged; grade unchanged (7.8).
  - Do: two-column on `md+` (left: big WPM + accuracy; right: details
    grid), stacked on mobile. Details grid shows `rawWpm`, `cpm`,
    `correct/incorrect/extra/missed` chars (from 5.2 — if 5.2 isn't done,
    show only existing stats and leave a TODO), test duration. Buttons
    row: "Next test" (primary, Enter/Tab), "Repeat" (7.6), "Copy result"
    (7.7) — render only the buttons whose tasks are done. Grade: see 7.8.

**Acceptance:** Smoke script passes at 1280px and 375px widths; Lighthouse
accessibility score ≥ 95 on `/` (record score in the task note).

- [x] **6.9 Fix layout shift on load (CLS).**
  - Note: CLS 1.62 -> 0 on `/` (perf 0.73 -> 0.98). The words viewport had no height until `useCaret` measured it, so it jumped when words rendered; it now has a CSS height (`calc(3*(1.625em+0.5rem))`) and the skeleton sits inside it.

- [x] **6.10 Set html lang.**
  - Note: added `pages/_document.tsx` with `<Html lang="en">`; Lighthouse a11y `/` 95 -> 100, `/stats` 94 -> 100 (see report).

> Phase 6 acceptance NOT verified: no browser/Lighthouse available when implemented. Run the smoke script at 1280px/375px and Lighthouse on `/` manually.

---

## Phase 7 — Features

**Context:** `graft skeleton redux/paragraph.ts` · `graft skeleton utils/getWords.ts` · `graft grep "loadWords"` · `graft ask "result card stats grade" --source`.

Depends on Phase 5 and 6.1–6.4. Settings and history live in
`localStorage` behind one helper.

- [x] **7.1 Safe storage helper.**
  - File: `utils/storage.ts` with `readJSON<T>(key, fallback, isValid:
    (v: unknown) => v is T): T` and `writeJSON(key, value): void`; both
    wrap access in try/catch (private mode, quota) and SSR-guard `typeof
    window`. Keys (exact): `speedtype:v1:settings`, `speedtype:v1:history`.
    Unit-test with a mocked `localStorage` that throws.

- [x] **7.2 Settings slice.**
  - Note: Added `redux/persistSettings.ts` (`loadStoredSettings`, `startSettingsPersistence`: 300ms debounce, also flushes on `pagehide`) and `sanitizeSettings` (per-field fallback, so the legacy `{ playerName }` record hydrates cleanly). `usePlayerName` is now a thin wrapper over the slice; `StoredSettings` removed from `utils/playerName.ts`. `TypingTest` reads `timeLimit`/`difficulty` from the slice. Hydration runs in an `_app` effect (words load once with defaults, then reload if stored settings differ).
  - File: `redux/settings.ts`, mounted at `state.settings`.
  - Shape:
    ```ts
    export type TestMode = "time" | "words";
    export interface SettingsState {
      mode: TestMode;               // default "time"
      timeLimit: 15 | 30 | 60 | 120; // default 30
      wordCount: 10 | 25 | 50 | 100; // default 25
      difficulty: WordMode;         // default "mixed"
      punctuation: boolean;         // default false
      numbers: boolean;             // default false
    }
    ```
    Reducers: `setSetting` (partial update), `hydrateSettings`. Hydrate
    from storage in a `useEffect` in `_app.tsx`; persist via
    `store.subscribe` (debounced 300ms). Validate stored value with a type
    guard; fall back to defaults on mismatch. `timeLimit` local state in
    `TypingTest` is removed in favour of this slice.
  - Note (from 8.4): `playerName` already lives in `speedtype:v1:settings`
    as `{ playerName }` (written by `utils/hooks/usePlayerName.ts`). The
    slice must preserve it: add `playerName` to `SettingsState`, hydrate and
    persist it with the rest, and replace `usePlayerName` with the slice.
  - Note: this changes the duration options from 15/30/45/60 to
    15/30/60/120 — intended.

- [x] **7.3 Config bar.**
  - Note: `ConfigBar` also hosts the player-name input (moved from `TypingTest`, shown only when the stats API is enabled) and carries `data-focus-fade`. Buttons use `data-config-btn` (was `data-timer-btn`) so the typing input's blur handler still ignores them. A settings change regenerates words (effect in `TypingTest`) and resets the timer. Punctuation/numbers toggles are stored now; they affect words in 7.5.
  - File: `components/ConfigBar.tsx` (replaces `TimerOptions.tsx`; delete
    it). One pill row: `[time | words]` · values for the chosen mode ·
    `[easy | medium | hard | mixed]` · toggles `@ punctuation`, `# numbers`.
    Any change regenerates words and resets the test. Hidden during focus
    mode (6.3).

- [x] **7.4 Words mode.**
  - Note: Engine: `finishOnLastWord` lives in `EngineState` (`createEngineState(words, finishOnLastWord)`, `reset` action accepts it); the last word then counts as submitted (`activeWordIndex` = words.length). `useTimer(timeout, direction)` also returns `stop()` (freezes `elapsedMs()`) and `elapsedSeconds`. Result stats are now computed in one effect on the engine's `finished` transition for both modes (time mode: elapsed frozen at the limit). Result card duration in words mode = elapsed seconds.
  - Do: in words mode generate exactly `wordCount` words; engine gets a
    `finishOnLastWord` behaviour: `submitWord` on the last word — or typing
    the last word's final char correctly — sets `status: "finished"`.
    Timer counts **up** (`useTimer` gets `direction: "up" | "down"`). Live
    display shows `typed words / total` instead of seconds. Tests for both.

- [x] **7.5 Punctuation & numbers.**
  - Note: Signature `getWords(count, mode, options = {}, rng = Math.random)`; transform is the exported pure `applyWordOptions(words, options, rng)` (rates are exported consts). Quotes wrap the punctuated word (`"word,"`). `paragraph` state gained `options` so `refreshWords` keeps punctuation/numbers.
  - File: `utils/getWords.ts` — `getWords(count, mode, { punctuation,
    numbers })`. Punctuation: ~20% of words get one of `, . ; ! ?` appended,
    the word after `. ! ?` is capitalized, ~5% wrapped in quotes. Numbers:
    ~10% of words replaced with a 1–4 digit number. Inject randomness as a
    `rng: () => number` param (default `Math.random`) so tests can be
    deterministic.

- [x] **7.6 Repeat test.**
  - Note: `paragraph.round` is bumped by `loadWords`, `refreshWords` and `repeatWords`. The engine records the round it started in (`EngineState.round`, 3rd arg of `createEngineState`); `usePostResultOnFinish` now takes `roundId: number` = `state.round`, so Repeat (same words) posts again, and the finished test's id can't change during the one render between a new round and the engine reset (which previously could double-post). Button is on the result card; no keyboard shortcut.
  - Do: `paragraph` slice action `repeatWords` (keeps `wordsCollection`,
    bumps a `round` counter so `TypingTest` resets). Button on result card.

- [ ] **7.7 WPM-over-time chart.**
  - Do: `TypingTest` samples once per second while running:
    `{ second, wpm, rawWpm, errors }` (errors = incorrect keystrokes in
    that second) into a `useRef` array; pass to result card.
    `components/WpmChart.tsx`: inline SVG, no library; two polylines (wpm
    `#FFD523`, raw `slate-500`), red dots for seconds with errors, y-axis
    max = rounded-up max raw WPM, 3 gridlines, `<title>` with a text
    summary for screen readers. Width 100%, height 160px, `viewBox`-based.
  - Load the `dataviz` skill before building it.

- [ ] **7.8 Personal bests & history.**
  - Do: on finish, append `{ id, date (ISO), mode, limit (seconds or
    words), difficulty, wpm, rawWpm, accuracy }` to `speedtype:v1:history`
    (keep newest 100). PB = max `wpm` for the same `mode+limit+difficulty`.
    Result card shows "New personal best!" badge or "PB: 87 wpm (+/−n)".
    Grade becomes WPM-aware: `S` ≥ 80 wpm & ≥ 97% acc, `A` ≥ 60 & ≥ 94%,
    `B` ≥ 40 & ≥ 90%, `C` ≥ 25, else `D` — put thresholds in a named
    const table in `utils/getGrade.ts` with tests.

- [ ] **7.9 "Your results" on `/stats`.**
  - Do: `/stats` gets two sections: "Your results" (from history: PB per
    mode/limit table + last 20 runs list + average wpm/accuracy) — always
    shown; "Global leaderboard" — only if the API is configured (Phase 8).
    Empty state: "No tests yet — take one" linking to `/`.
    Add a "Clear history" button with a `confirm()` prompt.

- [x] **7.10 Copy result.**
  - Do: button copies `SpeedType — 72 wpm · 96% acc · 30s mixed` via
    `navigator.clipboard.writeText`; show "Copied!" for 1.5s; on failure
    show "Couldn't copy" (no silent catch).

**Acceptance:** all modes playable; settings survive reload; history/PB
visible on `/stats`; gate passes with tests for every new util.

---

## Phase 8 — Leaderboard / stats API hardening

**Context:** `graft skeleton redux/stat.ts` · `graft grep "addStatCall"` · `graft grep "NEXT_PUBLIC_API_BASE_URL"` · `graft skeleton components/GlobalStats.tsx`.

Depends on Phase 3 (3.6). Independent of 5–7 except where noted.

- [x] **8.1 Single config source.** In `redux/stat.ts` export
  `export const isStatsApiEnabled = API_BASE !== "";` and use it in
  `GlobalStats.tsx` and `ResultCard.tsx` instead of reading
  `process.env` again.
- [x] **8.2 Validate API data.** Add `isStatsInstance(v: unknown)` type
  guard in `types/types.ts`; `getStatCall` filters the response through it
  (throws if the body isn't an array). Test it.
- [x] **8.3 Post once, from the finish transition.** Remove the mount
  effect from `ResultCard`. Dispatch `addStatCall` in `TypingTest` when the
  engine transitions to `"finished"` (guard with a `useRef` holding the
  test round id so Strict Mode / re-renders can't double-post). Skip posting
  if `wpm > 300` or the test was restarted early. Remove the hard-coded
  `"Anonymous"` override; use the payload's `user`.
- [x] **8.4 Player name.** Optional name field on the result card (max 20
  chars, trimmed, default "Anonymous"), persisted in settings (add
  `playerName` to the 7.2 slice if it exists, otherwise to
  `speedtype:v1:settings` directly via 7.1). If posting already happened,
  editing the name doesn't re-post — show the name field *before* finish
  in the config bar instead if that's simpler; note the choice.
  - Done: chose the pre-finish option. `components/PlayerNameInput.tsx` is
    shown in the idle header row of `TypingTest` (only when the stats API is
    enabled); `utils/playerName.ts` sanitizes (trim, 20 chars, "Anonymous").
    Persisted via 7.1 helper (`usePlayerName`). Move it to the config bar
    in 7.3. Browser check not run.
- [x] **8.5 Leaderboard UI states.** `GlobalStats`: error state ("Couldn't
  load leaderboard" + Retry button) on `"Stats API Failed"`; sort by
  `words_per_minute` desc; show top 20 with rank column; render as a
  `<table>` with proper `<th scope="col">`.
- [x] **8.6 Abort on unmount.** Pass `signal` from `createAsyncThunk`'s
  `thunkAPI` to `fetch`; `GlobalStats` keeps the returned promise and
  calls `.abort()` in its effect cleanup.

**Acceptance:** with `NEXT_PUBLIC_API_BASE_URL` pointing at a stub that
returns 500, `/stats` shows the error state and Retry works; with no env
var, nothing network-related happens (check the Network tab).

---

## Optional / later

- [ ] **9.1 Playwright E2E smoke** covering the Smoke script (desktop +
  mobile viewport) in CI.
- [ ] **9.2 Upgrade to Next 16** (aligns with `eslint-config-next@16`); its
  own PR after Phase 4 so tests catch regressions.
- [ ] **9.3 Light theme** via CSS variables + `prefers-color-scheme`
  (requires replacing hard-coded `slate-*`/`#FFD523` with tokens first).
- [ ] **9.4 Quote mode** (type real sentences) — needs a quotes data file.

---

## Parking lot

Add things you noticed but didn't fix here, one line each, with file:line.
