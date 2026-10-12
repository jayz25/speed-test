import { THEME_KEY, readJSON, writeJSON } from "./storage";

export const THEME_PREFERENCES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

/** Set on <html> for an explicit choice; absent means "follow the OS" (CSS media query). */
export const THEME_ATTR = "data-theme";

const DEFAULT_PREFERENCE: ThemePreference = "system";

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function nextThemePreference(current: ThemePreference): ThemePreference {
  const index = THEME_PREFERENCES.indexOf(current);
  return THEME_PREFERENCES[(index + 1) % THEME_PREFERENCES.length];
}

export function applyThemePreference(preference: ThemePreference, root: HTMLElement = document.documentElement): void {
  if (preference === "system") root.removeAttribute(THEME_ATTR);
  else root.setAttribute(THEME_ATTR, preference);
}

/**
 * Inlined in <head> by `_document` so an explicit theme applies before first paint (no flash).
 * Must stay dependency-free; mirrors `THEME_KEY` and `applyThemePreference`.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem(${JSON.stringify(THEME_KEY)}));if(t==="light"||t==="dark")document.documentElement.setAttribute(${JSON.stringify(THEME_ATTR)},t)}catch(e){}})()`;

// Tiny external store for useSyncExternalStore: the preference lives outside React
// because the init script applies it before hydration.
let cached: ThemePreference | null = null;
const listeners = new Set<() => void>();

export function getThemePreference(): ThemePreference {
  if (cached === null) cached = readJSON(THEME_KEY, DEFAULT_PREFERENCE, isThemePreference);
  return cached;
}

export function setThemePreference(preference: ThemePreference): void {
  cached = preference;
  writeJSON(THEME_KEY, preference);
  applyThemePreference(preference);
  listeners.forEach((listener) => listener());
}

/** Another tab changed the preference: adopt it so every open tab stays in sync. */
function handleStorage(event: StorageEvent): void {
  if (event.key !== THEME_KEY) return;
  cached = readJSON(THEME_KEY, DEFAULT_PREFERENCE, isThemePreference);
  applyThemePreference(cached);
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
  };
}

export function resetThemeStoreForTests(): void {
  cached = null;
  listeners.clear();
  window.removeEventListener("storage", handleStorage);
}
