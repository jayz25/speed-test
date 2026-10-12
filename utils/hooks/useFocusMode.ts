import { useEffect, useState } from "react";

/** Attribute set on <html> while focus mode is active; CSS fades `[data-focus-fade]` elements. */
export const FOCUS_MODE_ATTR = "data-focus-mode";

/**
 * Focus mode: while `isRunning`, chrome marked `data-focus-fade` is hidden.
 * Moving the mouse reveals it again until the next run starts.
 */
export function useFocusMode(isRunning: boolean): boolean {
  const [isRevealed, setIsRevealed] = useState(false);
  // Hide the chrome again whenever a new run starts (adjust-state-during-render)
  const [wasRunning, setWasRunning] = useState(isRunning);
  if (wasRunning !== isRunning) {
    setWasRunning(isRunning);
    if (isRunning) setIsRevealed(false);
  }
  const isActive = isRunning && !isRevealed;

  useEffect(() => {
    if (!isRunning) return;
    const reveal = () => setIsRevealed(true);
    window.addEventListener("mousemove", reveal, { once: true });
    return () => window.removeEventListener("mousemove", reveal);
  }, [isRunning, isRevealed]);

  useEffect(() => {
    const root = document.documentElement;
    if (isActive) root.setAttribute(FOCUS_MODE_ATTR, "true");
    else root.removeAttribute(FOCUS_MODE_ATTR);
    return () => root.removeAttribute(FOCUS_MODE_ATTR);
  }, [isActive]);

  return isActive;
}
