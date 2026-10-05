import { prefersReducedMotion } from "../motion";
import { RefObject, useCallback, useEffect, useLayoutEffect } from "react";

export const VISIBLE_LINES = 3;
/** Line index (0-based) at which the text starts scrolling, keeping the active line in the middle. */
const FIRST_SCROLLING_LINE = 2;
const CARET_TOP_NUDGE_PX = 4;
const LINE_WRAP_THRESHOLD_PX = 10;
const CARET_TRANSITION = "left 0.08s ease-out, top 0.08s ease-out";

interface CaretArgs {
  /** The caret element (absolutely positioned inside `containerRef`). */
  caretRef: RefObject<HTMLElement | null>;
  /** The active letter (or trailing spacer) the caret should sit on. */
  targetRef: RefObject<HTMLElement | null>;
  /** Inner words container; translated to scroll lines. */
  containerRef: RefObject<HTMLElement | null>;
  /** Clipping viewport; sized to VISIBLE_LINES lines. */
  viewportRef: RefObject<HTMLElement | null>;
  /** Values that move the caret (active word/letter, words, focus, ...). */
  deps: readonly unknown[];
}

/** Pure: translateY (px, <= 0) that keeps the active line in the middle of the viewport. */
export function getLineScrollOffset(activeLine: number, linePitch: number): number {
  if (linePitch <= 0 || activeLine < FIRST_SCROLLING_LINE) return 0;
  return -(activeLine - (FIRST_SCROLLING_LINE - 1)) * linePitch;
}

function measureLinePitch(container: HTMLElement): { firstTop: number; pitch: number } | null {
  const first = container.querySelector<HTMLElement>("[data-word]");
  if (!first || first.offsetHeight === 0) return null;
  const gap = parseFloat(getComputedStyle(container).rowGap) || 0;
  return { firstTop: first.offsetTop, pitch: first.offsetHeight + gap };
}

/**
 * Positions the caret on the active letter and scrolls the words container by whole
 * lines. Re-runs on deps changes, container resize and font load.
 */
export function useCaret({ caretRef, targetRef, containerRef, viewportRef, deps }: CaretArgs) {
  const position = useCallback(() => {
    const container = containerRef.current;
    const viewport = viewportRef.current;
    const target = targetRef.current;
    const caret = caretRef.current;
    if (!container || !viewport) return;

    const metrics = measureLinePitch(container);
    if (metrics) {
      viewport.style.height = `${VISIBLE_LINES * metrics.pitch}px`;
      const wordTop = target?.parentElement?.offsetTop ?? metrics.firstTop;
      const line = Math.round((wordTop - metrics.firstTop) / metrics.pitch);
      container.style.transform = `translateY(${getLineScrollOffset(line, metrics.pitch)}px)`;
    }

    if (!target || !caret) return;
    const top = target.offsetTop + CARET_TOP_NUDGE_PX;
    const previousTop = Number(caret.dataset.top ?? top);
    // No transition across line wraps, to prevent the caret flying diagonally
    const isWrap = Math.abs(previousTop - top) > LINE_WRAP_THRESHOLD_PX;
    caret.style.transition = isWrap || prefersReducedMotion() ? "none" : CARET_TRANSITION;
    caret.style.top = `${top}px`;
    caret.style.left = `${target.offsetLeft}px`;
    caret.dataset.top = String(top);
  }, [caretRef, targetRef, containerRef, viewportRef]);

  useLayoutEffect(position, [position, ...deps]);

  useEffect(() => {
    const container = containerRef.current;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(position);
    if (container) observer?.observe(container);
    document.fonts?.ready.then(position);
    return () => observer?.disconnect();
  }, [containerRef, position]);
}
