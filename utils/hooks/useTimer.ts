import { useCallback, useEffect, useRef, useState } from "react";

export const TIMER_TICK_MS = 100;
const DEFAULT_LIMIT_SECONDS = 60;
const MS_PER_SECOND = 1000;

export type TimerDirection = "up" | "down";

/** Whole seconds to display: remaining (down, ends at 0) or elapsed (up). */
export function getDisplaySeconds(elapsedMs: number, limit: number, direction: TimerDirection): number {
  return direction === "up"
    ? Math.floor(elapsedMs / MS_PER_SECOND)
    : Math.max(0, Math.ceil(limit - elapsedMs / MS_PER_SECOND));
}

/**
 * Timer based on a start timestamp (not tick counting), so it never drifts.
 * Counts down to 0 (time mode, `limit` seconds) or up without end (words mode).
 * State only changes when a displayed whole second changes.
 */
const useTimer = (timeout: number, direction: TimerDirection = "down") => {
  const limit = timeout || DEFAULT_LIMIT_SECONDS;
  const limitRef = useRef(limit);
  const directionRef = useRef(direction);
  useEffect(() => {
    limitRef.current = limit;
    directionRef.current = direction;
  }, [limit, direction]);

  const initialSeconds = direction === "up" ? 0 : limit;
  const [seconds, setSeconds] = useState(initialSeconds);
  // Reset the display when the configured limit/direction changes (adjust-state-during-render)
  const [prevInitialSeconds, setPrevInitialSeconds] = useState(initialSeconds);
  if (prevInitialSeconds !== initialSeconds) {
    setPrevInitialSeconds(initialSeconds);
    setSeconds(initialSeconds);
  }
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const frozenElapsedRef = useRef(0);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const elapsedMs = useCallback(() => {
    if (startedAtRef.current === null) return frozenElapsedRef.current;
    return performance.now() - startedAtRef.current;
  }, []);

  /** Freezes `elapsedMs()` at its current value and stops ticking. */
  const stop = useCallback(() => {
    if (startedAtRef.current !== null) {
      frozenElapsedRef.current = performance.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    clearTick();
  }, [clearTick]);

  const start = useCallback(() => {
    if (intervalRef.current) return; // prevent double-start
    startedAtRef.current = performance.now();
    frozenElapsedRef.current = 0;
    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - (startedAtRef.current ?? 0);
      const isDown = directionRef.current === "down";
      const next = getDisplaySeconds(elapsed, limitRef.current, directionRef.current);
      const whole = Math.floor(elapsed / MS_PER_SECOND);
      setSeconds((prev) => (prev === next ? prev : next));
      setElapsedSeconds((prev) => {
        const value = isDown ? Math.min(whole, limitRef.current) : whole;
        return prev === value ? prev : value;
      });
      if (isDown && next === 0) {
        frozenElapsedRef.current = limitRef.current * MS_PER_SECOND;
        startedAtRef.current = null;
        clearTick();
      }
    }, TIMER_TICK_MS);
  }, [clearTick]);

  const reset = useCallback((newTimeout?: number) => {
    clearTick();
    startedAtRef.current = null;
    frozenElapsedRef.current = 0;
    setElapsedSeconds(0);
    setSeconds(directionRef.current === "up" ? 0 : newTimeout ?? limitRef.current);
  }, [clearTick]);

  useEffect(() => clearTick, [clearTick]);

  return { start, stop, reset, seconds, elapsedSeconds, elapsedMs };
};

export default useTimer;
