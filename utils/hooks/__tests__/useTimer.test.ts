import { act, renderHook } from "@testing-library/react";
import useTimer from "../useTimer";

describe("useTimer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts at the timeout value", () => {
    const { result } = renderHook(() => useTimer(30));
    expect(result.current.seconds).toBe(30);
  });

  it("counts down once per second after start", () => {
    const { result } = renderHook(() => useTimer(30));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.seconds).toBe(27);
  });

  it("reaches exactly 0 and never goes negative", () => {
    const { result } = renderHook(() => useTimer(3));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.seconds).toBe(0);
  });

  it("ignores a second start() while running", () => {
    const { result } = renderHook(() => useTimer(10));
    act(() => {
      result.current.start();
      result.current.start();
    });
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.seconds).toBe(8);
  });

  it("reset(n) stops the interval and sets n", () => {
    const { result } = renderHook(() => useTimer(30));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(2000));
    act(() => result.current.reset(45));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.seconds).toBe(45);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("can restart after reset", () => {
    const { result } = renderHook(() => useTimer(30));
    act(() => result.current.start());
    act(() => result.current.reset());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.seconds).toBe(29);
  });

  it("clears the interval on unmount", () => {
    const { result, unmount } = renderHook(() => useTimer(30));
    act(() => result.current.start());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("follows a changed timeout prop", () => {
    const { result, rerender } = renderHook(({ t }) => useTimer(t), { initialProps: { t: 30 } });
    rerender({ t: 45 });
    expect(result.current.seconds).toBe(45);
  });

  it("does not drift when ticks are late: derives seconds from the clock", () => {
    const { result } = renderHook(() => useTimer(30));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.seconds).toBe(25);
    expect(result.current.elapsedMs()).toBeCloseTo(5000, -2);
  });

  it("only re-renders when the displayed second changes", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useTimer(30);
    });
    act(() => result.current.start());
    const before = renders;
    act(() => vi.advanceTimersByTime(1000));
    expect(renders - before).toBeLessThanOrEqual(2);
  });

  it("elapsedMs reads the clock while running and freezes at the limit", () => {
    const { result } = renderHook(() => useTimer(2));
    expect(result.current.elapsedMs()).toBe(0);
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.elapsedMs()).toBeGreaterThanOrEqual(1400);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.elapsedMs()).toBe(2000);
  });
});
