import { act, renderHook } from "@testing-library/react";
import { useKeystrokeTiming } from "../useKeystrokeTiming";

const down = (key: string, timeStamp: number, code = `Key${key.toUpperCase()}`, repeat = false) => ({ key, code, timeStamp, repeat });
const up = (key: string, timeStamp: number, code = `Key${key.toUpperCase()}`) => ({ key, code, timeStamp });

describe("useKeystrokeTiming", () => {
  it("records spacing between keydowns and how long each key is held", () => {
    const { result } = renderHook(() => useKeystrokeTiming());
    act(() => {
      result.current.onKeyDown(down("a", 0));
      result.current.onKeyDown(down("b", 100)); // overlaps "a": rollover is normal
      result.current.onKeyUp(up("a", 60));
      result.current.onKeyUp(up("b", 180));
      result.current.onKeyDown(down(" ", 220, "Space"));
      result.current.onKeyUp(up(" ", 260, "Space"));
    });
    expect(result.current.getStats()).toEqual({
      keySpacing: { average: 110, sd: 10 }, // 100, 120
      keyDuration: { average: 60, sd: 16.33 }, // 60, 80, 40
    });
  });

  it("ignores modifiers, navigation keys and auto-repeat, but counts Backspace and mobile keys", () => {
    const { result } = renderHook(() => useKeystrokeTiming());
    act(() => {
      result.current.onKeyDown(down("Shift", 0, "ShiftLeft"));
      result.current.onKeyDown(down("a", 10));
      result.current.onKeyDown(down("a", 40, "KeyA", true));
      result.current.onKeyDown(down("Tab", 50, "Tab"));
      result.current.onKeyDown(down("Backspace", 110, "Backspace"));
      result.current.onKeyDown(down("Unidentified", 210, ""));
      result.current.onKeyUp(up("Unidentified", 250, ""));
    });
    const { keySpacing, keyDuration } = result.current.getStats();
    expect(keySpacing).toEqual({ average: 100, sd: 0 });
    expect(keyDuration).toBeNull(); // no matched keyup with a code
  });

  it("starts over after reset", () => {
    const { result } = renderHook(() => useKeystrokeTiming());
    act(() => {
      result.current.onKeyDown(down("a", 0));
      result.current.onKeyDown(down("b", 100));
      result.current.reset();
      result.current.onKeyDown(down("c", 5000));
    });
    expect(result.current.getStats()).toEqual({ keySpacing: null, keyDuration: null });
  });
});
