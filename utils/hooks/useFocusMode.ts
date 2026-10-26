import { useEffect, useState } from "react";

/** Attribute set on <html> while focus mode is active; CSS fades `[data-focus-fade]` elements. */
export const FOCUS_MODE_ATTR = "data-focus-mode";
/** Also set when focus mode was pinned by the user: side panels collapse, not just fade. */
export const FOCUS_PINNED_ATTR = "data-focus-pinned";

/**
 * Focus mode: while `isRunning`, chrome marked `data-focus-fade` is hidden.
 * Moving the mouse reveals it again until the next run starts.
 * `isPinned` keeps focus mode on regardless of the run or the mouse.
 */
export function useFocusMode(isRunning: boolean, isPinned = false): boolean {
  const [isRevealed, setIsRevealed] = useState(false);
  // Hide the chrome again whenever a new run starts (adjust-state-during-render)
  const [wasRunning, setWasRunning] = useState(isRunning);
  if (wasRunning !== isRunning) {
    setWasRunning(isRunning);
    if (isRunning) setIsRevealed(false);
  }
  const isActive = isPinned || (isRunning && !isRevealed);

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
    if (isPinned) root.setAttribute(FOCUS_PINNED_ATTR, "true");
    else root.removeAttribute(FOCUS_PINNED_ATTR);
    return () => {
      root.removeAttribute(FOCUS_MODE_ATTR);
      root.removeAttribute(FOCUS_PINNED_ATTR);
    };
  }, [isActive, isPinned]);

  return isActive;
}
