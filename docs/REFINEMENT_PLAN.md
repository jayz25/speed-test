# Refinement Plan

Status key: `[ ]` not started · `[~]` in progress · `[x]` done.

This plan is phased so any agent (human or AI) can pick up **one phase**
without needing the others done first, except where a dependency is called
out explicitly. Read `ARCHITECTURE.md` before starting any phase.

**Out of scope for this plan** (don't do these unless separately asked):
visual/UX redesign (a UI revamp just shipped — see commit `753e148`), new
product features (accounts, persistence beyond the existing optional stats
API, multiplayer).

---

## Phase 1 — Documentation & dead-code cleanup

Goal: make the repo's actual purpose and structure discoverable, and remove
code that has no callers so it stops confusing readers (including future
agents).

- [x] Rewrite root `README.md`. It is currently the unmodified
  `create-next-app --example with-typescript` boilerplate and describes
  none of this project. Replace with: what the app is (one paragraph),
  `npm run dev`/`build`/`start`/`type-check` scripts, the
  `NEXT_PUBLIC_API_BASE_URL` env var and what it enables, and a link to
  `docs/README.md`.
- [x] Add `.env.example` with `NEXT_PUBLIC_API_BASE_URL=` (empty, commented
  as optional — the app works without it per `components/GlobalStats.tsx`'s
  existing guard).
- [x] Delete `components/List.tsx`, `components/ListDetail.tsx`,
  `components/ListItem.tsx` — verified unused via repo-wide grep (only
  self-references and the internal `List.tsx` → `ListItem.tsx` import;
  nothing in `pages/` or elsewhere imports `List` or `ListDetail`).
- [x] Remove the unused `TypingStats` interface from `types/types.ts`
  (verified zero references outside its own definition). If you find a
  reason to keep it (e.g. a planned state-consolidation refactor), leave a
  comment explaining why instead of deleting.
- [x] Decide the fate of `pages/about.tsx`: it's unlinked from any nav and
  still has `create-next-app` placeholder copy ("This is the about page")
  and title ("Next.js + TypeScript Example"). Either delete it, or rewrite
  it as a real about page for this app — don't leave it as-is.
- [x] Confirm actual usage of `utils/noBackSpace.ts`, `utils/removeStyling.ts`,
  `utils/scrollHelpers.ts`, and the smaller stat helpers
  (`getAccurateChars.ts`, `getAccurateWords.ts`, `getGrossWpm.ts`,
  `getTotalCharacters.ts`, `getWordsTyped.ts`) via repo-wide grep for each
  exported name. Delete any with zero live callers; document the rest's
  call sites in `ARCHITECTURE.md` if not already accurate.

**Acceptance:** `README.md` describes this app; no unused component/type
files remain; `npm run build` still succeeds.

**Status:** ✅ Complete

---

## Phase 2 — Tooling baseline

Goal: get automated checks in place *before* Phase 3's refactor, so
regressions are caught rather than shipped.

- [ ] **Pick one lockfile.** Both `yarn.lock` and `package-lock.json` are
  committed. Determine which package manager is actually used (check any
  CI/deploy config, ask the maintainer if ambiguous), delete the other
  lockfile, and note the choice in `README.md`.
- [ ] **ESLint.** Add `eslint-config-next` (matches the Next.js 15 / React
  19 stack already in `package.json`), a minimal `.eslintrc.json` extending
  `next/core-web-vitals`, and an `"lint": "next lint"` script in
  `package.json`. Fix or explicitly suppress (with a comment) whatever it
  flags — do not mass-disable rules to get to a clean run.
- [ ] **Test runner.** Add Vitest (lighter/ESM-native, fits this Next
  15/React 19 + TS stack better than Jest here) with
  `@testing-library/react` for later component tests. Add a `"test": "vitest run"`
  script. No test files yet — that's Phase 4 — just get the runner wired
  and able to execute an empty/smoke test.
- [ ] **`tsconfig.json` strict mode.** Flip `"strict": false` → `true`.
  Fix the resulting compiler errors file by file (expect issues around
  implicit `any` in a few `utils/` files and possibly `redux/stat.ts`'s
  loosely-typed `state.status` strings). Do this as its own commit/PR,
  separate from ESLint, so a strict-mode regression is easy to bisect.
- [ ] **CI.** Add `.github/workflows/ci.yml` running on push/PR: install →
  `npm run lint` → `npm run type-check` → `npm run test` → `npm run build`.
  This is the payoff for everything else in this phase — without it, the
  new lint/test/strict-mode setup will silently rot.

**Dependency:** none on Phase 1, but do Phase 1's dead-code deletions first
if possible — otherwise strict-mode/lint will flag dead files you're about
to delete anyway.

**Acceptance:** `npm run lint`, `npm run type-check`, `npm run test`, and
`npm run build` all succeed locally and in CI on a fresh clone.

---

## Phase 3 — Behavior-preserving refactor

Goal: split `components/TypingTest.tsx` (currently ~385 lines covering
timer orchestration, a keystroke state machine, DOM cursor tracking,
auto-scroll, and rendering) into independently-testable units, and fix the
one known correctness gap in the Redux layer. **No behavior changes** — the
app should look and feel identical after this phase.

**Do this after Phase 2**, so the split is covered by tests/CI as it
happens rather than verified by hand.

- [ ] Extract a `useTypingEngine` hook (suggested location:
  `utils/hooks/useTypingEngine.ts`) owning: `activeWordIndex`,
  `activeLetterIndex`, `wordStates`, `wordsMatched`, `wordsIncorrect`,
  `charsMatched`, `isStarted`, `isFinished`, and the `handleKeyDown` state
  machine currently in `TypingTest.tsx` lines ~47-214. It should take
  `words: string[]` and return the state plus the keydown handler and a
  reset function.
- [ ] Extract a `useCursorTracker` hook (suggested:
  `utils/hooks/useCursorTracker.ts`) owning the `useLayoutEffect`-based
  cursor positioning (lines ~101-121) and the auto-scroll effect (lines
  ~123-134). Takes the refs it needs as arguments; no dependency on the
  typing-engine hook's internals beyond the indices it's already passed.
- [ ] Extract `TimerOptions` and `Stat` (currently defined inside
  `TypingTest`'s function body, lines ~254-269 and ~387-392) into their own
  files under `components/` (`components/TimerOptions.tsx`,
  `components/Stat.tsx`), each taking props instead of closing over
  `TypingTest`'s local variables.
- [ ] After extraction, `TypingTest.tsx` should be reduced to composition:
  call the two hooks, render the extracted components plus the
  word/letter markup that's specific to this component.
- [ ] Fix `redux/stat.ts`: both `getStatCall` and `addStatCall` must check
  `response.ok` and throw (so the thunk's `.rejected` case fires) on a
  non-2xx response, instead of silently resolving with a bad/empty body.
- [ ] Tighten `paragraphState.status`/`statState.status` from `string |
  null` to a literal union matching the actual strings assigned in
  `redux/paragraph.ts`/`redux/stat.ts` (e.g. `"idle" | "ready"`,
  `null | "Loading Stats" | "Stats Received" | "Stats API Failed" | ...`).

**Acceptance:** manual smoke test of a full typing session (start, type
correctly, type incorrectly, backspace, let the timer expire, see the
result card, restart) behaves identically to before the refactor; all
Phase 2 checks still pass.

---

## Phase 4 — Test coverage

Goal: lock in behavior for the pure logic and the newly-extracted hook so
future changes (including further refactors) are safe.

**Depends on Phase 2** (test runner must exist) and benefits from **Phase 3**
being done first (the extracted `useTypingEngine` is far easier to test in
isolation than the logic embedded in the full component).

- [ ] Unit tests for every pure function in `utils/`: `calculateWPM`,
  `calculateCPM`, `calculateAccuracy`, `getWords` (including the
  `fisherYatesShuffle` behavior — deterministic output length, only
  reorders, never invents/drops words), and any of `getAccurateChars`/
  `getAccurateWords`/`getGrossWpm`/`getTotalCharacters`/`getWordsTyped`
  still in use after Phase 1's cleanup.
  - Cover edge cases: zero elapsed time, zero words typed, `count` greater
    than the word pool size (the "cycle through again" branch in
    `getWords.ts`).
- [ ] Unit tests for `utils/hooks/useTimer.ts`: starts at the given
  timeout, counts down to exactly 0 (not negative), double-`start()` is a
  no-op while running, `reset()` clears any pending interval.
- [ ] Unit tests for `useTypingEngine` (once extracted in Phase 3): correct
  word submit, incorrect word submit, backspace behavior, boundary at the
  last word/letter.
- [ ] Add these to the CI workflow's existing `npm run test` step (already
  wired in Phase 2 — no new CI changes needed if Phase 2 landed first).

**Acceptance:** `npm run test` covers all of `utils/` plus the extracted
hook(s); CI is green.

---

## Notes for whoever picks this up

- Each phase is independently approvable/committable — don't bundle two
  phases into one PR unless they're trivially small together.
- If you discover a phase's scope was wrong once you're inside it (e.g. a
  "dead" file in Phase 1 turns out to have a caller you missed), stop, note
  it in this file, and adjust the plan rather than silently expanding
  scope.
- Update `ARCHITECTURE.md` in the same change if a phase changes the shape
  described there (e.g. Phase 3 splitting `TypingTest.tsx`).
