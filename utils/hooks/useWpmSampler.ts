import { useState } from "react";
import type { EngineState } from "../typingEngine";
import { appendSample, EMPTY_SAMPLER, type WpmSample } from "../wpmSamples";

/**
 * Per-second WPM samples for the live sparkline and the result chart: one per elapsed second
 * while running, plus `finalSecond` once finished; cleared when a new round goes idle.
 * Updates state during render (React's "adjust state when props change" pattern), so the
 * returned samples are already current in the render that changed the inputs.
 */
export function useWpmSampler(state: EngineState, elapsedSeconds: number, finalSecond: number | null): readonly WpmSample[] {
  const [sampler, setSampler] = useState(EMPTY_SAMPLER);

  let next = sampler;
  if (state.status === "idle") {
    if (sampler.samples.length > 0) next = EMPTY_SAMPLER;
  } else if (state.status === "running" && elapsedSeconds >= 1) {
    next = appendSample(sampler, state, elapsedSeconds);
  } else if (state.status === "finished" && finalSecond !== null) {
    next = appendSample(sampler, state, finalSecond);
  }
  if (next !== sampler) setSampler(next);

  return next.samples;
}
