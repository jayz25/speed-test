export const SETTINGS_KEY = "speedtype:v1:settings";
export const HISTORY_KEY = "speedtype:v1:history";
export const THEME_KEY = "speedtype:v1:theme";

/** Read and validate JSON from localStorage; returns `fallback` on any failure. */
export function readJSON<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** Write JSON to localStorage; silently a no-op when storage is unavailable or full. */
export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is optional (private mode, quota); persistence is best-effort.
  }
}
