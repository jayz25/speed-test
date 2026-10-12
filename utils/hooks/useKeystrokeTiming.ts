import { useCallback, useMemo, useRef } from "react";
import { summarizeKeyTimes, type KeyStat } from "../keyStats";

/** Keystroke timing for the current test; groundwork for server-side bot checks (backlog 9.5). */
export interface KeystrokeTiming {
  /** ms between consecutive keydowns */
  keySpacing: KeyStat | null;
  /** ms each key was held (keydown -> keyup) */
  keyDuration: KeyStat | null;
}

interface KeyTimingEvent {
  key: string;
  code: string;
  /** DOMHighResTimeStamp from the event */
  timeStamp: number;
  repeat?: boolean;
}

/** Characters, space, Backspace and mobile keys (soft keyboards send "Unidentified"); not Shift, Tab, arrows... */
const isTimedKey = (key: string) => key.length === 1 || key === "Backspace" || key === "Unidentified";

/**
 * Records keydown spacing and key hold durations in refs (no re-renders). Read the summary with
 * `getStats()` from an event handler or effect, and `reset()` when a new test starts.
 */
export function useKeystrokeTiming() {
  const spacing = useRef<number[]>([]);
  const durations = useRef<number[]>([]);
  const lastDownAt = useRef<number | null>(null);
  const heldSince = useRef(new Map<string, number>());

  const onKeyDown = useCallback(({ key, code, timeStamp, repeat }: KeyTimingEvent) => {
    if (repeat || !isTimedKey(key)) return;
    if (lastDownAt.current !== null) spacing.current.push(timeStamp - lastDownAt.current);
    lastDownAt.current = timeStamp;
    if (code) heldSince.current.set(code, timeStamp);
  }, []);

  const onKeyUp = useCallback(({ code, timeStamp }: KeyTimingEvent) => {
    const since = heldSince.current.get(code);
    if (since === undefined) return;
    heldSince.current.delete(code);
    durations.current.push(timeStamp - since);
  }, []);

  const reset = useCallback(() => {
    spacing.current = [];
    durations.current = [];
    lastDownAt.current = null;
    heldSince.current.clear();
  }, []);

  const getStats = useCallback((): KeystrokeTiming => ({
    keySpacing: summarizeKeyTimes(spacing.current),
    keyDuration: summarizeKeyTimes(durations.current),
  }), []);

  return useMemo(() => ({ onKeyDown, onKeyUp, reset, getStats }), [onKeyDown, onKeyUp, reset, getStats]);
}
