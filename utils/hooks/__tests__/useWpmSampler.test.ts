import { renderHook } from "@testing-library/react";
import { createEngineState, engineReducer, type EngineAction, type EngineState } from "../../typingEngine";
import { useWpmSampler } from "../useWpmSampler";

const type = (text: string): EngineAction[] => Array.from(text, (char) => ({ type: "typeChar", char }));
const idle = createEngineState(["hello", "world"]);
const running = type("hel").reduce(engineReducer, idle);
const finished = engineReducer(running, { type: "finish" });

interface Props { state: EngineState; elapsedSeconds: number; finalSecond: number | null }

describe("useWpmSampler", () => {
  it("is empty while idle and samples once per elapsed second while running", () => {
    const { result, rerender } = renderHook((p: Props) => useWpmSampler(p.state, p.elapsedSeconds, p.finalSecond), {
      initialProps: { state: idle, elapsedSeconds: 0, finalSecond: null } as Props,
    });
    expect(result.current).toEqual([]);

    rerender({ state: running, elapsedSeconds: 0, finalSecond: null });
    expect(result.current).toEqual([]);
    rerender({ state: running, elapsedSeconds: 1, finalSecond: null });
    rerender({ state: running, elapsedSeconds: 1, finalSecond: null });
    rerender({ state: running, elapsedSeconds: 2, finalSecond: null });
    expect(result.current.map((s) => s.second)).toEqual([1, 2]);
  });

  it("adds the final second when finished and clears on the next idle round", () => {
    const { result, rerender } = renderHook((p: Props) => useWpmSampler(p.state, p.elapsedSeconds, p.finalSecond), {
      initialProps: { state: running, elapsedSeconds: 1, finalSecond: null } as Props,
    });
    rerender({ state: finished, elapsedSeconds: 1, finalSecond: 3 });
    expect(result.current.map((s) => s.second)).toEqual([1, 3]);
    const finishedSamples = result.current;
    rerender({ state: finished, elapsedSeconds: 1, finalSecond: 3 });
    expect(result.current).toBe(finishedSamples);

    rerender({ state: idle, elapsedSeconds: 0, finalSecond: null });
    expect(result.current).toEqual([]);
  });
});
