import { useSyncExternalStore, type ComponentType } from "react";
import {
  getThemePreference, nextThemePreference, setThemePreference, subscribeTheme, type ThemePreference,
} from "../utils/theme";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

const ICONS: Record<ThemePreference, ComponentType> = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
};

/** Header button cycling the colour theme: system -> light -> dark. */
export default function ThemeToggle() {
  // Server snapshot is "system": the real preference is only known in the browser
  const preference = useSyncExternalStore(subscribeTheme, getThemePreference, () => "system" as const);
  const next = nextThemePreference(preference);
  const Icon = ICONS[preference];
  const label = `Theme: ${preference}. Switch to ${next}`;

  return (
    <button
      type="button"
      onClick={() => setThemePreference(next)}
      aria-label={label}
      title={label}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-nav-track text-ink-2 transition-colors hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Icon />
    </button>
  );
}
