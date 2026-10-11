import { formatConfig, type TestConfigKey } from "./history";

/** e.g. "SpeedType — 72 wpm · 96% acc · 30s mixed" */
export function formatResultText(stats: { wpm: number; accuracy: number }, key: TestConfigKey): string {
  return `SpeedType — ${stats.wpm} wpm · ${stats.accuracy}% acc · ${formatConfig(key)}`;
}
