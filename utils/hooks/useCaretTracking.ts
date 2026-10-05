import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";

interface CaretTrackingArgs {
  cursorRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  activeWordIndex: number;
  activeLetterIndex: number;
  words: readonly string[];
  isFocused: boolean;
  isFinished: boolean;
}

/** Positions the caret on `#active-character` and scrolls when the active word wraps. */
export function useCaretTracking({ cursorRef, scrollRef, activeWordIndex, activeLetterIndex, words, isFocused, isFinished }: CaretTrackingArgs) {
  const prevTopRef = useRef<number | null>(null);
  const activeLineOffsetRef = useRef<number>(0);

  // Smooth Cursor tracking via direct DOM for zero-frame delay
  useLayoutEffect(() => {
    const el = document.getElementById("active-character");
    const cursor = cursorRef.current;
    if (el && cursor) {
      const top = el.offsetTop + 4;
      const left = el.offsetLeft;

      // Disable transition purely on line wraps to prevent diagonal flying
      if (prevTopRef.current !== null && Math.abs(prevTopRef.current - top) > 10) {
        cursor.style.transition = "none";
      } else {
        cursor.style.transition = "left 0.08s ease-out, top 0.08s ease-out";
      }

      cursor.style.top = `${top}px`;
      cursor.style.left = `${left}px`;

      prevTopRef.current = top;
    }
  }, [activeWordIndex, activeLetterIndex, cursorRef, words, isFocused, isFinished]);

  // Auto-scroll: when active word crosses to a new line, scroll down
  useEffect(() => {
    const activeEl = document.getElementById("active-character")?.parentElement;
    if (!activeEl) return;
    const top = activeEl.offsetTop;
    if (activeLineOffsetRef.current === 0) {
      activeLineOffsetRef.current = top;
    } else if (top > activeLineOffsetRef.current) {
      scrollRef.current?.scrollBy({ top: 40, behavior: "smooth" });
      activeLineOffsetRef.current = top;
    }
  }, [activeWordIndex, scrollRef]);

  const resetScrollAnchor = useCallback(() => { activeLineOffsetRef.current = 0; }, []);
  return { resetScrollAnchor };
}
