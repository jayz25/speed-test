# Conventions

These are the rules to follow when adding or changing code in this repo.
If you spot code that doesn't follow one of these, don't do a drive-by fix
outside the scope of what you're already touching — note it in the
"Parking lot" at the bottom of `REFINEMENT_PLAN.md` instead.

## Language & types

- TypeScript everywhere (`.ts`/`.tsx`).
- `tsconfig.json` is `"strict": true`: no `any` without a comment
  explaining why, no implicit nulls. Validate untrusted data (API
  responses, localStorage) with a type guard before use — see
  `isStatsInstance` and `redux/persistSettings.ts`.
- Prefer `interface` for object shapes that represent data (matches
  `types/types.ts`), `type` for unions/aliases (matches `LetterState` in
  `utils/typingEngine.ts`).
- Status/phase fields are string-literal unions (`ParagraphStatus`,
  `StatStatus`, `TestStatus`), never bare `string` — keep it that way for
  new ones.

## React / components

- Function components only, no class components.
- One component per file, default-exported, filename matches the component
  name (`ResultCard.tsx` → `ResultCard`).
- Don't define a component inside another component's function body (it's
  recreated every render). Give it its own file under `components/`.
- Extract a `use*` hook when a component's `useState`/`useEffect` cluster
  implements one coherent piece of logic (a timer, a keystroke state
  machine, a scroll tracker) that could be reasoned about independently of
  rendering. `utils/hooks/useTimer.ts` is the existing example to match.
- Direct DOM access is intentional in exactly two hooks:
  `utils/hooks/useCaret.ts` (caret position + line scrolling, via refs in a
  `useLayoutEffect` — React re-renders are too slow for caret feel) and
  `utils/hooks/useFocusMode.ts` (a `data-focus-mode` attribute on
  `<html>`). Never use `document.getElementById`; use refs, and keep any
  new DOM work inside a dedicated hook.

## Redux (`redux/`)

- One slice per file under `redux/`, combined in `redux/store.ts`.
- Thunks (`createAsyncThunk`) must check `response.ok` before treating a
  `fetch` as successful — a non-2xx response is not a thrown error, so
  `try/catch` alone doesn't catch it. Pass `thunkAPI.signal` to `fetch` so
  callers can abort. Match `getStatCall`/`addStatCall` in `redux/stat.ts`.
- Side effects that must happen once per test (posting a result,
  recording history) key off the engine's `round` id in a hook
  (`usePostResultOnFinish`, `useRecordResult`), not off component mounts —
  React Strict Mode double-runs mount effects.
- Read env vars (like `NEXT_PUBLIC_API_BASE_URL`) at the top of the slice
  file as a `const`, not inline in each thunk — matches the existing
  `API_BASE` pattern in `redux/stat.ts`.

## Utilities (`utils/`)

- A function belongs in `utils/` only if it's pure (no DOM access, no
  React, no Redux) and independently testable. If it needs `document`/
  `window`, it's DOM logic, not a "util" — keep it in the component or a
  clearly-named hook under `utils/hooks/`).
- One function (plus tightly related helpers) per file, named after the
  function (`calculateStats.ts` exports `calculateStats`).
- Every new util or hook needs unit tests in the sibling `__tests__/`
  folder; `npm run test:coverage` fails below 80% on `utils/` + `redux/`.
- Inject randomness/time (`rng` param, `performance.now()` behind a hook)
  so tests stay deterministic — see `getWords`/`applyWordOptions`.

## Styling

- Tailwind utility classes inline in JSX; no CSS modules, no styled-
  components. `styles/globals.css` is for global resets/font variables
  only.
- Use the design tokens defined in `styles/globals.css` `@theme` (Tailwind 4, CSS-first; there is
  no `tailwind.config.js`) (see `docs/SPEEDTYPE_REDESIGN_SPEC.md` §1):
  `bg`, `surface`, `surface-muted`, `surface-sunken`, `nav-track`, `ink`, `ink-2`,
  `muted`, `pending`, `on-dark-muted`, `border`, `divider`, `kbd-bg`, `accent`,
  `accent-soft`, `error`, `error-extra`. Never use ad-hoc hex colors or arbitrary
  utility values for semantic colors.

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

## Definition of done

A change is done when all of these pass:

```bash
npm run lint && npm run type-check && npm run test:coverage && npm run build
```

For changes that affect what users see or type, also check the real app:
`npm run build && npx next start`, then walk the Smoke script in
`REFINEMENT_PLAN.md` (a headless-Chrome Playwright run is fine), and keep
Lighthouse on `/` and `/stats` at CLS 0 and accessibility 100. Say
explicitly in your summary if a browser check wasn't done.

## Commits & scope

- Conventional commits: `<type>(<area>): <summary>` (feat, fix, refactor,
  perf, test, docs, chore, ci), one logical change per commit.
- Keep refactors behavior-preserving unless the task explicitly asks for a
  behavior change; don't mix a refactor with UI redesign or new features.
