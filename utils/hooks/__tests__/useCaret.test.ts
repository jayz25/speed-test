import { renderHook } from "@testing-library/react";
import { getCaretTransform, getScrollTop, useCaret } from "../useCaret";

const LINE_PX = 44;
const CARET_PX = 36;

/** jsdom has no layout: fake the offsets the hook reads. */
function letter({ left = 0, top = 0, width = 18, caret = "before" }: { left?: number; top?: number; width?: number; caret?: string } = {}) {
  const el = document.createElement("span");
  el.dataset.caret = caret;
  Object.defineProperties(el, {
    offsetLeft: { value: left }, offsetTop: { value: top }, offsetWidth: { value: width }, offsetHeight: { value: LINE_PX },
  });
  return el;
}
function caretBar() {
  const el = document.createElement("div");
  Object.defineProperty(el, "offsetHeight", { value: CARET_PX });
  return el;
}

describe("getScrollTop", () => {
  it("does not scroll while the caret is on the first two lines", () => {
    expect(getScrollTop(0)).toBe(0);
    expect(getScrollTop(54)).toBe(0);
  });
  it("keeps the caret line 54px below the top once it moves further down", () => {
    expect(getScrollTop(98)).toBe(44);
    expect(getScrollTop(186)).toBe(132);
  });
});

describe("getCaretTransform", () => {
  it("sits before the letter, vertically centred on its line", () => {
    expect(getCaretTransform(letter({ left: 36, top: 54 }), caretBar())).toBe("translate(36px, 58px)");
  });
  it("sits after the letter when the word is fully typed", () => {
    expect(getCaretTransform(letter({ left: 36, width: 18, caret: "after" }), caretBar())).toBe("translate(54px, 4px)");
  });
});

describe("useCaret", () => {
  it("scrolls the box to the caret letter and moves the caret bar there", () => {
    const box = document.createElement("div");
    const caret = caretBar();
    renderHook(() => useCaret({ boxRef: { current: box }, targetRef: { current: letter({ left: 72, top: 142 }) }, caretRef: { current: caret }, resetKey: 1, deps: [] }));
    expect(box.scrollTop).toBe(88);
    expect(caret.style.transform).toBe("translate(72px, 146px)");
  });

  it("jumps without animating on the first placement and after a reset, glides otherwise", () => {
    const box = document.createElement("div");
    const caret = caretBar();
    const target = { current: letter() };
    const { rerender } = renderHook(
      ({ resetKey, step }) => useCaret({ boxRef: { current: box }, targetRef: target, caretRef: { current: caret }, resetKey, deps: [step] }),
      { initialProps: { resetKey: 1, step: 0 } },
    );
    expect(caret.dataset.animate).toBe("false");

    target.current = letter({ left: 18 });
    rerender({ resetKey: 1, step: 1 });
    expect(caret.dataset.animate).toBe("true");
    expect(caret.style.transform).toBe("translate(18px, 4px)");

    target.current = letter();
    rerender({ resetKey: 2, step: 0 });
    expect(caret.dataset.animate).toBe("false");
  });

  it("does nothing without a caret target", () => {
    const box = document.createElement("div");
    const caret = caretBar();
    renderHook(() => useCaret({ boxRef: { current: box }, targetRef: { current: null }, caretRef: { current: caret }, resetKey: 1, deps: [] }));
    expect(box.scrollTop).toBe(0);
    expect(caret.style.transform).toBe("");
  });
});
