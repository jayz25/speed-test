import { renderHook } from "@testing-library/react";
import { getScrollTop, useCaret } from "../useCaret";

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

describe("useCaret", () => {
  it("scrolls the box to the caret letter", () => {
    const box = document.createElement("div");
    const target = document.createElement("span");
    Object.defineProperty(target, "offsetTop", { value: 142 });
    renderHook(() => useCaret({ boxRef: { current: box }, targetRef: { current: target }, deps: [] }));
    expect(box.scrollTop).toBe(88);
  });
  it("does nothing without a caret target", () => {
    const box = document.createElement("div");
    renderHook(() => useCaret({ boxRef: { current: box }, targetRef: { current: null }, deps: [] }));
    expect(box.scrollTop).toBe(0);
  });
});
