# SpeedType — Typing Speed Test

A minimal, focused typing speed test built on Next.js 15 + React 19 with Redux Toolkit for state and Tailwind CSS for styling.

Visit [demo](https://your-deployment-url.com) to try it out.

## Features

- **Real-time WPM / CPM / Accuracy** — Live stats update as you type
- **Visual cursor tracking** — Gliding caret that follows your typing position
- **Auto-scroll** — Words automatically scroll as you progress through the text
- **Caps lock warning** — Visual alert when Caps Lock is accidentally enabled
- **Time and words modes** — 15/30/60/120 seconds or 10/25/50/100 words; difficulty (easy/medium/hard/mixed), optional punctuation and numbers
- **Persistent settings** — Your test configuration (and player name) survive reloads
- **Result card with grade** — Final stats, a WPM-aware letter grade (S/A/B/C/D), WPM-over-time chart, and personal-best badge
- **Repeat and copy** — Retry the same words, or copy a one-line summary of your result
- **Your results page** — `/stats` shows personal bests, averages and your last 20 runs (stored locally; clearable)
- **Optional stats API** — Optionally save your results to a leaderboard (opt-in via `NEXT_PUBLIC_API_BASE_URL`)

## How to run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run type checker
npm run type-check
```

## Configuration

The app uses a single environment variable to optionally enable the stats API:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api/stats
```

- Set this env var to enable posting results and viewing the global leaderboard
- The app works perfectly without it — API integration is completely optional
- For local development, you can safely ignore or leave this unset

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Main typing test — start typing, see live stats, get results |
| `/stats` | Global leaderboard (only shows if API is configured) |

## Scripts

- `dev` — Start development server
- `build` — Build optimized production app
- `start` — Start production server (use after `build`)
- `type-check` — Run TypeScript type checker (separate from dev)
- `lint` — Run ESLint
- `test` — Run unit tests (Vitest)

Package manager: npm (`package-lock.json`).
