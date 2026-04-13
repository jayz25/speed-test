import { useEffect, useRef, useState } from "react";

const useTimer = (timeout: number) => {
  const [seconds, setSeconds] = useState(timeout || 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSeconds(timeout || 60);
  }, [timeout]);

  const start = () => {
    if (intervalRef.current) return; // prevent double-start
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0; // Fixed: actually reaches 0 — was resetting to initialTimeout
        }
        return prev - 1;
      });
    }, 1000);
  };

  const reset = (newTimeout?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSeconds(newTimeout ?? timeout ?? 60);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { start, reset, seconds };
};

export default useTimer;
