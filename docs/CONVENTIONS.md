# Conventions

These are the rules to follow when adding or changing code in this repo.
Where the existing code doesn't yet follow one of these (noted inline),
don't do a drive-by fix outside the scope of what you're already touching —
track it in `REFINEMENT_PLAN.md` instead.

## Language & types

- TypeScript everywhere for new code (`.ts`/`.tsx`). `pages/_app.tsx` is
  currently untyped JS-in-.tsx (`{ Component, pageProps }` has no type
  annotation) — leave as-is unless a task specifically touches that file.
- `tsconfig.json` is moving to `"strict": true` (Phase 2 of the refinement
  plan). Once that lands, new code must satisfy strict mode — no `any`
  without a comment explaining why, no implicit nulls.
- Prefer `interface` for object shapes that represent data (matches
  `types/types.ts`), `type` for unions/aliases (matches `LetterState` in
  `TypingTest.tsx`).
- Status/phase fields (e.g. `paragraphState.status`, `statState.status`)
  should be typed as string-literal unions, not bare `string | null` — the
  current bare-string typing lets a typo like `"Stats Recieved"` pass
  type-checking silently. Tighten this whenever you touch a slice, even if
  it's not the file's main purpose.

## React / components

- Function components only, no class components.
- One component per file, default-exported, filename matches the component
  name (`ResultCard.tsx` → `ResultCard`).
- Don't define a component inside another component's function body (it's
  recreated every render). `TypingTest.tsx` currently does this for
  `TimerOptions` and `Stat` — Phase 3 of the refinement plan extracts them
  to their own files; follow that pattern for any new sub-component.
- Extract a `use*` hook when a component's `useState`/`useEffect` cluster
  implements one coherent piece of logic (a timer, a keystroke state
  machine, a scroll tracker) that could be reasoned about independently of
  rendering. `utils/hooks/useTimer.ts` is the existing example to match.
- Direct DOM manipulation (`document.getElementById`, `style.xyz =`) is
  intentional in exactly two places today: the cursor-position effect and
  the DOM helpers in `utils/removeStyling.ts`/`noBackSpace.ts` from an
  earlier implementation. Don't introduce a third pattern — either use the
  existing `useLayoutEffect`-plus-ref approach, or drive it through React
  state/props.

## Redux (`redux/`)

- One slice per file under `redux/`, combined in `redux/store.ts`.
- Thunks (`createAsyncThunk`) must check `response.ok` before treating a
  `fetch` as successful — a non-2xx response is not a thrown error, so
  `try/catch` alone doesn't catch it. (This is currently missing in
  `redux/stat.ts`'s `getStatCall`/`addStatCall`; fix is tracked in
  `REFINEMENT_PLAN.md` Phase 3 — match that fix's pattern for any new
  thunk.)
- Read env vars (like `NEXT_PUBLIC_API_BASE_URL`) at the top of the slice
  file as a `const`, not inline in each thunk — matches the existing
  `API_BASE` pattern in `redux/stat.ts`.

## Utilities (`utils/`)

- A function belongs in `utils/` only if it's pure (no DOM access, no
  React, no Redux) and independently testable. If it needs `document`/
  `window`, it's DOM logic, not a "util" — keep it in the component or a
  clearly-named file (see `removeStyling.ts` for the existing, imperfect
  precedent).
- One function (plus tightly related helpers) per file, named after the
  function (`calculateWPM.ts` exports `calculateWPM`).
- Every new pure util needs a corresponding unit test once the test runner
  lands (Phase 2/4 of the refinement plan) — don't add an eleventh
  untested `utils/*.ts` file.

## Styling

- Tailwind utility classes inline in JSX; no CSS modules, no styled-
  components. `styles/globals.css` is for global resets/font variables
  only.
- Match the existing dark-UI palette already in use (`slate-*` grays,
  `#FFD523` accent, `red-400` for errors/danger) rather than introducing new
  ad-hoc colors.

## File organization

- `components/` — React components only.
- `utils/` — pure functions; `utils/hooks/` — custom hooks.
- `redux/` — one slice per file, plus `store.ts`.
- `types/` — shared TypeScript types (currently a single `types.ts`; split
  by domain if it grows past ~100 lines).
- `pages/` — Next.js Pages Router routes; keep page components thin
  (compose from `components/`, don't inline logic).

## Formatting

- `.prettierrc` governs formatting — run Prettier (or your editor's
  format-on-save) before committing; no manual style debates.
- Once ESLint lands (Phase 2), `npm run lint` must pass before a change is
  considered done.

## Commits & scope

- Match the existing commit style seen in `git log` (short, imperative
  summary, PR number in parens when applicable).
- Keep refactors behavior-preserving unless the task explicitly asks for a
  behavior change — if you're in `REFINEMENT_PLAN.md` Phase 3, don't also
  redesign the UI or add features in the same change.
