import { act, fireEvent, renderHook } from "@testing-library/react";
import { FOCUS_MODE_ATTR, useFocusMode } from "../useFocusMode";

const isFocusAttrSet = () => document.documentElement.hasAttribute(FOCUS_MODE_ATTR);

describe("useFocusMode", () => {
  it("is inactive while the test is not running", () => {
    const { result } = renderHook(() => useFocusMode(false));
    expect(result.current).toBe(false);
    expect(isFocusAttrSet()).toBe(false);
  });

  it("activates while running and clears when the run ends", () => {
    const { result, rerender } = renderHook(({ running }) => useFocusMode(running), {
      initialProps: { running: true },
    });
    expect(result.current).toBe(true);
    expect(isFocusAttrSet()).toBe(true);
    rerender({ running: false });
    expect(result.current).toBe(false);
    expect(isFocusAttrSet()).toBe(false);
  });

  it("is revealed by mouse movement and hidden again on the next run", () => {
    const { result, rerender } = renderHook(({ running }) => useFocusMode(running), {
      initialProps: { running: true },
    });
    act(() => {
      fireEvent.mouseMove(window);
    });
    expect(result.current).toBe(false);
    expect(isFocusAttrSet()).toBe(false);
    rerender({ running: false });
    rerender({ running: true });
    expect(result.current).toBe(true);
  });

  it("removes the attribute on unmount", () => {
    const { unmount } = renderHook(() => useFocusMode(true));
    unmount();
    expect(isFocusAttrSet()).toBe(false);
  });
});
