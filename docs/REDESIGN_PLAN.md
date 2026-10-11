# Redesign plan — "Instrument Panel" test screen

Branch: `redesign/instrument-panel`. Source of truth for visuals/behaviour:
`docs/SPEEDTYPE_REDESIGN_SPEC.md` (+ `docs/speedtype-prototype-reference.html`
for exact inline styles). This file records **how** we port it onto the
existing app and the interfaces between the work packages.

## Decisions

- **Keep the engine.** `utils/typingEngine.ts`, `useTypingEngine`, `useTimer`,
  `calculateStats`, `wpmSamples`, `getWords`/`redux/paragraph` already
  implement the spec's logic (letter states, extra letters, wrong-word
  underline, keystroke accuracy, per-second samples, repeat = same words).
  No new PRNG/string-diff engine. Stat mapping: Errors =
  `state.incorrectKeystrokes`, Words = `getWordCounts(state).wordsMatched`.
- **Keep the existing input handling** (`onKeyDown` + `onInput`, mobile-safe)
  instead of the prototype's controlled `onChange`; the input now covers the
  words box (`absolute inset-0 opacity-0`), aria-label "Type the words shown".
- **Tab + Enter** becomes `tabArmed` state on the input (replaces the
  `getElementById("reset-btn")` focus hack). Esc-restart is kept.
- **Caret** = `box-shadow` on the letter (`shadow-caret-before` /
  `shadow-caret-after` on the last letter when the word is fully typed), only
  while focused. `useCaret` is rewritten to just scroll the words box:
  `scrollTop = max(0, caret.offsetTop − 54)`. Box is 216px tall.
  Render words only up to `activeWordIndex + 60`.
- **Focus mode**: settings panel dims to `opacity-55` while running (still
  clickable, clicking resets). `useFocusMode` stays for the header only.
- **Existing extras kept**: Caps Lock alert, player name (moved into the
  settings panel), personal-best badge + Copy result (on the results view),
  live-region announcements, stats page.
- **Styling**: Tailwind tokens in `tailwind.config.js` (done): colors `bg`,
  `surface`, `surface-muted`, `surface-sunken`, `nav-track`, `ink`, `ink-2`,
  `muted`, `pending`, `on-dark-muted`, `border`, `divider`, `kbd-bg`,
  `accent`, `accent-soft`, `error`, `error-extra`; `shadow-card`,
  `shadow-caret-before|after`, `rounded-card` (20px); `font-sans` =
  Schibsted Grotesk, `font-mono` = IBM Plex Mono (loaded in `_app.tsx`,
  done). Use arbitrary values (`text-[88px]`, `tracking-[-0.04em]`) for
  one-off sizes. No hex literals in components.
- Icons: inline lucide-style SVGs, `aria-hidden`, 18px, stroke 2 — put them in
  `components/icons.tsx` (named exports `RotateCcwIcon`, `ArrowRightIcon`,
  `MousePointerIcon`).

## Work packages & interfaces

| WP | Owner | Files |
|---|---|---|
| A | haiku | `Layout.tsx` (header/nav per spec §2, light `bg`, `aria-current`), stats page + `YourResults`/`GlobalStats`/`CapsLockAlert`/`TypingAreaSkeleton`/`RenderStat` recolor to light tokens; docs (`CONVENTIONS.md` styling section, `ARCHITECTURE.md`) |
| B | sonnet | `SettingsPanel.tsx` (replaces `ConfigBar.tsx`, delete it + move its test), `LiveStatsPanel.tsx`, `Sparkline.tsx`, `icons.tsx` |
| C | sonnet | `ResultCard.tsx`, `WpmChart.tsx` restyle per spec §3.4 |
| D | sonnet | `TypingTest.tsx`, `TypingArea.tsx`, `Word.tsx`, `FocusOverlay.tsx`, new `TimerRow.tsx`, `useCaret.ts` rewrite |

Interfaces (default exports):

```ts
// B
SettingsPanel({ isDimmed }: { isDimmed: boolean })        // reads/writes state.settings like ConfigBar did; includes PlayerNameInput
LiveStatsPanel({ stats, series }: {
  stats: { wpm: number; cpm: number; accuracy: number; errors: number; words: number } | null; // null => "—"
  series: readonly number[];                                // wpm per elapsed second
})
Sparkline({ values }: { values: readonly number[] })
// icons.tsx: RotateCcwIcon, ArrowRightIcon, MousePointerIcon (named)

// C — ResultCard keeps its current props, plus:
options: { punctuation: boolean; numbers: boolean }       // for the summary line
// Renders INSIDE the white card section owned by TypingTest (no outer card styling).

// D
TimerRow({ label, progress, goal }: { label: string; progress: number /*0..1*/; goal: string })
```

Page layout (owned by D in `TypingTest.tsx`): `main` flex-wrap gap-5 with
`SettingsPanel` | `section aria-label="Typing test"` (white card; typing UI or
`ResultCard`) | `LiveStatsPanel` (final numbers after finish). The page wrapper
(`pages/index.tsx`/`Layout`) must not constrain width below 1360px.

## Done when

`npm run lint && npm run type-check && npm run test:coverage && npm run build`
pass, and the spec §6 acceptance checks pass in a real browser (incl. 390px).
