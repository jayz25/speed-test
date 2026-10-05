import { useCallback, useEffect, useRef, useState } from "react";

export const TIMER_TICK_MS = 100;
const DEFAULT_LIMIT_SECONDS = 60;

/**
 * Countdown based on a start timestamp (not tick counting), so it never drifts.
 * State only changes when the displayed whole second changes.
 */
const useTimer = (timeout: number) => {
  const limit = timeout || DEFAULT_LIMIT_SECONDS;
  const limitRef = useRef(limit);
  limitRef.current = limit;

  const [seconds, setSeconds] = useState(limit);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const frozenElapsedRef = useRef(0);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setSeconds(limit);
  }, [limit]);

  const elapsedMs = useCallback(() => {
    if (startedAtRef.current === null) return frozenElapsedRef.current;
    return performance.now() - startedAtRef.current;
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return; // prevent double-start
    startedAtRef.current = performance.now();
    frozenElapsedRef.current = 0;
    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - (startedAtRef.current ?? 0);
      const next = Math.max(0, Math.ceil(limitRef.current - elapsed / 1000));
      setSeconds((prev) => (prev === next ? prev : next));
      if (next === 0) {
        frozenElapsedRef.current = limitRef.current * 1000;
        startedAtRef.current = null;
        stop();
      }
    }, TIMER_TICK_MS);
  }, [stop]);

  const reset = useCallback((newTimeout?: number) => {
    stop();
    startedAtRef.current = null;
    frozenElapsedRef.current = 0;
    setSeconds(newTimeout ?? limitRef.current);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { start, reset, seconds, elapsedMs };
};

export default useTimer;
