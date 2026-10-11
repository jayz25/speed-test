# SpeedType — Test screen redesign ("Instrument Panel")

Spec for the redesigned typing-test screen. The redesign is implemented; this file is kept
as the reference for the design tokens (§1) and acceptance checks (§6). It was originally
ported from an HTML prototype (`speedtype-prototype-reference.html`, since removed; see git
history before the "remove completed redesign plan and prototype" commit).

## Instructions for the implementer

1. Read the existing test page first. Reuse whatever typing logic, word lists and stats already
   work; replace the UI, and add behaviour from this spec that's missing.
2. Use the project's existing styling approach (Tailwind / CSS modules / etc.). Put the colors
   below into the theme/tokens rather than hard-coding them in many places.
3. Load fonts with `next/font/google`.
4. Keep the Test / Stats navigation and routes as they are.
5. Work on a new branch; don't remove existing features without asking.

---

## 1. Design tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| `bg` | `#E8EAED` | Page background |
| `surface` | `#FFFFFF` | Typing card, buttons, inactive chips |
| `surface-muted` | `#F6F7F8` | Settings panel, small stat tiles, chart background |
| `surface-sunken` | `#E3E5E9` | Mode segmented-control track |
| `nav-track` | `#DADDE2` | Nav pill track |
| `ink` | `#16181D` | Primary text, correct letters, dark WPM tile, primary button |
| `ink-2` | `#3B404A` | Inactive button text |
| `muted` | `#5A606C` | Labels, captions, hints |
| `pending` | `#6B7180` | Not-yet-typed letters (≥4.5:1 on white) |
| `on-dark-muted` | `#A3A9B4` | Label on the dark WPM tile |
| `border` | `#D5D8DD` | Chip/button borders, kbd borders |
| `divider` | `#ECEEF1` | Card divider lines, progress track |
| `kbd-bg` | `#F1F2F4` | `<kbd>` background |
| `accent` | `#FF5A1F` | Brand accent: "Type" in logo, progress fill, caret, sparkline, selected-chip border |
| `accent-soft` | accent at 12% alpha (`#FF5A1F1F`) | Selected-chip fill, chart area fill, armed-Tab highlight |
| `error` | `#C2410C` | Wrong letters, wrong-word underline, Errors/Wrong numbers |
| `error-extra` | `#9A3412` | Extra letters typed past a word's end |

Alternative accents explored (optional theme setting): `#2563EB`, `#F5B800`, `#0F9D76`.

### Typography
- **UI / display:** `Schibsted Grotesk` — weights 400, 500, 600, 700, 800. Fallback `ui-sans-serif, system-ui, sans-serif`.
- **Words, timer, numeric chips, kbd, chart axes:** `IBM Plex Mono` — 400, 500, 600. Fallback `ui-monospace, monospace`.

| Element | Font | Size / line-height | Weight | Other |
|---|---|---|---|---|
| Logo "SpeedType" | Schibsted | 22px | 800 | letter-spacing −0.03em; "Type" in accent |
| Nav links | Schibsted | 15px | 600 active / 500 | |
| Section labels (MODE, DURATION…) | Schibsted | 12px | 600 | uppercase, letter-spacing 0.08em, `muted` |
| Buttons / chips | Schibsted (duration chips: Plex Mono) | 14px | 600 selected / 400 | |
| Checkbox labels | Schibsted | 15px | 400 | |
| Test words | Plex Mono | 30px / 44px | 400 | |
| Timer | Plex Mono | 28px | 600 | |
| Live WPM (dark tile) | Schibsted | 88px / 1 | 800 | letter-spacing −0.04em |
| Small stat values | Schibsted | 30px | 700 | letter-spacing −0.02em |
| Results WPM | Schibsted | 112px / 0.9 | 800 | letter-spacing −0.05em |
| Results accuracy | Schibsted | 48px / 1 | 700 | |
| Results tiles | Schibsted | 26px | 700 | |
| Hints / captions | Schibsted | 13–14px | 400 | `muted` |

### Radii, spacing, shadow
- Radii: page cards **20px**; stat tiles 16px (results tiles 14px); buttons/chips 10–12px; segmented inner buttons 9px; kbd 6px; pills 999px.
- Typing card shadow: `0 1px 2px rgba(22,24,29,.06), 0 12px 32px -12px rgba(22,24,29,.12)`.
- All interactive targets ≥ **44px** tall.
- Icons: inline stroke SVG (lucide-style), stroke-width 2, 18px. No emoji.

---

## 2. Layout

```
┌ header (max-width 1360, padding 24px 32px) ─────────────────────────────┐
│ SpeedType                                              [ Test | Stats ] │
└─────────────────────────────────────────────────────────────────────────┘
┌ main (max-width 1360, padding 40px 32px 48px, flex-wrap, gap 20) ───────┐
│ ┌ Settings ┐ ┌ Typing card / Results ───────────────┐ ┌ Live stats ┐   │
│ │ 220–260px│ │ flex: 999 1 560px; min-width 0        │ │ 240–280px  │   │
│ └──────────┘ └───────────────────────────────────────┘ └────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```
- Three columns via flex-wrap: settings `flex: 1 1 220px; max-width: 260px`, center `flex: 999 1 560px; min-width: 0`, stats `flex: 1 1 240px; max-width: 280px`, `align-items: flex-start`.
- Narrow screens: columns wrap and stack naturally; no horizontal scroll.
- Header: logo left; nav is a segmented pill (track `nav-track`, 4px padding, radius 12; active link white bg, radius 9, padding 10px 18px).

---

## 3. Components

### 3.1 Settings panel (`aside`, aria-label "Test settings")
`surface-muted`, radius 20, padding 24, vertical gap 24. Groups, each = label + control:

1. **Mode** — 2-col segmented control on `surface-sunken` track (padding 4, radius 12). Options **Time / Words**. Selected: `ink` bg, white text, 600. Unselected: transparent, `ink-2`, 500.
2. **Duration (seconds)** (Time mode: 15 · 30 · 60 · 120) / **Length (words)** (Words mode: 10 · 25 · 50 · 100) — 4-col grid of chips, mono font.
3. **Difficulty** — 2×2 grid: Easy · Medium · Hard · Mixed.
4. **Include** — two rows, label left + native checkbox right (20×20, `accent-color: ink`): Punctuation, Numbers.

Chip style: 1px `border`, white bg, radius 10. **Selected chip:** 1px `accent` border, `accent-soft` bg, weight 600. Use real `<button aria-pressed>`.

Behaviour: any change resets the test (new state, same seed unless noted). Switching mode sets size to the default (time 30, words 25). While a test is running the panel is at **opacity 0.55** (still clickable; clicking resets).

Defaults: Time, 30s, Mixed, no punctuation, no numbers.

### 3.2 Typing card (`section`, aria-label "Typing test")
White, radius 20, padding 40px 44px, gap 28, shadow above.

**a) Timer row** (mono): timer text (28px/600, min-width 72) · progress track (flex 1, 8px tall, radius 4, `divider`) with `accent` fill · goal text (14px `muted`).
- Time mode: timer = remaining `m:ss` (ceil), goal = `30s`, progress = elapsed/duration.
- Words mode: timer = `currentWordIndex/total` (e.g. `4/25`), goal = elapsed seconds, progress = index/total.

**b) Words area**
- Box: height **216px** (≈4 lines), `overflow: hidden`, `position: relative`, flex-wrap, column-gap 18px, row-gap 10px, mono 30/44.
- Each word = inline-flex, no wrap; each letter a span.
- Letter colors: untyped `pending`; correct `ink`; wrong `error`; extra letters (typed beyond the word) appended to the word in `error-extra`.
- A *completed* word that doesn't exactly match gets an underline: `error`, 2px thick, offset 9px.
- **Caret:** 3px accent bar drawn as `box-shadow: inset 3px 0 0 accent` on the next letter; if the current word is fully typed (or overtyped), `inset -3px 0 0 accent` on its last letter. Only show while the input is focused.
- **Auto-scroll:** after each update, find the caret letter and set the box's `scrollTop = max(0, caret.offsetTop − 54)` so the active line stays as line 2.
- Render only words up to `currentIndex + 60` for performance.

**c) Hidden input** — a real `<input aria-label="Type the words shown">` absolutely covering the words box, `opacity: 0`, transparent caret, `autocomplete/autocapitalize off`, `spellcheck=false`. Controlled `value = typed`. Clicking the words focuses it. (Do not use a global window keydown listener.)

**d) Focus prompt** — when the input is not focused and the test hasn't started: words box gets `filter: blur(3px)` and a centered pill overlay (`ink` bg, white 15px/600, padding 12px 20px, mouse-pointer icon) reading **"Click here to start typing"**, `pointer-events: none`.

**e) Footer row** — top border `divider`, padding-top 20, space-between:
- Left: **Restart** button (white, 1px border, radius 12, 44px tall, rotate-ccw icon + label) → new words (seed+1), refocus input.
- Right: hint `<kbd>tab</kbd> + <kbd>enter</kbd> to restart`. When Tab has been pressed (armed), the `tab` kbd background turns `accent-soft`.

### 3.3 Live stats (`aside`, aria-label "Live stats")
Gap 12.
- **Dark tile** (`ink` bg, white, radius 20, padding 24): label "WORDS / MIN" (`on-dark-muted`), value 88px/800, then a **sparkline** SVG (full width × 56px, `preserveAspectRatio="none"`, polyline stroke `accent` 2.5px, round joins, `vector-effect: non-scaling-stroke`), one point per elapsed second. `role="img"` with aria-label.
- **2×2 grid of tiles** (`surface-muted`, radius 16, padding 18px 20px): Accuracy (`96%`), CPM, Errors (value in `error`), Words (correct words).
- Before the test starts, all values show an em dash `—`.

### 3.4 Results view (replaces the typing-card content when the test ends)
Same white card, gap 28.
1. **Headline row** (space-between, wrap): WPM block (label + 112px number) and Accuracy block (label + 48px) side-by-side with gap 40; right side a summary line in `muted` 14px: e.g. `30 seconds · mixed · punctuation · numbers`.
2. **Chart** `<figure>`, caption "SPEED OVER THE TEST" (label style). Y-axis labels (max, 0; mono 12px `muted`) left of an SVG (full width × 160, viewBox 600×160, `surface-muted` bg, radius 12). Area polygon filled `accent-soft` + polyline stroke `accent` 2.5px. X labels `0s` … `{duration}s` below. Y max = `max(40, max(series))`. Points: `x = i * width/(n−1)`, `y = h − 4 − (v/max)·(h − 12)`.
3. **Tiles** grid `repeat(auto-fit, minmax(min(140px,100%), 1fr))`, gap 12: CPM · Correct · Wrong (value in `error`) · Extra · Missed (character counts).
4. **Actions** (top border `divider`, padding-top 20, gap 12): primary **Next test →** (`ink` bg, white, 48px, radius 12) → new words; secondary **Repeat same words** (white, bordered, rotate icon) → same seed.

The live stats column stays visible showing final numbers.

---

## 4. Behaviour & logic (port from the prototype script)

### State
`mode ('time'|'words')`, `size`, `difficulty ('easy'|'medium'|'hard'|'mixed')`, `punct`, `nums`, `seed`, `typed` (string), `startedAt`, `now`, `finished`, `keys`, `correctKeys`, `series` (wpm per second), `focused`, `tabArmed`.

### Word generation
- Deterministic PRNG (xorshift seeded from `seed`) so "Repeat same words" reproduces the text.
- Pool by difficulty; Mixed = all pools combined. No word repeated twice in a row.
- Count: Words mode = `size`; Time mode = 300 (enough for 120s).
- Numbers on: ~12% of tokens become a random integer 0–999.
- Punctuation on: capitalize the first word and the word after `.`/`?`; append `.` (8%), `,` (8%), `?` (3%), `;` (2%).
- Memoize by `[mode,size,difficulty,punct,nums,seed]`.
- (Reuse the app's existing word lists if it has better ones.)

### Input handling (`onChange`)
- Normalize: collapse whitespace runs to one space; strip a leading space. Ignore if unchanged (prevents double-space).
- Don't allow typing beyond the last word.
- For each newly appended character: `keys++`; it's correct if it equals the expected letter at that position — or, for a space, if the current word exactly matches the target. Correct → `correctKeys++`. Backspace allowed, including back into previous words; backspacing doesn't change key counts.
- First character starts the test: set `startedAt = now`, start a 200ms interval.

### Timer
Every 200ms: update `now`; for each whole elapsed second not yet recorded, push the current WPM into `series`. Time mode: when elapsed ≥ duration → `finished = true`, clamp `now` to `startedAt + duration`, clear interval. Clear on unmount.

Words mode ends when the last word is typed exactly (or a space is typed after it); fill `series` up to the elapsed seconds and finish.

### Stats (computed from `typed` vs target)
- `correctChars` = for each completed word that matches exactly: `len + 1` (the space); for the current word, its length if it's a correct prefix.
- `elapsed` = seconds since start (capped at duration in Time mode).
- **WPM** = `round(correctChars / 5 / (elapsed/60))` (0 if elapsed < 0.5s).
- **CPM** = `round(correctChars / (elapsed/60))`.
- **Accuracy** = `round(correctKeys / keys × 100)` (100 if no keys).
- **Errors** = `keys − correctKeys`.
- **Words** = number of typed words exactly matching their target.
- Results character counts: correct / wrong (wrong letter within word length) / extra (beyond word length) / missed (untyped letters in completed words).

### Keyboard
On the input's `onKeyDown`: `Tab` → preventDefault, set `tabArmed`. `Enter` while armed → restart with new words and refocus. Any other key clears `tabArmed`. Blur clears it too.

### Reset
Clears `typed, startedAt, now, finished, keys, correctKeys, series, tabArmed`, stops the interval, optionally applies a settings patch / new seed, then refocuses the input (`setTimeout(…, 30)`).

---

## 5. Accessibility checklist
- Real `<button>`, `<a href>`, `<input>`+`<label>` everywhere; `aria-pressed` on toggle chips; `aria-current="page"` on active nav.
- Icon-only or decorative SVGs `aria-hidden="true"`; charts `role="img"` + descriptive `aria-label`.
- Text contrast ≥ 4.5:1 (the token values above already meet it on their intended backgrounds).
- Hit targets ≥ 44px.
- Error vs correct letters differ in lightness, not just hue.

## 6. Acceptance checks
- Typing a correct word turns letters `ink`; a typo shows `error`; overtyping shows extra letters; skipping with space underlines the word.
- Caret follows typing and the text scrolls so the active line stays on line 2.
- 30s test ends at 0:00 and shows results; chart has ~30 points.
- Words mode (25) ends after the 25th word.
- Tab then Enter restarts with new words; "Repeat same words" restarts with identical text.
- Changing any setting mid-test resets it.
- Layout stacks cleanly at 390px width with no horizontal scroll.
