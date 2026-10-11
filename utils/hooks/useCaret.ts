import { RefObject, useCallback, useEffect, useLayoutEffect } from "react";

/** The caret line is kept this many px below the top of the words box (second line of 44px rows). */
const CARET_TOP_OFFSET_PX = 54;

interface CaretArgs {
  /** The scrolling words box. */
  boxRef: RefObject<HTMLElement | null>;
  /** The letter carrying the caret. */
  targetRef: RefObject<HTMLElement | null>;
  /** Values that move the caret (active word/letter, words, focus, ...). */
  deps: readonly unknown[];
}

/** Pure: scrollTop that keeps the caret line near the top of the box. */
export function getScrollTop(caretOffsetTop: number): number {
  return Math.max(0, caretOffsetTop - CARET_TOP_OFFSET_PX);
}

/**
 * Scrolls the words box so the caret letter stays on the second visible line.
 * Re-runs on deps changes, box resize and font load.
 */
export function useCaret({ boxRef, targetRef, deps }: CaretArgs) {
  const scroll = useCallback(() => {
    const box = boxRef.current;
    const target = targetRef.current;
    if (!box || !target) return;
    box.scrollTop = getScrollTop(target.offsetTop);
  }, [boxRef, targetRef]);

  useLayoutEffect(scroll, [scroll, ...deps]);

  useEffect(() => {
    const box = boxRef.current;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scroll);
    if (box) observer?.observe(box);
    document.fonts?.ready.then(scroll);
    return () => observer?.disconnect();
  }, [boxRef, scroll]);
}
