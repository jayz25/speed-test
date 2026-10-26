import { useCallback, useSyncExternalStore } from "react";
import { FOCUS_KEY, readJSON, writeJSON } from "../storage";

const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const getSnapshot = () => readJSON(FOCUS_KEY, false, isBoolean);
const getServerSnapshot = () => false;

/** User-pinned focus mode (side panels, nav and stats hidden), persisted in localStorage. */
export function useFocusPreference() {
  const isPinned = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => {
    writeJSON(FOCUS_KEY, !getSnapshot());
    listeners.forEach((listener) => listener());
  }, []);
  return [isPinned, toggle] as const;
}
