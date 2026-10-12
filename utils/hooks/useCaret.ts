import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** The caret line is kept this many px below the top of the words box (second line of 44px rows). */
const CARET_TOP_OFFSET_PX = 54;

interface CaretArgs {
  /** The scrolling words box (the caret bar's positioned ancestor). */
  boxRef: RefObject<HTMLElement | null>;
  /** The letter carrying the caret (`data-caret="before" | "after"`). */
  targetRef: RefObject<HTMLElement | null>;
  /** The caret bar, absolutely positioned inside the box. */
  caretRef: RefObject<HTMLElement | null>;
  /** Changes on a new test: the caret jumps there instead of gliding back across the box. */
  resetKey: unknown;
  /** Values that move the caret (active word/letter, words, focus, ...). */
  deps: readonly unknown[];
}

/** Pure: scrollTop that keeps the caret line near the top of the box. */
export function getScrollTop(caretOffsetTop: number): number {
  return Math.max(0, caretOffsetTop - CARET_TOP_OFFSET_PX);
}

/** Pure: translate for the caret bar, before (or after) the target letter, centred on its line. */
export function getCaretTransform(target: HTMLElement, caret: HTMLElement): string {
  const x = target.offsetLeft + (target.dataset.caret === "after" ? target.offsetWidth : 0);
  const y = target.offsetTop + (target.offsetHeight - caret.offsetHeight) / 2;
  return `translate(${x}px, ${y}px)`;
}

/**
 * Scrolls the words box so the caret letter stays on the second visible line, and moves the
 * caret bar onto that letter. Keystrokes glide the bar (CSS transition keyed on
 * `data-animate`); the first placement, a new test, a resize or a font load jump instantly.
 */
export function useCaret({ boxRef, targetRef, caretRef, resetKey, deps }: CaretArgs) {
  const lastResetKey = useRef<unknown>(undefined);
  const hasPlaced = useRef(false);

  const place = useCallback((animate: boolean) => {
    const box = boxRef.current;
    const target = targetRef.current;
    if (!box || !target) return;
    box.scrollTop = getScrollTop(target.offsetTop);
    const caret = caretRef.current;
    if (!caret) return;
    caret.dataset.animate = String(animate);
    caret.style.transform = getCaretTransform(target, caret);
    hasPlaced.current = true;
  }, [boxRef, targetRef, caretRef]);

  useLayoutEffect(() => {
    const isSameTest = lastResetKey.current === resetKey;
    lastResetKey.current = resetKey;
    place(isSameTest && hasPlaced.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place, resetKey, ...deps]);

  useEffect(() => {
    const box = boxRef.current;
    const jump = () => place(false);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(jump);
    if (box) observer?.observe(box);
    document.fonts?.ready.then(jump);
    return () => observer?.disconnect();
  }, [boxRef, place]);
}
