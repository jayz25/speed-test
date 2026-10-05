import { readJSON, SETTINGS_KEY, writeJSON } from "../utils/storage";
import { sanitizeSettings, SettingsState } from "./settings";

export const PERSIST_DEBOUNCE_MS = 300;

const isObject = (v: unknown): v is object => typeof v === "object" && v !== null;

/** Reads and validates stored settings (defaults for anything missing or invalid). */
export function loadStoredSettings(): SettingsState {
  return sanitizeSettings(readJSON<object>(SETTINGS_KEY, {}, isObject));
}

interface SettingsStore {
  getState: () => { settings: SettingsState };
  subscribe: (listener: () => void) => () => void;
}

/** Saves `state.settings` (debounced) whenever it changes; returns an unsubscribe. */
export function startSettingsPersistence(store: SettingsStore, delayMs = PERSIST_DEBOUNCE_MS): () => void {
  let last = store.getState().settings;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timer === null) return;
    clearTimeout(timer);
    timer = null;
    writeJSON(SETTINGS_KEY, store.getState().settings);
  };

  const unsubscribe = store.subscribe(() => {
    const current = store.getState().settings;
    if (current === last) return;
    last = current;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(flush, delayMs);
  });
  window.addEventListener("pagehide", flush);

  return () => {
    unsubscribe();
    window.removeEventListener("pagehide", flush);
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
}
